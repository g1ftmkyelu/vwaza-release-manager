import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ReleaseFormValues } from '../../types';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';

interface ReviewStepProps {
  coverArtPreview: string | null;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ coverArtPreview }) => {
  const { getValues } = useFormContext<ReleaseFormValues>();
  const { title, genre, tracks } = getValues();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-lime-light glow-text-lime">Review & Submit</h2>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-gray-50">Album Details</h3>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {coverArtPreview && (
            <img src={coverArtPreview} alt="Cover Art Preview" className="w-32 h-32 object-cover rounded-lg border border-white/10 shadow-md" />
          )}
          <div className="space-y-1">
            <p className="text-gray-300"><span className="font-semibold">Title:</span> {title}</p>
            <p className="text-gray-300"><span className="font-semibold">Genre:</span> {genre}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-gray-50">Tracks ({tracks.length})</h3>
        {tracks.length === 0 ? (
          <EmptyState message="No tracks added." />
        ) : (
          <ul className="space-y-3">
            {tracks.map((track, index) => (
              <li key={index} className="glass-card p-3 rounded-md flex items-center gap-4">
                <span className="text-lime-light font-bold">{index + 1}.</span>
                <div className="flex-grow">
                  <p className="text-gray-50 font-medium">{track.title}</p>
                  {track.isrc && <p className="text-gray-400 text-sm">ISRC: {track.isrc}</p>}
                  {track.audioFile && <p className="text-gray-400 text-sm">File: {track.audioFile.name}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-gray-300 text-sm">
        Please review all details carefully before submitting. Once submitted, the release will enter the processing queue.
      </p>
    </Card>
  );
};

export default ReviewStep;