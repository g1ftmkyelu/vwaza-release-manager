import { FastifyReply, FastifyRequest } from 'fastify';
import { PaginationOptions } from '@shared/types';
import { releaseService } from '../services/releaseService';
import { trackService } from '../services/trackService';

export const publicController = {
  async getPublishedReleases(request: FastifyRequest<{ Querystring: PaginationOptions & { search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 12, orderBy = 'created_at', orderDirection = 'DESC', search } = request.query;



    const result = await releaseService.getPublishedReleases(request.server, { page, limit, orderBy, orderDirection, search });
    reply.status(200).send(result);
  },

  async getPublishedReleaseById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const release = await releaseService.getPublishedReleaseById(request.server, id);
    if (!release) {
      throw request.server.httpErrors.notFound('Published release not found.');
    }
    reply.status(200).send(release);
  },

  async getPublishedTracksByRelease(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    // First check if the release is published
    const release = await releaseService.getPublishedReleaseById(request.server, id);
    if (!release) {
      throw request.server.httpErrors.notFound('Published release not found.');
    }

    const tracks = await trackService.getPublishedTracksByRelease(request.server, id);
    reply.status(200).send(tracks);
  },


  async getPublicTracks(request: FastifyRequest<{ Querystring: PaginationOptions & { search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 12, orderBy = 'created_at', orderDirection = 'DESC', search } = request.query;

    const result = await trackService.getPublicTracks(request.server, { page, limit, orderBy, orderDirection, search });
    reply.status(200).send(result);
  },
};