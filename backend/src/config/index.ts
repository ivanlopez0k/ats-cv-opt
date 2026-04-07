import dotenv from 'dotenv';

dotenv.config();

const envBool = (key: string, fallback: boolean): boolean => {
  const val = process.env[key];
  if (val === undefined) return fallback;
  return val === 'true' || val === '1';
};

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
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

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@cvmaster.com',
  },

  rateLimits: {
    auth: { max: 10, windowMs: 15 * 60 * 1000 },
    upload: { max: 5, windowMs: 60 * 60 * 1000 },
    ai: { max: 3, windowMs: 60 * 60 * 1000 },
    vote: { max: 50, windowMs: 24 * 60 * 60 * 1000 },
  },

  // ============================================================
  // SECURITY TOGGLES
  // Set to 'false' during development for faster testing.
  // Enable all in production by setting these to 'true' in .env.
  // ============================================================
  security: {
    // Rate limiting on auth endpoints (uses Redis if available)
    rateLimitEnabled: envBool('SECURITY_RATE_LIMIT', false),

    // Require strong passwords (uppercase, number, special char)
    passwordStrengthEnabled: envBool('SECURITY_PASSWORD_STRENGTH', false),

    // Lock account after N failed login attempts
    accountLockoutEnabled: envBool('SECURITY_ACCOUNT_LOCKOUT', false),
    accountLockoutMaxAttempts: parseInt(process.env.ACCOUNT_LOCKOUT_MAX_ATTEMPTS || '5', 10),
    accountLockoutDurationMs: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION_MS || String(15 * 60 * 1000), 10),

    // Detect refresh token reuse (indicator of token theft)
    tokenReuseDetectionEnabled: envBool('SECURITY_TOKEN_REUSE_DETECTION', false),

    // Require email verification before full access
    emailVerificationEnabled: envBool('SECURITY_EMAIL_VERIFICATION', false),

    // Log security events to AuditLog table
    auditLogEnabled: envBool('SECURITY_AUDIT_LOG', false),

    // Use HttpOnly Secure Cookies instead of sending tokens in body
    secureCookiesEnabled: envBool('SECURITY_SECURE_COOKIES', false),
    cookieSecret: process.env.COOKIE_SECRET || process.env.JWT_SECRET!,
  },
};
