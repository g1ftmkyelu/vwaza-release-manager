import { z } from 'zod';
import {
  UserRole,
  ReleaseStatus,
  User,
  Release,
  Track,
  PublicTrack, 
  AuthPayload,
  AuthenticatedUser,
  PaginationOptions,
  PaginationMetadata,
  PaginatedResult,
  StandardErrorResponse,
} from '@shared/types';

export {
  UserRole,
  ReleaseStatus,
  User,
  Release,
  Track,
  PublicTrack, 
  AuthPayload,
  AuthenticatedUser,
  PaginationOptions,
  PaginationMetadata,
  PaginatedResult,
  StandardErrorResponse,
};


export const trackFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Track title is required.'),
  isrc: z.string().optional().nullable(),
  audioFile: z.any()
    .refine((file: File | null) => !file || (file instanceof File && file.size > 0), 'Audio file is required.')
    .refine((file: File | null) => !file || (file instanceof File && file.size <= 200 * 1024 * 1024), 'Audio file must be less than 200MB.')
    .refine((file: File | null) => !file || (file instanceof File && ['audio/mpeg', 'audio/wav', 'audio/flac'].includes(file.type)), 'Audio file must be MP3, WAV, or FLAC.')
    .optional(),
  audioFileUrl: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  track_number: z.number().optional(),
});

export type TrackFormValues = z.infer<typeof trackFormSchema>;

export const releaseFormSchema = z.object({
  title: z.string().min(1, 'Release title is required.'),
  genre: z.string().min(1, 'Genre is required.'),
  coverArtFile: z.any()
    .refine((file: File | null) => !file || (file instanceof File && file.size > 0), 'Cover art file is required.')
    .refine((file: File | null) => !file || (file instanceof File && file.size <= 10 * 1024 * 1024), 'Cover art must be less than 10MB.')
    .refine((file: File | null) => !file || (file instanceof File && ['image/jpeg', 'image/png'].includes(file.type)), 'Cover art must be a JPG or PNG image.')
    .optional(),
  tracks: z.array(trackFormSchema).min(1, 'At least one track is required.'),
});

export type ReleaseFormValues = z.infer<typeof releaseFormSchema>;