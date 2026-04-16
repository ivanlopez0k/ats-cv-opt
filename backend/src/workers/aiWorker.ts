import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/index.js';
import { prisma } from '../services/userService.js';
import { extractTextFromPDF } from '../utils/pdf.js';
import { aiService } from '../services/index.js';
import { renderCVToHTML } from '../services/htmlTemplateService.js';
import { renderHTMLToPDF } from '../services/pdfRenderer.js';
import { uploadToCloudinary, uploadHtmlToCloudinary } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';
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
        logger.warn(`⚠️ Rate limit hit. Retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
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
    const { cvId, userId, targetJob, targetIndustry, originalPdfUrl, originalPdfPublicId, pdfBufferBase64, template } = job.data;

    logger.info(`Processing CV ${cvId}...`);

    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new Error('CV not found');

    try {
      // Get PDF buffer: either from job data (base64) or download from Cloudinary
      let pdfBuffer: Buffer;
      
      if (pdfBufferBase64) {
        // Use buffer passed directly from upload (most efficient)
        logger.info(`📦 Using PDF buffer from job data`);
        pdfBuffer = Buffer.from(pdfBufferBase64, 'base64');
      } else if (originalPdfPublicId) {
        // Fallback: download from Cloudinary API
        logger.info(`⬇️ Downloading PDF from Cloudinary: ${originalPdfPublicId}`);
        const { downloadFromCloudinaryApi } = await import('../utils/cloudinary.js');
        pdfBuffer = await downloadFromCloudinaryApi(originalPdfPublicId);
      } else {
        // Last resort: try downloading from URL (may fail for private resources)
        logger.info(`⬇️ Downloading PDF from URL: ${originalPdfUrl || cv.originalPdfUrl}`);
        pdfBuffer = await downloadBuffer(originalPdfUrl || cv.originalPdfUrl);
      }

      const extracted = await extractTextFromPDF(pdfBuffer);

      logger.info(`Extracted ${extracted.text.length} characters from PDF`);

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
          logger.warn(`⚠️ Local LLM failed to produce valid JSON, falling back to mock results`);
          const { generateMockAnalysis } = await import('../services/aiService.js');
          improvement = await generateMockAnalysis(extracted.text, targetJob, targetIndustry);
        } else {
          throw error;
        }
      }

      logger.info(`✅ AI analysis complete. Score: ${improvement.analysis.score}/100`);

      // Step 2: Render CV to HTML with user's selected template
      logger.info(`🎨 Rendering CV to HTML with ${template || 'modern'} template...`);
      const htmlContent = renderCVToHTML(improvement, {
        template: (template || 'modern').toLowerCase() as 'modern' | 'classic' | 'minimal',
        accentColor: '#2563eb',
      });

      // Step 3: Render HTML to PDF using Puppeteer
      logger.info(`📄 Generating PDF from HTML...`);
      const improvedPdfBuffer = await renderHTMLToPDF(htmlContent);

      // Step 4: Upload improved PDF to Cloudinary
      logger.info(`📤 Uploading improved PDF to Cloudinary...`);
      const improvedFilename = `${userId}/improved-${cvId}.pdf`;
      const improvedPdfResult = await uploadToCloudinary(improvedPdfBuffer, improvedFilename, 'cvmaster/improved');

      // Also save the HTML for preview (upload to Cloudinary as HTML)
      logger.info(`📤 Uploading HTML preview to Cloudinary...`);
      const htmlFilename = `${userId}/improved-${cvId}`;
      const htmlResult = await uploadHtmlToCloudinary(htmlContent, htmlFilename, 'cvmaster/html');

      await prisma.cV.update({
        where: { id: cvId },
        data: {
          status: 'COMPLETED' as const,
          improvedPdfUrl: improvedPdfResult.url,
          template: (template || 'MODERN').toUpperCase() as 'MODERN' | 'CLASSIC' | 'MINIMAL',
          improvedJson: {
            ...improvement.structuredCV,
            htmlUrl: htmlResult.url,
          } as any,
          analysisResult: improvement.analysis as any,
        },
      });

      logger.info(`✅ CV ${cvId} processed successfully`);
    } catch (error: any) {
      logger.error(`❌ Error processing CV ${cvId}:`, error);

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
  logger.info(`✅ Job ${job.id} completed`);
});

aiWorker.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} failed:`, err.message);
});

export { aiWorker };
