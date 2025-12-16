import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { authController } from '../controllers/authController';
import { AuthPayload, StandardErrorResponse } from '@shared/types';
import { UserCreatePayload } from '../types';

async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

  const authRateLimit = {
    max: 5,
    timeWindow: 15 * 60 * 1000, 
    keyGenerator: (request: FastifyRequest) => request.ip, 
  };


  const commonErrorResponses = {
    400: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Email, password, and role are required.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Bad Request',
    },
    401: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 401 },
        error: { type: 'string', example: 'Unauthorized' },
        message: { type: 'string', example: 'Invalid credentials.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Unauthorized',
    },
    409: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 409 },
        error: { type: 'string', example: 'Conflict' },
        message: { type: 'string', example: 'User with this email already exists.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Conflict',
    },
    429: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 429 },
        error: { type: 'string', example: 'Too Many Requests' },
        message: { type: 'string', example: 'You have exceeded the request limit of 5 requests per 900 seconds.' },
      },
      description: 'Too Many Requests',
    },
    500: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 500 },
        error: { type: 'string', example: 'InternalServerError' },
        message: { type: 'string', example: 'An unexpected server error occurred.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Internal Server Error',
    },
  };


  const registerSchema = {
    body: {
      type: 'object',
      required: ['email', 'password_hash', 'role'],
      properties: {
        email: { type: 'string', format: 'email', description: 'User email address' },
        password_hash: { type: 'string', minLength: 8, description: 'User password (min 8 characters)' },
        role: { type: 'string', enum: ['ARTIST', 'ADMIN'], description: 'User role' },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['ARTIST', 'ADMIN'] },
            },
          },
          token: { type: 'string' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Auth'],
    summary: 'Register a new user',
    description: 'Registers a new user with the specified email, password, and role. Returns a JWT token upon successful registration.',
  };


  const loginSchema = {
    body: {
      type: 'object',
      required: ['email', 'password_hash'],
      properties: {
        email: { type: 'string', format: 'email', description: 'User email address' },
        password_hash: { type: 'string', description: 'User password' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['ARTIST', 'ADMIN'] },
            },
          },
          token: { type: 'string' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Auth'],
    summary: 'Log in a user',
    description: 'Authenticates a user with email and password. Returns a JWT token upon successful login.',
  };

  fastify.post<{ Body: UserCreatePayload }>('/register', { schema: registerSchema, rateLimit: authRateLimit }, authController.register);
  fastify.post<{ Body: AuthPayload }>('/login', { schema: loginSchema, rateLimit: authRateLimit }, authController.login);
}

export default authRoutes;