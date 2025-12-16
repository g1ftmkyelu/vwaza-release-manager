import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AlbumDetailsStep from './AlbumDetailsStep';
import TrackUploadStep from './TrackUploadStep';
import ReviewStep from './ReviewStep';
import Button from '../common/Button';
import { ReleaseFormValues, TrackFormValues } from '../../types';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { AuthenticatedUser } from '@shared/types';

const releaseSchema = z.object({
  title: z.string().min(1, 'Release title is required.'),
  genre: z.string().min(1, 'Genre is required.'),
  coverArtFile: z.any()
    .refine((file: File | null) => !file || (file instanceof File && file.size > 0), 'Cover art file is required.')
    .refine((file: File | null) => !file || (file instanceof File && file.size <= 10 * 1024 * 1024), 'Cover art must be less than 10MB.')
    .refine((file: File | null) => !file || (file instanceof File && ['image/jpeg', 'image/png'].includes(file.type)), 'Cover art must be a JPG or PNG image.')
    .optional(),
  tracks: z.array(
    z.object({
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
    })
  ).min(1, 'At least one track is required.'),
});

const ReleaseWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ReleaseFormValues>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      title: '',
      genre: '',
      tracks: [{ title: '', isrc: '', audioFile: null, audioFileUrl: null, duration: null }],
    },
  });

  const { trigger, getValues, setValue, watch, formState: { errors } } = methods;
  const watchedTracks = watch('tracks');

  const handleCoverArtChange = (file: File | null) => {
    setValue('coverArtFile', file);
    if (file) {
      setCoverArtPreview(URL.createObjectURL(file));
    } else {
      setCoverArtPreview(null);
    }
  };

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await trigger(['title', 'genre', 'coverArtFile']);
    } else if (currentStep === 1) {
      isValid = await trigger('tracks');
    
      const tracks = getValues('tracks');
      const allTracksHaveAudio = tracks.every(track => track.audioFile || track.audioFileUrl);
      if (!allTracksHaveAudio) {
        toast.error('All tracks must have an audio file uploaded.');
        isValid = false;
      }
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: ReleaseFormValues) => {
    if (!user?.id) {
      toast.error('User not authenticated.');
      return;
    }
    setIsSubmitting(true);
    toast.loading('Creating release and uploading files...', { id: 'release-submit' });

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('genre', data.genre);
      formData.append('artist_id', user.id); 

      if (data.coverArtFile) {
        formData.append('cover_art', data.coverArtFile);
      }


      const releaseRes = await api.post<{ id: string }>('/releases', formData);
      const releaseId = releaseRes.data.id;


      const trackUploadPromises = data.tracks.map(async (track, index) => {
        const trackFormData = new FormData();
        trackFormData.append('title', track.title);
        trackFormData.append('track_number', (index + 1).toString());
        if (track.isrc) trackFormData.append('isrc', track.isrc);
        if (track.audioFile) trackFormData.append('audio_file', track.audioFile);

        try {
          const trackRes = await api.post(`/tracks/${releaseId}`, trackFormData);
          setValue(`tracks.${index}.audioFileUrl`, trackRes.data.audio_file_url);
          setValue(`tracks.${index}.duration`, trackRes.data.duration);
          return trackRes.data;
        } catch (trackErr) {
          toast.error(`Failed to upload track ${track.title}.`);
          throw trackErr; 
        }
      });

      await Promise.all(trackUploadPromises);

      
      await api.post(`/releases/${releaseId}/submit`);

      toast.success('Release created and submitted for processing!', { id: 'release-submit' });
      navigate('/artist/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create release.', { id: 'release-submit' });
      console.error('Release submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    <AlbumDetailsStep key="step1" onCoverArtChange={handleCoverArtChange} coverArtPreview={coverArtPreview} />,
    <TrackUploadStep key="step2" />,
    <ReviewStep key="step3" coverArtPreview={coverArtPreview} />,
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="w-full bg-dark-bg-tertiary rounded-full h-2.5 mb-4">
          <div
            className="bg-lime-accent h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {steps[currentStep]}

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <Button type="button" variant="secondary" onClick={handlePrevious} disabled={isSubmitting}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="button" variant="primary" onClick={handleNext} disabled={isSubmitting} className="ml-auto">
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="submit" variant="primary" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Submit Release'}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ReleaseWizard;