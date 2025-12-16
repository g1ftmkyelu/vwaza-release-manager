import { FastifyInstance } from 'fastify';
import { Release, Track } from '@shared/types';
import { ProcessingLogEntry } from '../types';
import { releaseService } from './releaseService';
import { trackService } from './trackService';


const processingLogs = new Map<string, ProcessingLogEntry[]>();

export const processingService = {

  async simulateAudioTranscoding(fastify: FastifyInstance, track: Track): Promise<{ success: boolean; message: string }> {
    const delay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000; 
    const shouldFail = Math.random() < 0.1;

    return new Promise(resolve => {
      setTimeout(() => {
        if (shouldFail) {
          fastify.log.warn(`Simulated audio transcoding FAILED for track ${track.id} (release ${track.release_id})`);
          resolve({ success: false, message: 'Simulated audio transcoding failed.' });
        } else {
          fastify.log.info(`Simulated audio transcoding SUCCESS for track ${track.id} (release ${track.release_id}) in ${delay / 1000}s`);
          resolve({ success: true, message: 'Audio transcoding successful.' });
        }
      }, delay);
    });
  },


  async simulateMetadataExtraction(fastify: FastifyInstance, track: Track): Promise<{ success: boolean; message: string }> {
    const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000; 
    const shouldFail = Math.random() < 0.05; 

    return new Promise(resolve => {
      setTimeout(() => {
        if (shouldFail) {
          fastify.log.warn(`Simulated metadata extraction FAILED for track ${track.id} (release ${track.release_id})`);
          resolve({ success: false, message: 'Simulated metadata extraction failed.' });
        } else {
          fastify.log.info(`Simulated metadata extraction SUCCESS for track ${track.id} (release ${track.release_id}) in ${delay / 1000}s`);
          resolve({ success: true, message: 'Metadata extraction successful.' });
        }
      }, delay);
    });
  },


  async processTrack(fastify: FastifyInstance, track: Track): Promise<ProcessingLogEntry> {
    const logs: string[] = [];
    let overallSuccess = true;

    try {

      const transcodingResult = await this.simulateAudioTranscoding(fastify, track);
      logs.push(`Transcoding: ${transcodingResult.message}`);
      if (!transcodingResult.success) {
        overallSuccess = false;
      }

    
      const metadataResult = await this.simulateMetadataExtraction(fastify, track);
      logs.push(`Metadata: ${metadataResult.message}`);
      if (!metadataResult.success) {
        overallSuccess = false;
      }

      if (overallSuccess) {
        return {
          trackId: track.id,
          timestamp: new Date(),
          status: 'SUCCESS',
          message: 'Track processed successfully.',
        };
      } else {
        return {
          trackId: track.id,
          timestamp: new Date(),
          status: 'FAILED',
          message: logs.join('; '),
        };
      }
    } catch (error: any) {
      fastify.log.error(`Unexpected error processing track ${track.id}:`, error);
      return {
        trackId: track.id,
        timestamp: new Date(),
        status: 'FAILED',
        message: `Unexpected error: ${error.message || 'Unknown error'}`,
      };
    }
  },


  async processRelease(fastify: FastifyInstance, releaseId: string): Promise<void> {
    fastify.log.info(`Starting background processing for release ${releaseId}`);
    let release: Release | undefined;
    let tracks: Track[] = [];

    try {
      release = await releaseService.getReleaseById(fastify, releaseId);
      if (!release) {
        fastify.log.error(`Release ${releaseId} not found for processing.`);
        await releaseService.updateReleaseStatus(fastify, releaseId, 'REJECTED', 'Release not found during processing.');
        return;
      }

      tracks = await trackService.getTracksByRelease(fastify, releaseId);
      if (tracks.length === 0) {
        fastify.log.warn(`Release ${releaseId} has no tracks to process. Setting to PENDING_REVIEW.`);
        await releaseService.updateReleaseStatus(fastify, releaseId, 'PENDING_REVIEW', 'No tracks to process.');
        return;
      }

    
      const trackProcessingPromises = tracks.map(track => this.processTrack(fastify, track));
      const results = await Promise.allSettled(trackProcessingPromises);

      const releaseLogs: ProcessingLogEntry[] = [];
      let allTracksSuccessful = true;
      const failedTrackMessages: string[] = [];

      results.forEach((result, index) => {
        const track = tracks[index];
        if (result.status === 'fulfilled') {
          releaseLogs.push(result.value);
          if (result.value.status === 'FAILED') {
            allTracksSuccessful = false;
            failedTrackMessages.push(`Track ${track.title} (${track.id}): ${result.value.message}`);
          }
        } else {
        
          allTracksSuccessful = false;
          const errorMessage = result.reason?.message || 'Unknown error';
          releaseLogs.push({
            trackId: track.id,
            timestamp: new Date(),
            status: 'FAILED',
            message: `Unexpected processing error: ${errorMessage}`,
          });
          failedTrackMessages.push(`Track ${track.title} (${track.id}): Unexpected error - ${errorMessage}`);
        }
      });

      processingLogs.set(releaseId, releaseLogs);

      if (allTracksSuccessful) {
        fastify.log.info(`All tracks for release ${releaseId} processed successfully. Setting status to PENDING_REVIEW.`);
        await releaseService.updateReleaseStatus(fastify, releaseId, 'PENDING_REVIEW');
      } else {
        const errorReason = `Failed to process ${failedTrackMessages.length} track(s): ${failedTrackMessages.join('; ')}`;
        fastify.log.error(`Processing FAILED for release ${releaseId}. Setting status to REJECTED. Reason: ${errorReason}`);
        await releaseService.updateReleaseStatus(fastify, releaseId, 'REJECTED', errorReason);
      }
    } catch (error: any) {
      fastify.log.error(`Critical error during release processing for ${releaseId}:`, error);
   
      await releaseService.updateReleaseStatus(fastify, releaseId, 'REJECTED', `Critical processing error: ${error.message || 'Unknown error'}`);
    }
  },


  getProcessingLogs(releaseId: string): ProcessingLogEntry[] | undefined {
    return processingLogs.get(releaseId);
  },
};