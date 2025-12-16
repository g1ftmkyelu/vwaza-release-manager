import { FastifyInstance } from 'fastify';
import { Track, PaginationOptions, PaginatedResult, PublicTrack } from '@shared/types';
import { TrackCreatePayload, TrackUpdatePayload } from '../types';
import { Readable } from 'stream';
import { UploadApiErrorResponse } from 'cloudinary'; 

export const trackService = {
  async uploadFile(fastify: FastifyInstance, file: { toBuffer: () => Promise<Buffer>, filename: string, mimetype: string }, folder: string): Promise<string> {
    const buffer = await file.toBuffer();
    const stream = Readable.from(buffer);

    return new Promise((resolve, reject) => {
      const uploadStream = fastify.cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: `vrms/${folder}` }, 
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

  async createTrack(fastify: FastifyInstance, payload: TrackCreatePayload): Promise<Track> {
    const result = await fastify.db.query(
      `INSERT INTO tracks (release_id, title, isrc, audio_file_url, duration, track_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, release_id, title, isrc, audio_file_url, duration, track_number, created_at, updated_at`,
      [payload.release_id, payload.title, payload.isrc, payload.audio_file_url, payload.duration, payload.track_number]
    );
    return result.rows[0];
  },

  async getTrackById(fastify: FastifyInstance, id: string): Promise<Track | undefined> {
    const result = await fastify.db.query(
      `SELECT id, release_id, title, isrc, audio_file_url, duration, track_number, created_at, updated_at
       FROM tracks
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async getTracksByRelease(fastify: FastifyInstance, releaseId: string): Promise<Track[]> {
    const result = await fastify.db.query(
      `SELECT id, release_id, title, isrc, audio_file_url, duration, track_number, created_at, updated_at
       FROM tracks
       WHERE release_id = $1
       ORDER BY track_number ASC`,
      [releaseId]
    );
    return result.rows;
  },

 
  async getPublishedTracksByRelease(fastify: FastifyInstance, releaseId: string): Promise<Track[]> {
    
    const releaseCheck = await fastify.db.query(
      `SELECT id FROM releases WHERE id = $1 AND status = 'PUBLISHED'`,
      [releaseId]
    );
    if (releaseCheck.rows.length === 0) {
      return []; 
    }

    const result = await fastify.db.query(
      `SELECT id, release_id, title, isrc, audio_file_url, duration, track_number, created_at, updated_at
       FROM tracks
       WHERE release_id = $1
       ORDER BY track_number ASC`,
      [releaseId]
    );
    return result.rows;
  },


  async getPublicTracks(fastify: FastifyInstance, options: PaginationOptions & { search?: string; genre?: string }): Promise<PaginatedResult<PublicTrack>> {
    const { page = 1, limit = 12, orderBy = 'created_at', orderDirection = 'DESC', search, genre } = options;
    const offset = (page - 1) * limit;

    const validOrderBy = ['created_at', 'title', 'artist_name', 'album_title'].includes(orderBy) ? orderBy : 'created_at';
    const validOrderDirection = ['ASC', 'DESC'].includes(orderDirection) ? orderDirection : 'DESC';

    let whereClause = `WHERE r.status = 'PUBLISHED'`;
    const queryParams: any[] = [limit, offset];
    let paramIndex = 3; 

    if (search) {
      whereClause += ` AND (t.title ILIKE $${paramIndex} OR r.title ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    if (genre) {
      whereClause += ` AND r.genre = $${paramIndex}`;
      queryParams.push(genre);
      paramIndex++;
    }

  
    let actualOrderByColumn = `t.${validOrderBy}`;
    if (validOrderBy === 'artist_name') {
      actualOrderByColumn = `u.email`;
    } else if (validOrderBy === 'album_title') {
      actualOrderByColumn = `r.title`;
    }

    const tracksQuery = `
      SELECT
          t.id,
          t.release_id,
          t.title,
          t.isrc,
          t.audio_file_url,
          t.duration,
          t.track_number,
          t.created_at,
          t.updated_at,
          r.id AS album_id,
          r.title AS album_title,
          r.cover_art_url AS album_cover_art_url,
          u.email AS artist_name
      FROM tracks t
      JOIN releases r ON t.release_id = r.id
      JOIN users u ON r.artist_id = u.id
      ${whereClause}
      ORDER BY ${actualOrderByColumn} ${validOrderDirection}
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `
      SELECT COUNT(t.id)
      FROM tracks t
      JOIN releases r ON t.release_id = r.id
      JOIN users u ON r.artist_id = u.id
      ${whereClause};
    `;

    const [tracksResult, countResult] = await Promise.all([
      fastify.db.query(tracksQuery, queryParams),
      fastify.db.query(countQuery, queryParams.slice(2)), 
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: tracksResult.rows,
      pagination: {
        total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateTrack(fastify: FastifyInstance, id: string, payload: TrackUpdatePayload): Promise<Track | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (payload.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(payload.title);
    }
    if (payload.isrc !== undefined) {
      updates.push(`isrc = $${paramIndex++}`);
      values.push(payload.isrc);
    }
    if (payload.audio_file_url !== undefined) {
      updates.push(`audio_file_url = $${paramIndex++}`);
      values.push(payload.audio_file_url);
    }
    if (payload.duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`);
      values.push(payload.duration);
    }
    if (payload.track_number !== undefined) {
      updates.push(`track_number = $${paramIndex++}`);
      values.push(payload.track_number);
    }

    if (updates.length === 0) {
      return this.getTrackById(fastify, id);
    }

    values.push(id);
    const result = await fastify.db.query(
      `UPDATE tracks
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, release_id, title, isrc, audio_file_url, duration, track_number, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  async deleteTrack(fastify: FastifyInstance, id: string): Promise<boolean> {
    const result = await fastify.db.query(
      `DELETE FROM tracks
       WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },
};