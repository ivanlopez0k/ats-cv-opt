import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { prisma } from '../services/userService.js';
import { extractTextFromPDF } from '../utils/pdf.js';
import { aiService } from '../services/index.js';
import { renderCVToHTML } from '../services/htmlTemplateService.js';
import { renderHTMLToPDF } from '../services/pdfRenderer.js';
import { uploadToCloudinary, uploadHtmlToCloudinary } from '../utils/cloudinary.js';
import https from 'https';
import http from 'http';

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
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff for rate limit errors (429).
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
        console.warn(`⚠️ Rate limit hit. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitMs);
      } else if (isRateLimit && attempt >= maxRetries - 1) {
        throw new Error(`Quota exceeded. Check your API credits.`);
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
    const { cvId, userId, targetJob, targetIndustry, originalPdfUrl } = job.data;

    console.log(`Processing CV ${cvId}...`);

    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new Error('CV not found');

    try {
      // Download PDF from Cloudinary URL
      const pdfUrl = originalPdfUrl || cv.originalPdfUrl;
      console.log(`Downloading PDF from: ${pdfUrl}`);

      const pdfBuffer = await downloadBuffer(pdfUrl);
      const extracted = await extractTextFromPDF(pdfBuffer);

      console.log(`Extracted ${extracted.text.length} characters from PDF`);

      // Step 1: AI analysis and improvement (structured data)
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

      console.log(`✅ AI analysis complete. Score: ${improvement.analysis.score}/100`);

      // Step 2: Render CV to HTML with professional template
      console.log(`🎨 Rendering CV to HTML with modern template...`);
      const htmlContent = renderCVToHTML(improvement, {
        template: 'modern',
        accentColor: '#2563eb',
      });

      // Step 3: Render HTML to PDF using Puppeteer
      console.log(`📄 Generating PDF from HTML...`);
      const improvedPdfBuffer = await renderHTMLToPDF(htmlContent);

      // Step 4: Upload improved PDF to Cloudinary
      console.log(`📤 Uploading improved PDF to Cloudinary...`);
      const improvedFilename = `${userId}/improved-${cvId}.pdf`;
      const improvedPdfResult = await uploadToCloudinary(improvedPdfBuffer, improvedFilename, 'cvmaster/improved');

      // Also save the HTML for preview (upload to Cloudinary as HTML)
      console.log(`📤 Uploading HTML preview to Cloudinary...`);
      const htmlFilename = `${userId}/improved-${cvId}`;
      const htmlResult = await uploadHtmlToCloudinary(htmlContent, htmlFilename, 'cvmaster/html');

      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: 'COMPLETED' as const,
          improvedPdfUrl: improvedPdfResult.url,
          improvedJson: {
            ...improvement.structuredCV,
            htmlUrl: htmlResult.url,
          } as any,
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
    concurrency: 1, // Single job at a time to avoid rate limits and memory issues
  }
);

aiWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

aiWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

export { aiWorker };
