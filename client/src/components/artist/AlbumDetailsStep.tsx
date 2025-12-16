import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import { ReleaseFormValues } from '../../types';
import { genres } from '../../utils/constants';
import Card from '../common/Card';

interface AlbumDetailsStepProps {
  onCoverArtChange: (file: File | null) => void;
  coverArtPreview: string | null;
}

const AlbumDetailsStep: React.FC<AlbumDetailsStepProps> = ({ onCoverArtChange, coverArtPreview }) => {
  const { register, formState: { errors } } = useFormContext<ReleaseFormValues>();

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-lime-light glow-text-lime">Album Details</h2>

      <div>
        <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">
          Release Title
        </label>
        <Input
          id="title"
          type="text"
          placeholder="e.g., My Debut Album"
          {...register('title')}
          error={errors.title?.message}
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-gray-300 text-sm font-bold mb-2">
          Genre
        </label>
        <select
          id="genre"
          {...register('genre')}
          className="glass-input w-full p-2 rounded-md focus:outline-none"
        >
          <option value="">Select a genre</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        {errors.genre && <p className="text-red-500 text-xs italic mt-1">{errors.genre.message}</p>}
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">
          Cover Art
        </label>
        <FileUpload
          onFileChange={onCoverArtChange}
          preview={coverArtPreview}
          accept="image/jpeg,image/png"
          maxSizeMB={10}
          error={errors.coverArtFile?.message}
        />
        <p className="text-gray-400 text-xs mt-2">Accepted: JPG, PNG. Max size: 10MB.</p>
      </div>
    </Card>
  );
};

export default AlbumDetailsStep;