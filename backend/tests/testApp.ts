import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './src/config/index.js';
import routes from './src/routes/index.js';
import { errorHandler } from './src/middlewares/index.js';

/**
 * Create Express app for testing (without starting server or workers)
 */
export function createTestApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: config.frontend.url,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);
  app.use(errorHandler);

  return app;
}
