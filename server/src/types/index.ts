import {
  UserRole,
  ReleaseStatus,
  User,
  Release,
  Track,
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
  AuthPayload,
  AuthenticatedUser,
  PaginationOptions,
  PaginationMetadata,
  PaginatedResult,
  StandardErrorResponse,
};


export interface UserWithPassword extends User {
  password_hash: string;
}


export interface UserCreatePayload {
  username: string;
  email: string;
  password_hash: string;
  role: 'ARTIST' | 'ADMIN';
}

export interface UserUpdatePayload {
  email?: string;
  password_hash?: string;
  role?: UserRole;
}

export interface ReleaseCreatePayload {
  artist_id: string;
  title: string;
  genre: string;
  cover_art_url?: string;
  status?: ReleaseStatus;
  processing_error_reason?: string;
  is_featured?: boolean; 
}

export interface ReleaseUpdatePayload {
  title?: string;
  genre?: string;
  cover_art_url?: string;
  status?: ReleaseStatus;
  processing_error_reason?: string;
  is_featured?: boolean; 
}

export interface AdminReleaseStatusUpdatePayload {
  status: 'PUBLISHED' | 'REJECTED';
  processing_error_reason?: string; 
}


export interface ProcessingLogEntry {
  trackId: string;
  timestamp: Date;
  status: 'SUCCESS' | 'FAILED';
  message: string;
}