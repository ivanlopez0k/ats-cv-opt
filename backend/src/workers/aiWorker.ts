import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { prisma } from '../services/userService.js';
import { extractTextFromPDF, createPDFFromText } from '../utils/pdf.js';
import { uploadToCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';
import { aiService } from '../services/index.js';
import https from 'https';

const connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null });

const downloadBuffer = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

const aiWorker = new Worker(
  'ai-processing',
  async (job) => {
    const { cvId, targetJob, targetIndustry } = job.data;

    console.log(`Processing CV ${cvId}...`);

    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new Error('CV not found');

    try {
      const pdfBuffer = await downloadBuffer(cv.originalPdfUrl);
      const extracted = await extractTextFromPDF(pdfBuffer);

      const improvement = await aiService.improveCV(
        extracted.text,
        targetJob,
        targetIndustry
      );

      const improvedPdfBuffer = await createPDFFromText(improvement.improvedText);
      const { url: improvedPdfUrl } = await uploadToCloudinary(
        improvedPdfBuffer,
        `improved-${cvId}`,
        'cvmaster/improved'
      );

      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: 'COMPLETED',
          improvedPdfUrl,
          improvedJson: improvement.structuredCV,
          analysisResult: improvement.analysis,
        },
      });

      console.log(`CV ${cvId} processed successfully`);
    } catch (error) {
      console.error(`Error processing CV ${cvId}:`, error);

      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: 'FAILED',
          analysisResult: { error: 'Processing failed' },
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

aiWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

aiWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

export { aiWorker };
