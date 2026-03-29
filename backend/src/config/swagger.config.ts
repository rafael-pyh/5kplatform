import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '5K Platform API',
      version: '1.0.0',
      description: 'API da plataforma 5K - Sistema de gestão de vendedores e leads',
      contact: {
        name: 'Support',
        email: 'support@5kplatform.com',
      },
    },
    servers: [
      {
        url: 'https://5kenergiasolar.up.railway.app',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
      },
      {
        url: 'https://5kplatform.vercel.app',
        description: 'Frontend Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
