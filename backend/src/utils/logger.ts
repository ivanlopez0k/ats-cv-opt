/**
 * Structured logging utility using Winston.
 * Provides consistent, JSON-formatted logs for production
 * and colored, readable logs for development.
 */

import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Define custom log levels with priorities
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level colors for development
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Common format for all logs (timestamp + errors with stack)
const commonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
);

// Production format: JSON (parseable by external tools)
const productionFormat = winston.format.combine(
  commonFormat,
  winston.format.json(),
);

// Development format: Colored and human-readable
const developmentFormat = winston.format.combine(
  commonFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }),
);

// Create the logger instance
export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  format: commonFormat,
  transports: [
    // Error logs - only errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs - everything
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on unhandled errors
  exitOnError: false,
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: developmentFormat,
    })
  );
} else {
  // In production, still show errors and warns to console
  logger.add(
    new winston.transports.Console({
      level: 'warn',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      ),
    })
  );
}

/**
 * Request logging middleware.
 * Generates a unique requestId for each request and logs it.
 */
export function requestLogger(req: any, res: any, next: () => void) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  req.requestId = requestId;

  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'http';

    logger.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode}`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || null,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
}
