import { FastifyInstance, FastifyPluginOptions, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { trackController } from '../controllers/trackController';
import { StandardErrorResponse } from '@shared/types';
import { TrackCreatePayload, TrackUpdatePayload } from '../types';
import { MultipartFile } from '@fastify/multipart';


const extractMultipartValue = (field: any): any => {
  if (field && typeof field === 'object' && 'value' in field) {
    return field.value;
  }
  return field;
};

async function trackRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('onRequest', fastify.authenticate); 
  const generalApiRateLimit = {
    max: 100,
    timeWindow: 15 * 60 * 1000, 
    keyGenerator: (request: FastifyRequest) => request.user?.id || request.ip, // 
  };


  const uploadRateLimit = {
    max: 10,
    timeWindow: 60 * 60 * 1000, 
    keyGenerator: (request: FastifyRequest) => request.user?.id || request.ip, // 
  };


  const commonErrorResponses = {
    400: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: { type: 'string', example: 'Title and track number are required.' },
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
        message: { type: 'string', example: 'You can only add tracks to your own releases.' },
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
    409: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 409 },
        error: { type: 'string', example: 'Conflict' },
        message: { type: 'string', example: 'A resource with this unique identifier already exists.' },
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


  const createTrackSwaggerSchema = {
    params: {
      type: 'object',
      properties: {
        releaseId: { type: 'string', format: 'uuid', description: 'ID of the release to add the track to' },
      },
      required: ['releaseId'],
    },
    body: { 
      type: 'object',
      required: ['title', 'track_number'],
      properties: {
        title: { type: 'string', minLength: 1, description: 'Title of the track' },
        isrc: { type: 'string', description: 'ISRC code (optional)', nullable: true },
        audio_file: { type: 'string', format: 'binary', description: 'Audio file (MP3, WAV, FLAC, max 200MB)' },
        duration: { type: 'integer', description: 'Duration of the track in seconds (optional)', nullable: true },
        track_number: { type: 'integer', minimum: 1, description: 'Track number within the release' },
        audio_file_url: { type: 'string', description: 'URL of the audio file (optional, if not uploading a file)', nullable: true },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          release_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          isrc: { type: 'string', nullable: true },
          audio_file_url: { type: 'string', nullable: true },
          duration: { type: 'integer', nullable: true },
          track_number: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Tracks'],
    summary: 'Create a new track for a release',
    description: 'Allows an ARTIST (for their own releases) or ADMIN to add a new track to a specified release. Supports uploading audio files via multipart/form-data. Fields: title (required), track_number (required), isrc (optional), audio_file (optional), duration (optional), audio_file_url (optional).',
    security: [{ BearerAuth: [] }],
  };


  const updateTrackSwaggerSchema = {
    params: {
      type: 'object',
      properties: {
        releaseId: { type: 'string', format: 'uuid', description: 'ID of the release the track belongs to' },
        trackId: { type: 'string', format: 'uuid', description: 'ID of the track to update' },
      },
      required: ['releaseId', 'trackId'],
    },
    body: { 
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, description: 'New title for the track' },
        isrc: { type: 'string', description: 'New ISRC code (optional)', nullable: true },
        audio_file: { type: 'string', format: 'binary', description: 'New audio file (MP3, WAV, FLAC, max 200MB)' },
        duration: { type: 'integer', description: 'New duration of the track in seconds (optional)', nullable: true },
        track_number: { type: 'integer', minimum: 1, description: 'New track number within the release' },
        audio_file_url: { type: 'string', description: 'New URL of the audio file (optional, if not uploading a file)', nullable: true },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          release_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          isrc: { type: 'string', nullable: true },
          audio_file_url: { type: 'string', nullable: true },
          duration: { type: 'integer', nullable: true },
          track_number: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Tracks'],
    summary: 'Update an existing track',
    description: 'Allows an ARTIST (for their own releases) or ADMIN to update track details for a specific release. Supports updating audio files via multipart/form-data. Fields: title (optional), track_number (optional), isrc (optional), audio_file (optional), duration (optional), audio_file_url (optional).',
    security: [{ BearerAuth: [] }],
  };

  const getTracksByReleaseSchema = {
    params: {
      type: 'object',
      properties: {
        releaseId: { type: 'string', format: 'uuid', description: 'ID of the release to retrieve tracks for' },
      },
      required: ['releaseId'],
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            release_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            isrc: { type: 'string', nullable: true },
            audio_file_url: { type: 'string', nullable: true },
            duration: { type: 'integer', nullable: true },
            track_number: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Tracks'],
    summary: 'Get all tracks for a release',
    description: 'Retrieves all tracks associated with a specific release.',
    security: [{ BearerAuth: [] }],
  };

  const getTrackByIdSchema = {
    params: {
      type: 'object',
      properties: {
        releaseId: { type: 'string', format: 'uuid', description: 'ID of the release the track belongs to' },
        trackId: { type: 'string', format: 'uuid', description: 'ID of the track to retrieve' },
      },
      required: ['releaseId', 'trackId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          release_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          isrc: { type: 'string', nullable: true },
          audio_file_url: { type: 'string', nullable: true },
          duration: { type: 'integer', nullable: true },
          track_number: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Tracks'],
    summary: 'Get a track by ID for a release',
    description: 'Retrieves details for a specific track within a given release.',
    security: [{ BearerAuth: [] }],
  };

  const deleteTrackSchema = {
    params: {
      type: 'object',
      properties: {
        releaseId: { type: 'string', format: 'uuid', description: 'ID of the release the track belongs to' },
        trackId: { type: 'string', format: 'uuid', description: 'ID of the track to delete' },
      },
      required: ['releaseId', 'trackId'],
    },
    response: {
      204: {
        type: 'null',
        description: 'No Content',
      },
      ...commonErrorResponses,
    },
    tags: ['Tracks'],
    summary: 'Delete a track from a release',
    description: 'Allows an ARTIST (for their own releases) or ADMIN to delete a track from a specific release.',
    security: [{ BearerAuth: [] }],
  };


  const createTrackPreHandler: preHandlerHookHandler = async (request, reply) => {
    const { title, track_number } = request.body as TrackCreatePayload;
    if (!title || typeof title !== 'string' || title.length < 1) {
      throw fastify.httpErrors.badRequest('Track title is required and must be a non-empty string.');
    }
    if (track_number === undefined || typeof track_number !== 'number' || track_number < 1) {
      throw fastify.httpErrors.badRequest('Track number is required and must be a positive integer.');
    }
  };


  const updateTrackPreHandler: preHandlerHookHandler = async (request, reply) => {
    const { title, track_number } = request.body as TrackUpdatePayload;
    if (title !== undefined && (typeof title !== 'string' || title.length < 1)) {
      throw fastify.httpErrors.badRequest('Track title must be a non-empty string if provided.');
    }
    if (track_number !== undefined && (typeof track_number !== 'number' || track_number < 1)) {
      throw fastify.httpErrors.badRequest('Track number must be a positive integer if provided.');
    }
  };


  fastify.post<{ Params: { releaseId: string }; Body: TrackCreatePayload & { audio_file?: MultipartFile } }>('/:releaseId', {
    schema: { 
      params: createTrackSwaggerSchema.params,
      response: createTrackSwaggerSchema.response,
      tags: createTrackSwaggerSchema.tags,
      summary: createTrackSwaggerSchema.summary,
      description: createTrackSwaggerSchema.description,
      security: createTrackSwaggerSchema.security,
    },
    rateLimit: uploadRateLimit,
    preValidation: async (request, reply) => {
      const rawBody = request.body as any;
      const newBody: Partial<TrackCreatePayload> & { audio_file?: MultipartFile } = {};

  
      newBody.title = extractMultipartValue(rawBody.title);

   
      let track_number = extractMultipartValue(rawBody.track_number);
      if (typeof track_number === 'string') {
        track_number = parseInt(track_number, 10);
      }
      newBody.track_number = track_number;

   
      newBody.isrc = extractMultipartValue(rawBody.isrc);
      
      let duration = extractMultipartValue(rawBody.duration);
      if (typeof duration === 'string') {
        duration = parseFloat(duration);
      }
      newBody.duration = duration;

      newBody.audio_file_url = extractMultipartValue(rawBody.audio_file_url);

   
      if (rawBody.audio_file) {
        newBody.audio_file = rawBody.audio_file;
      }

      request.body = newBody as TrackCreatePayload & { audio_file?: MultipartFile };
    },
    preHandler: createTrackPreHandler, 
  }, trackController.createTrack);

  fastify.get<{ Params: { releaseId: string } }>('/:releaseId', { schema: getTracksByReleaseSchema, rateLimit: generalApiRateLimit }, trackController.getTracksByRelease);
  
  fastify.get<{ Params: { releaseId: string; trackId: string } }>('/:releaseId/:trackId', { schema: getTrackByIdSchema, rateLimit: generalApiRateLimit }, trackController.getTrackById);

  fastify.put<{ Params: { releaseId: string; trackId: string }; Body: TrackUpdatePayload & { audio_file?: MultipartFile } }>('/:releaseId/:trackId', {
    schema: { 
      params: updateTrackSwaggerSchema.params,
      response: updateTrackSwaggerSchema.response,
      tags: updateTrackSwaggerSchema.tags,
      summary: updateTrackSwaggerSchema.summary,
      description: updateTrackSwaggerSchema.description,
      security: updateTrackSwaggerSchema.security,
    },
    rateLimit: uploadRateLimit,
    preValidation: async (request, reply) => {
      const rawBody = request.body as any;
      const newBody: Partial<TrackUpdatePayload> & { audio_file?: MultipartFile } = {};

 
      if (rawBody.title !== undefined) {
        newBody.title = extractMultipartValue(rawBody.title);
      }


      if (rawBody.track_number !== undefined) {
        let track_number = extractMultipartValue(rawBody.track_number);
        if (typeof track_number === 'string') {
          track_number = parseInt(track_number, 10);
        }
        newBody.track_number = track_number;
      }

     
      if (rawBody.isrc !== undefined) newBody.isrc = extractMultipartValue(rawBody.isrc);
      
      if (rawBody.duration !== undefined) {
        let duration = extractMultipartValue(rawBody.duration);
        if (typeof duration === 'string') {
          duration = parseFloat(duration);
        }
        newBody.duration = duration;
      }

      if (rawBody.audio_file_url !== undefined) newBody.audio_file_url = extractMultipartValue(rawBody.audio_file_url);

 
      if (rawBody.audio_file) {
        newBody.audio_file = rawBody.audio_file;
      }

      request.body = newBody as TrackUpdatePayload & { audio_file?: MultipartFile };
    },
    preHandler: updateTrackPreHandler, 
  }, trackController.updateTrack); 

  fastify.delete<{ Params: { releaseId: string; trackId: string } }>('/:releaseId/:trackId', { schema: deleteTrackSchema, rateLimit: generalApiRateLimit }, trackController.deleteTrack); 
}

export default trackRoutes;