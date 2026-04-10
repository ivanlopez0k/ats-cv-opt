import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import https from 'https';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'cvmaster'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        // For PDFs (raw resources), keep the .pdf extension in the public_id
        // so the download URL preserves the extension
        public_id: filename,
        resource_type: 'raw',
        format: 'pdf', // Force PDF format in the URL
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const folderParts = parts.slice(parts.indexOf('upload') + 1, -1);
  return [...folderParts, filename.replace(/\.[^/.]+$/, '')].join('/');
};

export const downloadFromCloudinary = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            const chunks: Buffer[] = [];
            redirectResponse.on('data', (chunk) => chunks.push(chunk));
            redirectResponse.on('end', () => resolve(Buffer.concat(chunks)));
            redirectResponse.on('error', reject);
          }).on('error', reject);
          return;
        }
      }
      
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

/**
 * Download a file from Cloudinary using the API (for private/raw resources)
 */
export const downloadFromCloudinaryApi = async (publicId: string, resourceType: string = 'raw'): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resource(publicId, { resource_type: resourceType }, (error: any, result: any) => {
      if (error) return reject(error);
      
      // Get the secure URL and download it
      const secureUrl = result.secure_url;
      if (!secureUrl) return reject(new Error('No secure URL found'));
      
      https.get(secureUrl, (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });
  });
};

export const uploadHtmlToCloudinary = async (
  htmlContent: string,
  filename: string,
  folder: string = 'cvmaster/html'
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'raw',
        format: 'html',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(Buffer.from(htmlContent, 'utf-8'));
  });
};

export { cloudinary };
