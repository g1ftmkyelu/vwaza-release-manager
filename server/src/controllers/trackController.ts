import { FastifyReply, FastifyRequest } from 'fastify';
import { TrackCreatePayload, TrackUpdatePayload } from '../types';
import { trackService } from '../services/trackService';
import { releaseService } from '../services/releaseService'; 
import { MultipartFile } from '@fastify/multipart';

export const trackController = {
  async createTrack(request: FastifyRequest<{ Params: { releaseId: string }; Body: TrackCreatePayload & { audio_file?: MultipartFile } }>, reply: FastifyReply) {
    const { releaseId } = request.params;
    const { title, isrc, duration, track_number } = request.body;
    let audio_file_url: string | undefined = request.body.audio_file_url;

    if (!title || !track_number) {
      throw request.server.httpErrors.badRequest('Title and track number are required.');
    }

    const existingRelease = await releaseService.getReleaseById(request.server, releaseId);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Release not found.');
    }

 
    if (request.user.role !== 'ADMIN' && existingRelease.artist_id !== request.user.id) {
      throw request.server.httpErrors.forbidden('You can only add tracks to your own releases.');
    }

    const file = request.body.audio_file;
    if (file) {
      audio_file_url = await trackService.uploadFile(request.server, file, 'audio_tracks');
    }

    const newTrack = await trackService.createTrack(request.server, {
      release_id: releaseId,
      title,
      isrc,
      audio_file_url,
      duration,
      track_number,
    });
    reply.status(201).send(newTrack);
  },

  async getTrackById(request: FastifyRequest<{ Params: { releaseId: string; trackId: string } }>, reply: FastifyReply) {
    const { releaseId, trackId } = request.params;
    const track = await trackService.getTrackById(request.server, trackId);
    if (!track || track.release_id !== releaseId) {
      throw request.server.httpErrors.notFound('Track not found in this release.');
    }
    reply.status(200).send(track);
  },

  async getTracksByRelease(request: FastifyRequest<{ Params: { releaseId: string } }>, reply: FastifyReply) {
    const { releaseId } = request.params;
    const existingRelease = await releaseService.getReleaseById(request.server, releaseId);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Release not found.');
    }

    const tracks = await trackService.getTracksByRelease(request.server, releaseId);
    reply.status(200).send(tracks);
  },

  async updateTrack(request: FastifyRequest<{ Params: { releaseId: string; trackId: string }; Body: TrackUpdatePayload & { audio_file?: MultipartFile } }>, reply: FastifyReply) {
    const { releaseId, trackId } = request.params;
    const payload = request.body;
    let audio_file_url: string | undefined = payload.audio_file_url;

    const existingTrack = await trackService.getTrackById(request.server, trackId);
    if (!existingTrack || existingTrack.release_id !== releaseId) {
      throw request.server.httpErrors.notFound('Track not found in this release.');
    }

    const existingRelease = await releaseService.getReleaseById(request.server, releaseId);
    if (!existingRelease) { 
      throw request.server.httpErrors.notFound('Associated release not found.');
    }

 
    if (request.user.role !== 'ADMIN' && existingRelease.artist_id !== request.user.id) {
      throw request.server.httpErrors.forbidden('You can only update tracks for your own releases.');
    }

    const file = request.body.audio_file;
    if (file) {
      audio_file_url = await trackService.uploadFile(request.server, file, 'audio_tracks');
      payload.audio_file_url = audio_file_url; 
    }

    const updatedTrack = await trackService.updateTrack(request.server, trackId, payload);
    if (!updatedTrack) {
      throw request.server.httpErrors.notFound('Track not found after update attempt.');
    }
    reply.status(200).send(updatedTrack);
  },

  async deleteTrack(request: FastifyRequest<{ Params: { releaseId: string; trackId: string } }>, reply: FastifyReply) {
    const { releaseId, trackId } = request.params;
    const existingTrack = await trackService.getTrackById(request.server, trackId);
    if (!existingTrack || existingTrack.release_id !== releaseId) {
      throw request.server.httpErrors.notFound('Track not found in this release.');
    }

    const existingRelease = await releaseService.getReleaseById(request.server, releaseId);
    if (!existingRelease) {
      throw request.server.httpErrors.notFound('Associated release not found.');
    }

  
    if (request.user.role !== 'ADMIN' && existingRelease.artist_id !== request.user.id) {
      throw request.server.httpErrors.forbidden('You can only delete tracks for your own releases.');
    }

    const deleted = await trackService.deleteTrack(request.server, trackId);
    if (!deleted) {
      throw request.server.httpErrors.notFound('Track not found.');
    }
    reply.status(204).send();
  },
};