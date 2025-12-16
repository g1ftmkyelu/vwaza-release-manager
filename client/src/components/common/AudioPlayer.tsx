import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import clsx from 'clsx';
import Button from './Button'; // Import the Button component

interface AudioPlayerProps {
  src: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded]);

  return (
    <div className={clsx("glass-card p-3 rounded-lg flex items-center gap-3 text-gray-100", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <Button variant="icon" onClick={togglePlayPause} className="text-lime-light hover:text-lime-light/80">
        {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
      </Button>

      <div className="flex-grow flex items-center gap-2">
        <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-accent"
        />
        <span className="text-xs text-gray-400">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="icon" onClick={toggleMute} className="text-gray-400 hover:text-lime-light">
          {isMuted || volume === 0 ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-accent"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;