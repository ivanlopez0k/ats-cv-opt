import pdfParse from 'pdf-parse';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ExtractedPDF {
  text: string;
  pages: number;
  info: Record<string, unknown>;
}

export const extractTextFromPDF = async (pdfBuffer: Buffer): Promise<ExtractedPDF> => {
  const data = await pdfParse(pdfBuffer);
  
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info,
  };
};

export const createPDFFromText = async (
  text: string,
  options: {
    fontSize?: number;
    lineHeight?: number;
    margin?: number;
  } = {}
): Promise<Buffer> => {
  const { fontSize = 11, lineHeight = 14, margin = 50 } = options;

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const maxLineWidth = pageWidth - margin * 2;

  const lines = text.split('\n');
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;

  const drawText = (
    page: typeof currentPage,
    line: string,
    y: number
  ): number => {
    const words = line.split(' ');
    let currentLine = '';
    let newY = y;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxLineWidth && currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: newY,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        newY -= lineHeight;
        currentLine = word;

        if (newY < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          newY = pageHeight - margin;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: margin,
        y: newY,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      newY -= lineHeight;
    }

    return newY;
  };

  for (const line of lines) {
    if (line.trim() === '') {
      yPosition -= lineHeight * 0.5;
      if (yPosition < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      continue;
    }

    yPosition = drawText(currentPage, line, yPosition);

    if (yPosition < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

export const validatePDF = async (fileBuffer: Buffer): Promise<boolean> => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.pages > 0 && data.pages <= 5;
  } catch {
    return false;
  }
};
