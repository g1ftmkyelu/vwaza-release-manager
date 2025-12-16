import React from 'react';
import { PublicTrack } from '@shared/types';
import AudioPlayer from '../common/AudioPlayer';
import Card from '../common/Card';
import Button from '../common/Button';
import { FaTimes, FaMusic, FaUser } from 'react-icons/fa';

interface TrackPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: PublicTrack | null;
}

const TrackPlayerModal: React.FC<TrackPlayerModalProps> = ({ isOpen, onClose, track }) => {
  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <Card className="p-6 w-full max-w-lg space-y-6 relative">
        <Button variant="icon" onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-400">
          <FaTimes size={20} />
        </Button>

        <div className="flex flex-col items-center text-center space-y-4">
          {track.album_cover_art_url ? (
            <img
              src={track.album_cover_art_url}
              alt={track.album_title}
              className="w-48 h-48 object-cover rounded-lg border border-white/10 shadow-md"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-dark-bg-tertiary rounded-lg text-gray-400 text-6xl">
              <FaMusic />
            </div>
          )}
          <h3 className="text-2xl font-bold text-lime-light glow-text-lime">{track.title}</h3>
          <p className="text-gray-300 flex items-center gap-2">
            <FaUser className="text-lime-accent" /> {track.artist_name}
          </p>
          <p className="text-gray-400 text-sm">Album: {track.album_title}</p>
        </div>

        {track.audio_file_url ? (
          <AudioPlayer src={track.audio_file_url} className="w-full" />
        ) : (
          <p className="text-red-400 text-center">Audio file not available.</p>
        )}
      </Card>
    </div>
  );
};

export default TrackPlayerModal;