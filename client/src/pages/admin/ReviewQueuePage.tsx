import React, { useEffect, useState } from 'react';
import { Release } from '@shared/types';
import api from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const AdminReviewQueuePage: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingReleases();
  }, []);

  const fetchPendingReleases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: Release[] }>('/releases', {
        params: { status: 'PENDING_REVIEW', orderBy: 'created_at', orderDirection: 'ASC' }
      });
      setReleases(response.data.data.filter(r => r.status === 'PENDING_REVIEW')); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending releases.');
      toast.error(err.response?.data?.message || 'Failed to fetch pending releases.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (releaseId: string) => {
    navigate(`/admin/releases/${releaseId}/review`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-lime-light glow-text-lime mb-8">Review Queue</h1>

      {releases.length === 0 ? (
        <EmptyState message="No releases currently pending review. Great job!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {releases.map((release) => (
            <Card key={release.id} className="p-4 flex flex-col space-y-3">
              <div className="flex items-center gap-4">
                {release.cover_art_url && (
                  <img src={release.cover_art_url} alt={release.title} className="w-16 h-16 object-cover rounded-md border border-white/10" />
                )}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-50">{release.title}</h3>
                  <p className="text-gray-400 text-sm">Artist ID: <span className="font-mono text-xs">{release.artist_id}</span></p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <p>Submitted: {format(new Date(release.created_at as string), 'MMM dd, yyyy')}</p>
                <StatusBadge status={release.status} />
              </div>
              <Button variant="secondary" onClick={() => handleViewDetails(release.id)} className="mt-2">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewQueuePage;