import React, { useEffect, useState } from 'react';
import { Release } from '@shared/types';
import api from '../../services/api';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import { format } from 'date-fns';
import EmptyState from '../common/EmptyState';
import usePolling from '../../hooks/usePolling';
import toast from 'react-hot-toast';

const StatusTracker: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchArtistReleases = async () => {
    try {
      const response = await api.get<{ data: Release[] }>('/releases');
      setReleases(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch releases.');
      toast.error(err.response?.data?.message || 'Failed to fetch releases.');
    } finally {
      setLoading(false);
    }
  };


  usePolling(fetchArtistReleases, 10000); 

  useEffect(() => {
    fetchArtistReleases();
  }, []);

  const filteredReleases = releases.filter(release =>
    filterStatus === 'ALL' || release.status === filterStatus
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-lime-light glow-text-lime mb-6">My Releases</h2>

      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="statusFilter" className="text-gray-300 font-medium">Filter by Status:</label>
        <select
          id="statusFilter"
          className="glass-input p-2 rounded-md focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="DRAFT">Draft</option>
          <option value="PROCESSING">Processing</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {filteredReleases.length === 0 ? (
        <EmptyState message="You haven't created any releases yet. Start by creating a new one!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReleases.map((release) => (
            <Card key={release.id} className="p-4 flex flex-col space-y-3">
              <div className="flex items-center gap-4">
                {release.cover_art_url && (
                  <img src={release.cover_art_url} alt={release.title} className="w-16 h-16 object-cover rounded-md border border-white/10" />
                )}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-50">{release.title}</h3>
                  <p className="text-gray-400 text-sm">{release.track_count} Tracks</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <p>Created: {format(new Date(release.created_at as string), 'MMM dd, yyyy')}</p>
                <StatusBadge status={release.status} />
              </div>
              {release.status === 'REJECTED' && release.processing_error_reason && (
                <p className="text-red-400 text-xs mt-2">Reason: {release.processing_error_reason}</p>
              )}

            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusTracker;