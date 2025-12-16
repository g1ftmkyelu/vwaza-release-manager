import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Release, Track } from '@shared/types';
import api from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { TrackListItem } from '../../components/public'; 
import toast from 'react-hot-toast';
import { FaMusic } from 'react-icons/fa';

const AlbumDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Release | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const albumRes = await api.get<Release>(`/public/releases/${id}`);
        setAlbum(albumRes.data);
        const tracksRes = await api.get<Track[]>(`/public/releases/${id}/tracks`);
        setTracks(tracksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch album details.');
        toast.error(err.response?.data?.message || 'Failed to fetch album details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!album) {
    return <EmptyState message="Album not found or not published." />;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {album.cover_art_url ? (
            <div className="flex-shrink-0">
              <img src={album.cover_art_url} alt={album.title} className="w-64 h-64 object-cover rounded-lg border border-white/10 shadow-md" />
            </div>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-dark-bg-tertiary rounded-lg text-gray-400 text-8xl">
              <FaMusic />
            </div>
          )}
          <div className="flex-grow space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-bold text-lime-light glow-text-lime">{album.title}</h1>
            <p className="text-gray-300 text-xl">Genre: <span className="font-medium text-lime-light">{album.genre}</span></p>
            <p className="text-gray-400 text-sm">Total Tracks: {tracks.length}</p>
       
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-50">Tracks</h2>
        {tracks.length === 0 ? (
          <EmptyState message="No tracks found for this album." />
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => (
              <TrackListItem key={track.id} track={track} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AlbumDetailsPage;