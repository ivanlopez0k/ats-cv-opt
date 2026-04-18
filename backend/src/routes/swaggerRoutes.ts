/**
 * Swagger/OpenAPI configuration
 */
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Router } from 'express';
import { config } from '../config/index.js';

const router = Router();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CVMaster API',
      description: 'API para optimizar CVs con IA para pasar filtros ATS',
      version: '1.0.0',
      contact: {
        name: 'CVMaster',
      },
    },
    servers: [
      {
        url: config.frontend.url.replace('3000', '4000'),
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Autenticación' },
      { name: 'CVs', description: 'Gestión de CVs' },
      { name: 'AI', description: 'Análisis con IA' },
      { name: 'Community', description: 'Comunidad' },
      { name: 'Admin', description: 'Administración' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Endpoint para servir swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .op-summary { background: #f5f5f5; }',
  customSiteTitle: 'CVMaster API Docs',
}));

// Endpoint para obtener el spec JSON
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;