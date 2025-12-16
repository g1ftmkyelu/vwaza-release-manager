import { FastifyInstance } from 'fastify';
import { Release, ReleaseStatus, PaginationOptions, PaginatedResult } from '@shared/types';
import { ReleaseCreatePayload, ReleaseUpdatePayload } from '../types';
import { Readable } from 'stream';
import { UploadApiErrorResponse } from 'cloudinary'; 

export const releaseService = {
  async uploadFile(fastify: FastifyInstance, file: { toBuffer: () => Promise<Buffer>, filename: string, mimetype: string }, folder: string): Promise<string> {
    const buffer = await file.toBuffer();
    const stream = Readable.from(buffer);

    return new Promise((resolve, reject) => {
      const uploadStream = fastify.cloudinary.uploader.upload_stream(
        { folder: `vrms/${folder}` },
        (error: UploadApiErrorResponse | undefined, result) => { 
          if (error) {
            fastify.log.error({ message: `Cloudinary upload failed for ${file.filename}:`, error: error });
            return reject(new Error('File upload failed'));
          }
          if (!result || !result.secure_url) {
            return reject(new Error('Cloudinary upload did not return a URL'));
          }
          resolve(result.secure_url);
        }
      );
      stream.pipe(uploadStream);
    });
  },

  async createRelease(fastify: FastifyInstance, payload: ReleaseCreatePayload): Promise<Release> {
    const result = await fastify.db.query(
      `INSERT INTO releases (artist_id, title, genre, cover_art_url, status, processing_error_reason, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, artist_id, title, genre, cover_art_url, status, processing_error_reason, is_featured, created_at, updated_at`,
      [payload.artist_id, payload.title, payload.genre, payload.cover_art_url, payload.status || 'DRAFT', payload.processing_error_reason || null, payload.is_featured || false]
    );
    return result.rows[0];
  },

  async getReleaseById(fastify: FastifyInstance, id: string): Promise<Release | undefined> {
    const result = await fastify.db.query(
      `SELECT r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at,
              COUNT(t.id)::int AS track_count
       FROM releases r
       LEFT JOIN tracks t ON r.id = t.release_id
       WHERE r.id = $1
       GROUP BY r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at`,
      [id]
    );
    return result.rows[0];
  },

  async getAllReleases(fastify: FastifyInstance, options: PaginationOptions): Promise<PaginatedResult<Release>> {
    const { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = options; 
    const offset = (page - 1) * limit;

    const validOrderBy = ['created_at', 'title', 'genre', 'status'].includes(orderBy) ? orderBy : 'created_at';
    const validOrderDirection = ['ASC', 'DESC'].includes(orderDirection) ? orderDirection : 'DESC';

    const releasesQuery = `
      SELECT r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at,
             COUNT(t.id)::int AS track_count
      FROM releases r
      LEFT JOIN tracks t ON r.id = t.release_id
      GROUP BY r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at
      ORDER BY r.${validOrderBy} ${validOrderDirection}
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) FROM releases;`;

    const [releasesResult, countResult] = await Promise.all([
      fastify.db.query(releasesQuery, [limit, offset]),
      fastify.db.query(countQuery),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: releasesResult.rows,
      pagination: {
        total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getReleasesByArtist(fastify: FastifyInstance, artistId: string, options: PaginationOptions): Promise<PaginatedResult<Release>> {
    const { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = options; 
    const offset = (page - 1) * limit;

    const validOrderBy = ['created_at', 'title', 'genre', 'status'].includes(orderBy) ? orderBy : 'created_at';
    const validOrderDirection = ['ASC', 'DESC'].includes(orderDirection) ? orderDirection : 'DESC';

    const releasesQuery = `
      SELECT r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at,
             COUNT(t.id)::int AS track_count
      FROM releases r
      LEFT JOIN tracks t ON r.id = t.release_id
      WHERE r.artist_id = $3
      GROUP BY r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at
      ORDER BY r.${validOrderBy} ${validOrderDirection}
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) FROM releases WHERE artist_id = $1;`;

    const [releasesResult, countResult] = await Promise.all([
      fastify.db.query(releasesQuery, [limit, offset, artistId]),
      fastify.db.query(countQuery, [artistId]),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: releasesResult.rows,
      pagination: {
        total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },


  async getPublishedReleases(fastify: FastifyInstance, options: PaginationOptions & { search?: string; is_featured?: boolean }): Promise<PaginatedResult<Release>> {
    const { page = 1, limit = 12, orderBy = 'created_at', orderDirection = 'DESC', search, is_featured } = options;
    const offset = (page - 1) * limit;

    const validOrderBy = ['created_at', 'title', 'genre'].includes(orderBy) ? orderBy : 'created_at';
    const validOrderDirection = ['ASC', 'DESC'].includes(orderDirection) ? orderDirection : 'DESC';

    let whereClause = `WHERE r.status = 'PUBLISHED'`;
    const queryParams: any[] = [limit, offset];
    let paramIndex = 3; 

    if (search) {
      whereClause += ` AND (r.title ILIKE $${paramIndex} OR r.genre ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    if (is_featured !== undefined) {
      whereClause += ` AND r.is_featured = $${paramIndex}`;
      queryParams.push(is_featured);
      paramIndex++;
    }

    const releasesQuery = `
      SELECT r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at,
             COUNT(t.id)::int AS track_count
      FROM releases r
      LEFT JOIN tracks t ON r.id = t.release_id
      ${whereClause}
      GROUP BY r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at
      ORDER BY r.${validOrderBy} ${validOrderDirection}
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) FROM releases r ${whereClause};`;

    const [releasesResult, countResult] = await Promise.all([
      fastify.db.query(releasesQuery, queryParams),
      fastify.db.query(countQuery, queryParams.slice(2)), 
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: releasesResult.rows,
      pagination: {
        total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  
  async getPublishedReleaseById(fastify: FastifyInstance, id: string): Promise<Release | undefined> {
    const result = await fastify.db.query(
      `SELECT r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at,
              COUNT(t.id)::int AS track_count
       FROM releases r
       LEFT JOIN tracks t ON r.id = t.release_id
       WHERE r.id = $1 AND r.status = 'PUBLISHED'
       GROUP BY r.id, r.artist_id, r.title, r.genre, r.cover_art_url, r.status, r.processing_error_reason, r.is_featured, r.created_at, r.updated_at`,
      [id]
    );
    return result.rows[0];
  },

  async updateRelease(fastify: FastifyInstance, id: string, payload: ReleaseUpdatePayload): Promise<Release | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (payload.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(payload.title);
    }
    if (payload.genre !== undefined) {
      updates.push(`genre = $${paramIndex++}`);
      values.push(payload.genre);
    }
    if (payload.cover_art_url !== undefined) {
      updates.push(`cover_art_url = $${paramIndex++}`);
      values.push(payload.cover_art_url);
    }
    if (payload.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(payload.status);
    }
    if (payload.processing_error_reason !== undefined) {
      updates.push(`processing_error_reason = $${paramIndex++}`);
      values.push(payload.processing_error_reason);
    } else if (payload.status !== 'REJECTED') {
  
      updates.push(`processing_error_reason = $${paramIndex++}`);
      values.push(null);
    }
    if (payload.is_featured !== undefined) { 
      updates.push(`is_featured = $${paramIndex++}`);
      values.push(payload.is_featured);
    }


    if (updates.length === 0) {
      return this.getReleaseById(fastify, id);
    }

    values.push(id);
    const result = await fastify.db.query(
      `UPDATE releases
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, artist_id, title, genre, cover_art_url, status, processing_error_reason, is_featured, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  async updateReleaseStatus(fastify: FastifyInstance, id: string, status: ReleaseStatus, errorReason?: string): Promise<Release | undefined> {
    const result = await fastify.db.query(
      `UPDATE releases
       SET status = $1, processing_error_reason = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, artist_id, title, genre, cover_art_url, status, processing_error_reason, is_featured, created_at, updated_at`,
      [status, errorReason || null, id]
    );
    return result.rows[0];
  },

  async deleteRelease(fastify: FastifyInstance, id: string): Promise<boolean> {
    const result = await fastify.db.query(
      `DELETE FROM releases
       WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },
};