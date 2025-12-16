export type UserRole = 'ARTIST' | 'ADMIN';
export type ReleaseStatus = 'DRAFT' | 'PROCESSING' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface Release {
  id: string;
  artist_id: string;
  title: string;
  genre: string;
  cover_art_url?: string;
  status: ReleaseStatus;
  processing_error_reason?: string;
  created_at: string | Date;
  updated_at: string | Date;
  track_count: number;
  is_featured?: boolean; 
}

export interface Track {
  id: string;
  release_id: string;
  title: string;
  isrc?: string;
  audio_file_url?: string;
  duration?: number; 
  track_number: number;
  created_at: string | Date;
  updated_at: string | Date;
}


export interface PublicTrack extends Track {
  album_id: string;
  album_title: string;
  album_cover_art_url?: string;
  artist_name: string; 
}

export interface AuthPayload {
  email: string;
  password_hash: string;
}

export interface AuthenticatedUser {
  id: string;
  username:string;
  email: string;
  role: UserRole;
}


export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}


export interface StandardErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: string;
  stack?: string;
}