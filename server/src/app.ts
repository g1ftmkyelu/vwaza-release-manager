import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Pool } from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import jwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifySensible from '@fastify/sensible';
import fastifyCors from '@fastify/cors';
import { FastifyRateLimitOptions, errorResponseBuilderContext as RateLimitErrorResponseBuilderContext } from '@fastify/rate-limit';
import { StandardErrorResponse, UserRole } from '../shared/types';


dotenv.config({ path: '../.env' });

// Import plugins and routes
import dbPlugin from './plugins/db';
import authPlugin from './plugins/auth';
import cloudinaryPlugin from './plugins/cloudinary';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import releaseRoutes from './routes/releaseRoutes';
import trackRoutes from './routes/trackRoutes';
import publicRoutes from './routes/publicRoutes';


declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
    cloudinary: typeof cloudinary;
    httpErrors: typeof import('@fastify/sensible')['httpErrors'];
  }
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
  // Augment RouteShorthandOptions to include rateLimit
  interface RouteShorthandOptions {
    rateLimit?: FastifyRateLimitOptions['routeOptions'];
  }
}


declare module '@fastify/rate-limit' {
  interface errorResponseBuilderContext {
    timeWindow: number; 
  }
}

const fastify: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname'
      }
    }
  }
});

// Register Swagger
fastify.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'VRMS API',
      description: 'Vwaza Release Manager API documentation',
      version: '1.0.0',
    },
    host: `localhost:${process.env.PORT || '6155'}`,
    schemes: ['http'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
  },
});

fastify.register(fastifySwaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});


// Register plugins
fastify.register(dbPlugin);
fastify.register(authPlugin);
fastify.register(cloudinaryPlugin);
fastify.register(fastifyMultipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: 200 * 1024 * 1024, // Set global file size limit to 200 MB
  },
}); // For file uploads
fastify.register(fastifyRateLimit, {
  global: false, // Apply rate limits per route or per plugin
  errorResponseBuilder: (request, context) => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `You have exceeded the request limit of ${context.max} requests per ${context.timeWindow / 1000} seconds.`,
    };
  },
});
fastify.register(fastifySensible); 


fastify.register(fastifyCors, {
  origin: 'http://localhost:3000', // Allow requests from your frontend development server
  credentials: true, // Allow sending cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow necessary headers
});

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  request.log.error({ error, request: request.raw }, 'Global error handler caught an error');

  // Default error response
  let statusCode = error.statusCode || 500;
  let errorMessage = 'An unexpected error occurred.';
  let errorName = 'InternalServerError';
  let details: string | undefined;

  // Fastify validation errors
  if (error.validation) {
    statusCode = 400;
    errorName = 'BadRequest';
    errorMessage = 'Validation Failed';
    details = error.message; // Fastify validation errors often have detailed messages
  } else if (error.code === '23505') { // PostgreSQL unique violation error code
    statusCode = 409;
    errorName = 'Conflict';
    errorMessage = 'A resource with this unique identifier already exists.';
    details = (error as any).detail || error.message; // Cast to any to access 'detail'
  } else if (error.code === '22P02') { // PostgreSQL invalid text representation (e.g., invalid UUID)
    statusCode = 400;
    errorName = 'BadRequest';
    errorMessage = 'Invalid input format.';
    details = error.message;
  } else if (error.name === 'UnauthorizedError' || error.name === 'FastifyJWTNoAuthorizationInHeaderError' || error.name === 'FastifyJWTTokenExpiredError') {
    statusCode = 401;
    errorName = 'Unauthorized';
    errorMessage = 'Authentication required or token is invalid/expired.';
    details = error.message;
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorName = 'Forbidden';
    errorMessage = 'You do not have permission to access this resource.';
    details = error.message;
  } else if (error.statusCode) { 
    errorMessage = error.message;
    errorName = error.name;
    details = error.message;
  } else {
    // Generic server error
    errorMessage = 'An unexpected server error occurred.';
    errorName = 'InternalServerError';
  }

  const errorResponse: StandardErrorResponse = {
    statusCode: statusCode,
    error: errorName,
    message: errorMessage,
  };

  // In development, provide more details
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = details || error.message;
    errorResponse.stack = error.stack;
  }

  reply.status(statusCode).send(errorResponse);
});


// Register routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(userRoutes, { prefix: '/users' });
fastify.register(releaseRoutes, { prefix: '/releases' });
fastify.register(trackRoutes, { prefix: '/tracks' });
fastify.register(publicRoutes, { prefix: '/public' });


fastify.get('/', async (request, reply) => {
  return { hello: 'Vwaza Release Manager API' };
});

fastify.get('/health', async (request, reply) => {
  try {
    await fastify.db.query('SELECT 1');
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  } catch (error: unknown) { 
    fastify.log.error({ message: 'Database health check failed:', error: error });

    throw fastify.httpErrors.internalServerError(`Database connection failed: ${(error as Error).message}`);
  }
});


fastify.get('/favicon.ico', async (request, reply) => {
  reply.code(204).send();
});


const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '6155'), host: '0.0.0.0' });
    fastify.log.info(`Swagger UI available at http://localhost:${process.env.PORT || '6155'}/documentation`);
    
  
    fastify.ready(() => {
      console.log('\n=== Registered Routes ===');
      console.log(fastify.printRoutes());
      console.log('========================\n');
    });
  } catch (err: unknown) { 
    fastify.log.error({ message: 'Failed to start server:', error: err });
    process.exit(1);
  }
};

start();