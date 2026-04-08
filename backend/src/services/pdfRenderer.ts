/**
 * PDF Renderer Service using Puppeteer.
 * Renders HTML content to high-quality PDF files.
 */

import puppeteer from 'puppeteer';

export interface PDFRenderOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}

const DEFAULT_OPTIONS: PDFRenderOptions = {
  format: 'A4',
  margin: {
    top: '0mm',
    right: '0mm',
    bottom: '0mm',
    left: '0mm',
  },
  printBackground: true,
};

/**
 * Render HTML content to PDF buffer using Puppeteer.
 */
export async function renderHTMLToPDF(
  html: string,
  options: PDFRenderOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height
      deviceScaleFactor: 2, // Higher quality
    });

    // Set content and wait for fonts
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait a bit for any animations/fonts to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: mergedOptions.format,
      margin: mergedOptions.margin,
      printBackground: mergedOptions.printBackground,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Render HTML and save directly to file.
 */
export async function renderHTMLToPDFFile(
  html: string,
  outputPath: string,
  options: PDFRenderOptions = {}
): Promise<void> {
  const pdfBuffer = await renderHTMLToPDF(html, options);
  
  const fs = await import('fs');
  fs.writeFileSync(outputPath, pdfBuffer);
}
