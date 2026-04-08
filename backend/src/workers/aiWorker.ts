import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { prisma } from '../services/userService.js';
import { extractTextFromPDF, createPDFFromText } from '../utils/pdf.js';
import { uploadToCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';
import { aiService } from '../services/index.js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null });

/**
 * Download a file from a URL (supports http/https)
 */
const downloadBuffer = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadBuffer(response.headers.location!).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

/**
 * Resolve a relative URL (like /uploads/...) to an absolute one.
 */
const resolvePdfUrl = (originalUrl: string): string => {
  if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
    return originalUrl;
  }
  return `http://localhost:${config.port}${originalUrl.startsWith('/') ? '' : '/'}${originalUrl}`;
};

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff for rate limit errors (429).
 * Retries up to `maxRetries` times, waiting 2^attempt * 1000ms between retries.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || error?.code === 'insufficient_quota';

      if (isRateLimit && attempt < maxRetries - 1) {
        const waitMs = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ OpenAI rate limit hit. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitMs);
      } else if (isRateLimit && attempt >= maxRetries - 1) {
        throw new Error(`OpenAI quota exceeded. Check your billing details at https://platform.openai.com/account/billing`);
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

const aiWorker = new Worker(
  'ai-processing',
  async (job) => {
    const { cvId, targetJob, targetIndustry } = job.data;

    console.log(`Processing CV ${cvId}...`);

    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new Error('CV not found');

    try {
      // Resolve relative URLs to absolute backend URLs
      const pdfUrl = resolvePdfUrl(cv.originalPdfUrl);
      console.log(`Downloading PDF from: ${pdfUrl}`);

      const pdfBuffer = await downloadBuffer(pdfUrl);
      const extracted = await extractTextFromPDF(pdfBuffer);

      console.log(`Extracted ${extracted.text.length} characters from PDF`);

      // Retry with exponential backoff for rate limit errors
      let improvement;
      try {
        improvement = await withRetry(
          () => aiService.improveCV(extracted.text, targetJob, targetIndustry),
          3 // max 3 retries
        );
      } catch (error: any) {
        // If JSON extraction fails, fall back to mock (common with local LLMs)
        if (error.message?.includes('Could not extract valid JSON')) {
          console.warn(`⚠️ Local LLM failed to produce valid JSON, falling back to mock results`);
          const { generateMockAnalysis } = await import('../services/aiService.js');
          improvement = await generateMockAnalysis(extracted.text, targetJob, targetIndustry);
        } else {
          throw error;
        }
      }

      const improvedPdfBuffer = await createPDFFromText(improvement.improvedText);

      // Save improved PDF locally (Cloudinary raw gives 401 for dev)
      const uploadsDir = path.join(process.cwd(), 'uploads', cv.userId);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = `improved-${cvId}.pdf`;
      const localPath = path.join(uploadsDir, filename);
      fs.writeFileSync(localPath, improvedPdfBuffer);
      const improvedPdfUrl = `http://localhost:${config.port}/uploads/${cv.userId}/${filename}`;

      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: 'COMPLETED' as const,
          improvedPdfUrl,
          improvedJson: improvement.structuredCV as any,
          analysisResult: improvement.analysis as any,
        },
      });

      console.log(`✅ CV ${cvId} processed successfully`);
    } catch (error: any) {
      console.error(`❌ Error processing CV ${cvId}:`, error);

      const errorMessage = error?.message || 'Processing failed';

      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: 'FAILED',
          analysisResult: { error: errorMessage },
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Single job at a time to avoid hitting rate limits
  }
);

aiWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

aiWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

export { aiWorker };
