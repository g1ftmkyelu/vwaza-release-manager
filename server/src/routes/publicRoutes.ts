import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { publicController } from '../controllers/publicController';
import { PaginationOptions, StandardErrorResponse } from '@shared/types';

export default async function publicRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {



  const publicApiRateLimit = {
    max: 200,
    timeWindow: 15 * 60 * 1000,
    keyGenerator: (request: FastifyRequest) => request.ip, 
  };


  const commonErrorResponses = {
    404: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer', example: 404 },
        error: { type: 'string', example: 'Not Found' },
        message: { type: 'string', example: 'Published release not found.' },
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
        message: { type: 'string', example: 'You have exceeded the request limit of 200 requests per 900 seconds.' },
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

  const getPublishedReleasesSchema = {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 12, description: 'Number of items per page' },
        orderBy: { type: 'string', enum: ['created_at', 'title', 'genre'], default: 'created_at', description: 'Field to order by' },
        orderDirection: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC', description: 'Order direction' },
        search: { type: 'string', description: 'Search query for release titles or genres', nullable: true },
        is_featured: { type: 'boolean', description: 'Filter by featured releases', nullable: true },
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
                status: { type: 'string', enum: ['PUBLISHED'] }, 
                track_count: { type: 'integer' },
                is_featured: { type: 'boolean' }, 
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
    tags: ['Public'],
    summary: 'Get all published releases',
    description: 'Retrieves a paginated list of all PUBLISHED music releases, accessible to anyone.',
  };

  const getPublishedReleaseByIdSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the published release' },
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
          status: { type: 'string', enum: ['PUBLISHED'] },
          track_count: { type: 'integer' },
          is_featured: { type: 'boolean' }, 
        },
      },
      ...commonErrorResponses,
    },
    tags: ['Public'],
    summary: 'Get a published release by ID',
    description: 'Retrieves details for a specific PUBLISHED release by its ID, accessible to anyone.',
  };

  const getPublishedTracksByReleaseSchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'ID of the published release to retrieve tracks for' },
      },
      required: ['id'],
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
    tags: ['Public'],
    summary: 'Get tracks for a published release',
    description: 'Retrieves all tracks associated with a specific PUBLISHED release, accessible to anyone.',
  };

  
  const getPublicTracksSchema = {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 12, description: 'Number of items per page' },
        orderBy: { type: 'string', enum: ['created_at', 'title', 'artist_name', 'album_title'], default: 'created_at', description: 'Field to order by' },
        orderDirection: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC', description: 'Order direction' },
        search: { type: 'string', description: 'Search query for track titles, album titles, or artist names', nullable: true },
        genre: { type: 'string', description: 'Filter tracks by genre', nullable: true }, 
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
                release_id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                isrc: { type: 'string', nullable: true },
                audio_file_url: { type: 'string', nullable: true },
                duration: { type: 'integer', nullable: true },
                track_number: { type: 'integer' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                album_id: { type: 'string', format: 'uuid' },
                album_title: { type: 'string' },
                album_cover_art_url: { type: 'string', nullable: true },
                artist_name: { type: 'string' },
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
    tags: ['Public'],
    summary: 'Get all published tracks',
    description: 'Retrieves a paginated list of all PUBLISHED music tracks, including album and artist details, accessible to anyone.',
  };

 
  fastify.get<{ Querystring: PaginationOptions }>(
    '/releases', 
    { schema: getPublishedReleasesSchema, rateLimit: publicApiRateLimit }, 
    publicController.getPublishedReleases
  );
  
  fastify.get<{ Params: { id: string } }>(
    '/releases/:id', 
    { schema: getPublishedReleaseByIdSchema, rateLimit: publicApiRateLimit }, 
    publicController.getPublishedReleaseById
  );
  
  fastify.get<{ Params: { id: string } }>(
    '/releases/:id/tracks', 
    { schema: getPublishedTracksByReleaseSchema, rateLimit: publicApiRateLimit }, 
    publicController.getPublishedTracksByRelease
  );


  fastify.get<{ Querystring: PaginationOptions }>(
    '/tracks',
    { schema: getPublicTracksSchema, rateLimit: publicApiRateLimit },
    publicController.getPublicTracks
  );
}