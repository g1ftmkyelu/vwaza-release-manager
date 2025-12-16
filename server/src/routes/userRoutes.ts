import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { userController } from '../controllers/userController';
import { PaginationOptions, StandardErrorResponse } from '@shared/types';
import { UserCreatePayload, UserUpdatePayload } from '../types';

async function userRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('onRequest', fastify.authenticate); 
  const generalApiRateLimit = {
    max: 100,
    timeWindow: 15 * 60 * 1000, 
    keyGenerator: (request: FastifyRequest) => request.user?.id || request.ip, 
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
        message: { type: 'string', example: 'Authentication required or token is invalid/expired.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Unauthorized',
    },
    403: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 403 },
        error: { type: 'string', example: 'Forbidden' },
        message: { type: 'string', example: 'Only ADMIN can create users.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Forbidden',
    },
    404: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 404 },
        error: { type: 'string', example: 'Not Found' },
        message: { type: 'string', example: 'User not found.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Not Found',
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
        message: { type: 'string', example: 'You have exceeded the request limit of 100 requests per 900 seconds.' },
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


  const createUserSchema = {
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
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ARTIST', 'ADMIN'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Users'],
    summary: 'Create a new user (ADMIN only)',
    description: 'Allows an ADMIN to create a new user with a specified role.',
    security: [{ BearerAuth: [] }],
  };

  // Schema for updating a user
  const updateUserSchema = {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', description: 'New email address' },
        password_hash: { type: 'string', minLength: 8, description: 'New password (min 8 characters)' },
        role: { type: 'string', enum: ['ARTIST', 'ADMIN'], description: 'New role (ADMIN only)' },
      },
    },
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the user to update' },
      },
      required: ['id'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ARTIST', 'ADMIN'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Users'],
    summary: 'Update a user',
    description: 'Allows a user to update their own profile, or an ADMIN to update any user profile. Non-ADMIN users cannot change their role.',
    security: [{ BearerAuth: [] }],
  };

  // Schema for getting all users with pagination
  const getAllUsersSchema = {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Number of items per page' },
        orderBy: { type: 'string', enum: ['created_at', 'email', 'role'], default: 'created_at', description: 'Field to order by' },
        orderDirection: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC', description: 'Order direction' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['ARTIST', 'ADMIN'] },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Users'],
    summary: 'Get all users (ADMIN only)',
    description: 'Retrieves a paginated list of all users. Only accessible by ADMINs.',
    security: [{ BearerAuth: [] }],
  };

  const getUserByIdSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the user to retrieve' },
      },
      required: ['id'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ARTIST', 'ADMIN'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Users'],
    summary: 'Get a user by ID',
    description: 'Retrieves details for a specific user by ID. Users can only view their own profile unless they are an ADMIN.',
    security: [{ BearerAuth: [] }],
  };

  const deleteUserSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the user to delete' },
      },
      required: ['id'],
    },
    response: {
      204: {
        type: 'null',
        description: 'No Content',
      },
      ...commonErrorResponses,
    },
    tags: ['Users'],
    summary: 'Delete a user (ADMIN only)',
    description: 'Allows an ADMIN to delete a user. ADMINs cannot delete their own account.',
    security: [{ BearerAuth: [] }],
  };

  fastify.post<{ Body: UserCreatePayload }>('/', { onRequest: fastify.authorize(['ADMIN']), schema: createUserSchema, rateLimit: generalApiRateLimit }, userController.createUser);
  fastify.get<{ Querystring: PaginationOptions }>('/', { onRequest: fastify.authorize(['ADMIN']), schema: getAllUsersSchema, rateLimit: generalApiRateLimit }, userController.getAllUsers);
  fastify.get<{ Params: { id: string } }>('/:id', { schema: getUserByIdSchema, rateLimit: generalApiRateLimit }, userController.getUserById); 
  fastify.put<{ Params: { id: string }; Body: UserUpdatePayload }>('/:id', { schema: updateUserSchema, rateLimit: generalApiRateLimit }, userController.updateUser); 
  fastify.delete<{ Params: { id: string } }>('/:id', { onRequest: fastify.authorize(['ADMIN']), schema: deleteUserSchema, rateLimit: generalApiRateLimit }, userController.deleteUser); 
}

export default userRoutes;