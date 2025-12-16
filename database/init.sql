CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    CREATE TYPE USER_ROLE AS ENUM ('ARTIST', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE RELEASE_STATUS AS ENUM ('DRAFT', 'PROCESSING', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255)  NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role USER_ROLE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    cover_art_url TEXT,
    status RELEASE_STATUS NOT NULL DEFAULT 'DRAFT',
    processing_error_reason TEXT,
    is_featured BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


DO $$
BEGIN
    ALTER TABLE releases ADD COLUMN IF NOT EXISTS processing_error_reason TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

song
DO $$
BEGIN
    ALTER TABLE releases ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases (artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases (status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON releases (created_at);

CREATE INDEX IF NOT EXISTS idx_releases_is_featured ON releases (is_featured);

CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    isrc VARCHAR(12) UNIQUE,
    audio_file_url TEXT,
    duration INTEGER, 
    track_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_track_number_per_release UNIQUE (release_id, track_number)
);

CREATE INDEX IF NOT EXISTS idx_tracks_release_id ON tracks (release_id);
CREATE INDEX IF NOT EXISTS idx_tracks_track_number ON tracks (track_number);
CREATE INDEX IF NOT EXISTS idx_tracks_isrc ON tracks (isrc);

-- Function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_releases_updated_at
    BEFORE UPDATE ON releases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;