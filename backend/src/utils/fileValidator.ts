/**
 * File validation utilities for security
 * Validates file types using magic bytes, not client-supplied mimetype
 */

/**
 * File magic bytes signatures
 */
const FILE_SIGNATURES: Record<string, Buffer> = {
  // PDF: %PDF (hex: 25 50 44 46)
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]),
  // PNG: \x89PNG (hex: 89 50 4E 47)
  'image/png': Buffer.from([0x89, 0x50, 0x4E, 0x47]),
  // JPEG: \xFF\xD8\xFF (hex: FF D8 FF)
  'image/jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
  // JPG same as JPEG
  'image/jpg': Buffer.from([0xFF, 0xD8, 0xFF]),
};

/**
 * Validate file type by reading magic bytes (first 4 bytes)
 * @param buffer - File buffer
 * @param expectedMimeType - Expected MIME type to validate against
 * @returns true if file matches expected type
 */
export const validateMagicBytes = (buffer: Buffer, expectedMimeType: string): boolean => {
  const signature = FILE_SIGNATURES[expectedMimeType];
  if (!signature) {
    // Unknown file type, allow but log warning
    console.warn(`Unknown file type: ${expectedMimeType}`);
    return true;
  }

  // Compare first bytes with signature
  const header = buffer.slice(0, signature.length);
  return header.equals(signature);
};

/**
 * Validate PDF file using magic bytes
 * @param buffer - File buffer
 * @returns true if it's a valid PDF
 */
export const isValidPdf = (buffer: Buffer): boolean => {
  return validateMagicBytes(buffer, 'application/pdf');
};

/**
 * Validate image file (PNG or JPEG)
 * @param buffer - File buffer
 * @returns true if it's a valid image
 */
export const isValidImage = (buffer: Buffer): boolean => {
  const validPng = validateMagicBytes(buffer, 'image/png');
  const validJpeg = validateMagicBytes(buffer, 'image/jpeg');
  return validPng || validJpeg;
};

/**
 * Validate file from buffer against expected type
 * @param buffer - File buffer
 * @param expectedMimeType - Expected MIME type (e.g., 'application/pdf')
 * @returns Validation result
 */
export const validateFileType = (
  buffer: Buffer,
  expectedMimeType: string
): { valid: boolean; error?: string } => {
  const isValid = validateMagicBytes(buffer, expectedMimeType);

  if (!isValid) {
    return {
      valid: false,
      error: `El archivo no es un ${expectedMimeType} válido`,
    };
  }

  return { valid: true };
};