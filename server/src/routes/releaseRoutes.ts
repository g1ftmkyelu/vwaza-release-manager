import { FastifyInstance, FastifyPluginOptions, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { releaseController } from '../controllers/releaseController';
import { PaginationOptions, StandardErrorResponse } from '@shared/types';
import { ReleaseCreatePayload, ReleaseUpdatePayload, AdminReleaseStatusUpdatePayload } from '../types';
import { MultipartFile } from '@fastify/multipart';

// Helper function to extract multipart field values
const extractMultipartValue = (field: any): any => {
  if (field && typeof field === 'object' && 'value' in field) {
    return field.value;
  }
  return field;
};

async function releaseRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('onRequest', fastify.authenticate); 
  const generalApiRateLimit = {
    max: 100,
    timeWindow: 15 * 60 * 1000, 
    keyGenerator: (request: FastifyRequest) => request.user?.id || request.ip, // 
  };


  const uploadRateLimit = {
    max: 10,
    timeWindow: 60 * 60 * 1000, 
    keyGenerator: (request: FastifyRequest) => request.user?.id || request.ip,
  };


  const commonErrorResponses = {
    400: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Title and genre are required.' },
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
        message: { type: 'string', example: 'Only ARTIST can create releases.' },
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
        message: { type: 'string', example: 'Release not found.' },
        details: { type: 'string', nullable: true, description: 'Detailed error message (development only)' },
        stack: { type: 'string', nullable: true, description: 'Stack trace (development only)' },
      },
      description: 'Not Found',
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


  const createReleaseSwaggerSchema = {
    body: {
      type: 'object',
      required: ['title', 'genre'],
      properties: {
        title: { type: 'string', minLength: 1, description: 'Title of the release' },
        genre: { type: 'string', minLength: 1, description: 'Genre of the release' },
        artist_id: { type: 'string', format: 'uuid', description: 'ID of the artist (provided by client, but overridden by server user ID for security)', nullable: true },
        cover_art_url: { type: 'string', description: 'URL of the cover art (optional, if not uploading a file)' },
        cover_art: { type: 'string', format: 'binary', description: 'Cover art image file (JPG or PNG, max 10MB)' },
        status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'], default: 'DRAFT', description: 'Current status of the release' },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          artist_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          genre: { type: 'string' },
          cover_art_url: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'] },
          processing_error_reason: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          track_count: { type: 'integer' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Releases'],
    summary: 'Create a new release',
    description: 'Allows an ARTIST to create a new music release. Supports uploading cover art via multipart/form-data.',
    security: [{ BearerAuth: [] }],
  };

  const updateReleaseSwaggerSchema = {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, description: 'New title for the release' },
        genre: { type: 'string', minLength: 1, description: 'New genre for the release' },
        cover_art_url: { type: 'string', description: 'New URL of the cover art (optional, if not uploading a file)' },
        cover_art: { type: 'string', format: 'binary', description: 'New cover art image file (JPG or PNG, max 10MB)' },
        status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'], description: 'New status of the release' },
        processing_error_reason: { type: 'string', description: 'Reason for processing error (ADMIN only)', nullable: true },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          artist_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          genre: { type: 'string' },
          cover_art_url: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'] },
          processing_error_reason: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          track_count: { type: 'integer' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Releases'],
    summary: 'Update an existing release',
    description: 'Allows an ARTIST (for their own releases) or ADMIN to update release details. Supports updating cover art via multipart/form-data.',
    security: [{ BearerAuth: [] }],
  };


  const getAllReleasesSchema = {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Number of items per page' },
        orderBy: { type: 'string', enum: ['created_at', 'title', 'genre', 'status'], default: 'created_at', description: 'Field to order by' },
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
                artist_id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                genre: { type: 'string' },
                cover_art_url: { type: 'string' },
                status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'] },
                processing_error_reason: { type: 'string', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                track_count: { type: 'integer' },
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
    tags: ['Releases'],
    summary: 'Get all releases',
    description: 'Retrieves a paginated list of releases. ADMINs can see all, ARTISTs see their own.',
    security: [{ BearerAuth: [] }],
  };

  const getReleaseByIdSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the release' },
      },
      required: ['id'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          artist_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          genre: { type: 'string' },
          cover_art_url: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'] },
          processing_error_reason: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          track_count: { type: 'integer' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Releases'],
    summary: 'Get a release by ID',
    description: 'Retrieves details for a specific release by its ID.',
    security: [{ BearerAuth: [] }],
  };

  const deleteReleaseSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the release to delete' },
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
    tags: ['Releases'],
    summary: 'Delete a release',
    description: 'Allows an ARTIST (for their own releases) or ADMIN to delete a release.',
    security: [{ BearerAuth: [] }],
  };

  const submitReleaseForProcessingSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the release to submit for processing' },
      },
      required: ['id'],
    },
    response: {
      202: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          releaseId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['PROCESSING'] },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Releases'],
    summary: 'Submit release for processing',
    description: 'Submits a release (must be DRAFT or REJECTED status) for background processing. Only ARTISTs can submit their own releases.',
    security: [{ BearerAuth: [] }],
  };


  const adminUpdateReleaseStatusSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the release to update status for' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['PUBLISHED', 'REJECTED'], description: 'Target status for the release (PUBLISHED or REJECTED)' },
        processing_error_reason: { type: 'string', nullable: true, description: 'Reason for rejection (required if status is REJECTED)' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          release: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              artist_id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              genre: { type: 'string' },
              cover_art_url: { type: 'string' },
              status: { type: 'string', enum: ['DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'] },
              processing_error_reason: { type: 'string', nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Releases', 'Admin'],
    summary: 'ADMIN: Update release status (Approve/Reject)',
    description: 'Allows an ADMIN to change a release status from PENDING_REVIEW to PUBLISHED or REJECTED. A reason is required for rejection.',
    security: [{ BearerAuth: [] }],
  };


  const createReleasePreHandler: preHandlerHookHandler = async (request, reply) => {
    const { title, genre } = request.body as ReleaseCreatePayload;
    if (!title || typeof title !== 'string' || title.length < 1) {
      throw fastify.httpErrors.badRequest('Release title is required and must be a non-empty string.');
    }
    if (!genre || typeof genre !== 'string' || genre.length < 1) {
      throw fastify.httpErrors.badRequest('Release genre is required and must be a non-empty string.');
    }
  };


  const updateReleasePreHandler: preHandlerHookHandler = async (request, reply) => {
    const { title, genre } = request.body as ReleaseUpdatePayload;
    if (title !== undefined && (typeof title !== 'string' || title.length < 1)) {
      throw fastify.httpErrors.badRequest('Release title must be a non-empty string if provided.');
    }
    if (genre !== undefined && (typeof genre !== 'string' || genre.length < 1)) {
      throw fastify.httpErrors.badRequest('Release genre must be a non-empty string if provided.');
    }
  };

  fastify.post<{ Body: ReleaseCreatePayload & { cover_art?: MultipartFile } }>('/', {
    schema: { 
      response: createReleaseSwaggerSchema.response,
      tags: createReleaseSwaggerSchema.tags,
      summary: createReleaseSwaggerSchema.summary,
      description: createReleaseSwaggerSchema.description,
      security: createReleaseSwaggerSchema.security,
    },
    rateLimit: uploadRateLimit,
    preValidation: async (request, reply) => {
      const rawBody = request.body as any;
      const newBody: Partial<ReleaseCreatePayload> & { cover_art?: MultipartFile } = {};


      newBody.title = extractMultipartValue(rawBody.title);

 
      newBody.genre = extractMultipartValue(rawBody.genre);

 
      newBody.cover_art_url = extractMultipartValue(rawBody.cover_art_url);
      newBody.status = extractMultipartValue(rawBody.status) || 'DRAFT'; 
      newBody.processing_error_reason = extractMultipartValue(rawBody.processing_error_reason);


      if (rawBody.cover_art) {
        newBody.cover_art = rawBody.cover_art;
      }


      request.body = newBody as ReleaseCreatePayload & { cover_art?: MultipartFile };
    },
    preHandler: createReleasePreHandler, 
  }, releaseController.createRelease);

  fastify.get<{ Querystring: PaginationOptions }>('/', { schema: getAllReleasesSchema, rateLimit: generalApiRateLimit }, releaseController.getAllReleases);
  fastify.get<{ Params: { id: string } }>('/:id', { schema: getReleaseByIdSchema, rateLimit: generalApiRateLimit }, releaseController.getReleaseById);

  fastify.put<{ Params: { id: string }; Body: ReleaseUpdatePayload & { cover_art?: MultipartFile } }>('/:id', {
    schema: { 
      response: updateReleaseSwaggerSchema.response,
      tags: updateReleaseSwaggerSchema.tags,
      summary: updateReleaseSwaggerSchema.summary,
      description: updateReleaseSwaggerSchema.description,
      security: updateReleaseSwaggerSchema.security,
    },
    rateLimit: uploadRateLimit,
    preValidation: async (request, reply) => {
      const rawBody = request.body as any;
      const newBody: Partial<ReleaseUpdatePayload> & { cover_art?: MultipartFile } = {};

    
      if (rawBody.title !== undefined) {
        newBody.title = extractMultipartValue(rawBody.title);
      }

 
      if (rawBody.genre !== undefined) {
        newBody.genre = extractMultipartValue(rawBody.genre);
      }

      if (rawBody.cover_art_url !== undefined) newBody.cover_art_url = extractMultipartValue(rawBody.cover_art_url);
      if (rawBody.status !== undefined) newBody.status = extractMultipartValue(rawBody.status);
      if (rawBody.processing_error_reason !== undefined) newBody.processing_error_reason = extractMultipartValue(rawBody.processing_error_reason);


      if (rawBody.cover_art) {
        newBody.cover_art = rawBody.cover_art;
      }

      request.body = newBody as ReleaseUpdatePayload & { cover_art?: MultipartFile };
    },
    preHandler: updateReleasePreHandler, 
  }, releaseController.updateRelease);

  fastify.delete<{ Params: { id: string } }>('/:id', { schema: deleteReleaseSchema, rateLimit: generalApiRateLimit }, releaseController.deleteRelease);

  fastify.post<{ Params: { id: string } }>('/:id/submit', { schema: submitReleaseForProcessingSchema, onRequest: fastify.authorize(['ARTIST']), rateLimit: generalApiRateLimit }, releaseController.submitReleaseForProcessing);

  fastify.post<{ Params: { id: string }; Body: AdminReleaseStatusUpdatePayload }>('/:id/status', { schema: adminUpdateReleaseStatusSchema, onRequest: fastify.authorize(['ADMIN']), rateLimit: generalApiRateLimit }, releaseController.updateReleaseStatusByAdmin);
}

export default releaseRoutes;