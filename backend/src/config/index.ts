import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  
  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    apiSecret: process.env.CLOUDINARY_API_SECRET!,
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  rateLimits: {
    auth: { max: 10, windowMs: 15 * 60 * 1000 },
    upload: { max: 5, windowMs: 60 * 60 * 1000 },
    ai: { max: 3, windowMs: 60 * 60 * 1000 },
    vote: { max: 50, windowMs: 24 * 60 * 60 * 1000 },
  },
};
