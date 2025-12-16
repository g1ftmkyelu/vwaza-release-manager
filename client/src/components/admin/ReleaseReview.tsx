import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Release, Track, ReleaseStatus } from '@shared/types';
import api from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import AudioPlayer from '../common/AudioPlayer';
import ConfirmModal from '../common/ConfirmModal';
import StatusBadge from '../common/StatusBadge';
import Input from '../common/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import EmptyState from '../common/EmptyState';

const ReleaseReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [release, setRelease] = useState<Release | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchReleaseDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const releaseRes = await api.get<Release>(`/releases/${id}`);
        setRelease(releaseRes.data);
        const tracksRes = await api.get<Track[]>(`/tracks/${id}`);
        setTracks(tracksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch release details.');
        toast.error(err.response?.data?.message || 'Failed to fetch release details.');
      } finally {
        setLoading(false);
      }
    };

    fetchReleaseDetails();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await api.post(`/releases/${id}/status`, { status: 'PUBLISHED' });
      toast.success('Release approved successfully!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve release.');
    } finally {
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    try {
      await api.post(`/releases/${id}/status`, { status: 'REJECTED', processing_error_reason: rejectionReason });
      toast.success('Release rejected successfully!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject release.');
    } finally {
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!release) {
    return <EmptyState message="Release not found." />;
  }

  const isPendingReview = release.status === 'PENDING_REVIEW';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-lime-light glow-text-lime mb-6">Review Release: {release.title}</h1>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          {release.cover_art_url && (
            <div className="flex-shrink-0">
              <img src={release.cover_art_url} alt={release.title} className="w-48 h-48 object-cover rounded-lg border border-white/10 shadow-md" />
            </div>
          )}
          <div className="flex-grow space-y-2">
            <h2 className="text-2xl font-semibold text-gray-50">{release.title}</h2>
            <p className="text-gray-300">Genre: <span className="font-medium text-lime-light">{release.genre}</span></p>
            <p className="text-gray-300">Artist ID: <span className="font-mono text-sm text-gray-400">{release.artist_id}</span></p>
            <div className="flex items-center gap-2">
              <p className="text-gray-300">Status:</p>
              <StatusBadge status={release.status} />
            </div>
            {release.processing_error_reason && (
              <p className="text-red-400 text-sm">Reason for Rejection: {release.processing_error_reason}</p>
            )}
            <p className="text-gray-400 text-sm">Created: {format(new Date(release.created_at as string), 'PPP p')}</p>
            <p className="text-gray-400 text-sm">Last Updated: {format(new Date(release.updated_at as string), 'PPP p')}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-50">Tracks ({tracks.length})</h3>
        {tracks.length === 0 ? (
          <EmptyState message="No tracks found for this release." />
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => (
              <div key={track.id} className="glass-card p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-grow">
                  <p className="text-lg font-medium text-gray-50">{track.track_number}. {track.title}</p>
                  {track.isrc && <p className="text-gray-400 text-sm">ISRC: {track.isrc}</p>}
                  {track.duration && <p className="text-gray-400 text-sm">Duration: {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>}
                </div>
                {track.audio_file_url && (
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <AudioPlayer src={track.audio_file_url} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {isPendingReview && (
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="danger" onClick={() => setShowRejectModal(true)}>Reject</Button>
          <Button variant="primary" onClick={() => setShowApproveModal(true)}>Approve</Button>
        </div>
      )}

      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Confirm Approval"
        message={`Are you sure you want to approve the release "${release.title}"? It will be marked as PUBLISHED.`}
        confirmText="Approve"
        confirmVariant="primary"
      />

      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Confirm Rejection"
        message={`Are you sure you want to reject the release "${release.title}"? It will be marked as REJECTED.`}
        confirmText="Reject"
        confirmVariant="danger"
      >
        <div className="mt-4">
          <label htmlFor="rejectionReason" className="block text-gray-300 text-sm font-bold mb-2">
            Reason for Rejection:
          </label>
          <Input
            id="rejectionReason"
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Poor audio quality, missing metadata"
            className="w-full"
          />
        </div>
      </ConfirmModal>
    </div>
  );
};

export default ReleaseReview;