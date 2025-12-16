import { FastifyReply, FastifyRequest } from 'fastify';
import { PaginationOptions } from '@shared/types';
import { ReleaseCreatePayload, ReleaseUpdatePayload, AdminReleaseStatusUpdatePayload } from '../types';
import { releaseService } from '../services/releaseService';
import { processingService } from '../services/processingService'; 
import { MultipartFile } from '@fastify/multipart';

export const releaseController = {
  async createRelease(request: FastifyRequest<{ Body: ReleaseCreatePayload & { cover_art?: MultipartFile } }>, reply: FastifyReply) {

    if (request.user.role !== 'ARTIST') {
      throw request.server.httpErrors.forbidden('Only ARTIST can create releases.');
    }

    const { title, genre, status } = request.body;
    let cover_art_url: string | undefined = request.body.cover_art_url;

    if (!title || !genre) {
      throw request.server.httpErrors.badRequest('Title and genre are required.');
    }

    const file = request.body.cover_art;
    if (file) {
      cover_art_url = await releaseService.uploadFile(request.server, file, 'cover_art');
    }

    const newRelease = await releaseService.createRelease(request.server, {
      artist_id: request.user.id,
      title,
      genre,
      cover_art_url,
      status,
    });
    reply.status(201).send(newRelease);
  },

  async getReleaseById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const release = await releaseService.getReleaseById(request.server, id);
    if (!release) {
      throw request.server.httpErrors.notFound('Release not found.');
    }
    reply.status(200).send(release);
  },

  async getAllReleases(request: FastifyRequest<{ Querystring: PaginationOptions }>, reply: FastifyReply) {

    if (request.user.role !== 'ADMIN' && request.user.role !== 'ARTIST') {
      throw request.server.httpErrors.forbidden('Insufficient role to view releases.');
    }

    const { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = request.query;

    let result;
    if (request.user.role === 'ADMIN') {
      result = await releaseService.getAllReleases(request.server, { page, limit, orderBy, orderDirection });
    } else {
      result = await releaseService.getReleasesByArtist(request.server, request.user.id, { page, limit, orderBy, orderDirection });
    }
    reply.status(200).send(result);
  },

  async updateRelease(request: FastifyRequest<{ Params: { id: string }; Body: ReleaseUpdatePayload & { cover_art?: MultipartFile } }>, reply: FastifyReply) {
    const { id } = request.params;
    const payload = request.body;
    let cover_art_url: string | undefined = payload.cover_art_url;

    const existingRelease = await releaseService.getReleaseById(request.server, id);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Release not found.');
    }


    if (request.user.role !== 'ADMIN' && existingRelease.artist_id !== request.user.id) {
      throw request.server.httpErrors.forbidden('You can only update your own releases.');
    }

    const file = request.body.cover_art;
    if (file) {
      cover_art_url = await releaseService.uploadFile(request.server, file, 'cover_art');
      payload.cover_art_url = cover_art_url; 
    }

    const updatedRelease = await releaseService.updateRelease(request.server, id, payload);
    if (!updatedRelease) {
      throw request.server.httpErrors.notFound('Release not found after update attempt.');
    }
    reply.status(200).send(updatedRelease);
  },

  async deleteRelease(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const existingRelease = await releaseService.getReleaseById(request.server, id);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Release not found.');
    }


    if (request.user.role !== 'ADMIN' && existingRelease.artist_id !== request.user.id) {
      throw request.server.httpErrors.forbidden('You can only delete your own releases.');
    }

    const deleted = await releaseService.deleteRelease(request.server, id);
    if (!deleted) {
      throw request.server.httpErrors.notFound('Release not found.');
    }
    reply.status(204).send();
  },

  async submitReleaseForProcessing(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    const existingRelease = await releaseService.getReleaseById(request.server, id);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Release not found.');
    }


    if (request.user.role !== 'ADMIN' && existingRelease.artist_id !== request.user.id) {
      throw request.server.httpErrors.forbidden('You can only submit your own releases for processing.');
    }


    if (existingRelease.status !== 'DRAFT' && existingRelease.status !== 'REJECTED') {
      throw request.server.httpErrors.badRequest(`Release is currently in '${existingRelease.status}' status and cannot be submitted for processing.`);
    }


    await releaseService.updateReleaseStatus(request.server, id, 'PROCESSING');


    setImmediate(async () => {
      try {
        await processingService.processRelease(request.server, id);
      } catch (processingError: any) {
        request.server.log.error(`Error during background processing for release ${id}:`, processingError);

        await releaseService.updateReleaseStatus(request.server, id, 'REJECTED', `Initial processing failed: ${processingError.message || 'Unknown error'}`);
      }
    });

    reply.status(202).send({ message: 'Release submitted for processing.', releaseId: id, status: 'PROCESSING' });
  },

  async updateReleaseStatusByAdmin(request: FastifyRequest<{ Params: { id: string }; Body: AdminReleaseStatusUpdatePayload }>, reply: FastifyReply) {
    const { id } = request.params;
    const { status, processing_error_reason } = request.body;

    const existingRelease = await releaseService.getReleaseById(request.server, id);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Release not found.');
    }


    if (existingRelease.status !== 'PENDING_REVIEW') {
      throw request.server.httpErrors.badRequest(`Release is currently in '${existingRelease.status}' status and cannot be approved or rejected.`);
    }


    if (status !== 'PUBLISHED' && status !== 'REJECTED') {
      throw request.server.httpErrors.badRequest('Invalid status provided. Must be PUBLISHED or REJECTED.');
    }


    if (status === 'REJECTED' && !processing_error_reason) {
      throw request.server.httpErrors.badRequest('A processing_error_reason is required when rejecting a release.');
    }

    const updatedRelease = await releaseService.updateReleaseStatus(request.server, id, status, processing_error_reason);

    if (!updatedRelease) {
      throw request.server.httpErrors.internalServerError('Failed to update release status.');
    }

    reply.status(200).send({ message: `Release status updated to ${status}.`, release: updatedRelease });
  },
};