import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuración de Swagger/OpenAPI.
 * Los endpoints se documentan mediante comentarios @swagger en cada archivo de rutas.
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API RESTful para gestión de tareas personales con autenticación JWT.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/api/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
