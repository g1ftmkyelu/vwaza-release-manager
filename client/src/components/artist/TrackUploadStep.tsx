import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import Input from '../common/Input';
import FileUpload from '../common/FileUpload';
import Button from '../common/Button';
import { ReleaseFormValues } from '../../types';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const TrackUploadStep: React.FC = () => {
  const { register, control, setValue, formState: { errors } } = useFormContext<ReleaseFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'tracks',
  });

  const handleAudioFileChange = (index: number, file: File | null) => {
    setValue(`tracks.${index}.audioFile`, file);
  };

  const addTrack = () => {
    append({ title: '', isrc: '', audioFile: null, audioFileUrl: null, duration: null });
  };

  const removeTrack = (index: number) => {
    if (fields.length === 1) {
      toast.error('At least one track is required.');
      return;
    }
    remove(index);
  };

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-lime-light glow-text-lime">Track Uploads</h2>

      {fields.map((field, index) => (
        <div key={field.id} className="glass-card p-4 rounded-lg space-y-4 border border-white/10 relative">
          <div className="absolute top-2 right-2 flex gap-2">
            {index > 0 && (
              <Button type="button" variant="icon" onClick={() => move(index, index - 1)} className="text-gray-400 hover:text-lime-light">
                <FaArrowUp />
              </Button>
            )}
            {index < fields.length - 1 && (
              <Button type="button" variant="icon" onClick={() => move(index, index + 1)} className="text-gray-400 hover:text-lime-light">
                <FaArrowDown />
              </Button>
            )}
            <Button type="button" variant="icon" onClick={() => removeTrack(index)} className="text-red-400 hover:text-red-500">
              <FaTrash />
            </Button>
          </div>

          <h3 className="text-xl font-medium text-gray-50">Track {index + 1}</h3>

          <div>
            <label htmlFor={`tracks.${index}.title`} className="block text-gray-300 text-sm font-bold mb-2">
              Track Title
            </label>
            <Input
              id={`tracks.${index}.title`}
              type="text"
              placeholder="e.g., My Awesome Song"
              {...register(`tracks.${index}.title`)}
              error={errors.tracks?.[index]?.title?.message}
            />
          </div>

          <div>
            <label htmlFor={`tracks.${index}.isrc`} className="block text-gray-300 text-sm font-bold mb-2">
              ISRC Code (Optional)
            </label>
            <Input
              id={`tracks.${index}.isrc`}
              type="text"
              placeholder="e.g., US-S1Z-99-00001"
              {...register(`tracks.${index}.isrc`)}
              error={errors.tracks?.[index]?.isrc?.message}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Audio File
            </label>
            <FileUpload
              onFileChange={(file) => handleAudioFileChange(index, file)}
              accept="audio/mpeg,audio/wav,audio/flac"
              maxSizeMB={200}
              error={errors.tracks?.[index]?.audioFile?.message}
            />
            <p className="text-gray-400 text-xs mt-2">Accepted: MP3, WAV, FLAC. Max size: 200MB.</p>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addTrack} className="w-full flex items-center justify-center gap-2">
        <FaPlus /> Add Another Track
      </Button>
    </Card>
  );
};

export default TrackUploadStep;