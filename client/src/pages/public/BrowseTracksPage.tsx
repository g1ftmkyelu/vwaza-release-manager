import React, { useEffect, useState } from 'react';
import { PublicTrack, PaginationMetadata } from '@shared/types';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import toast from 'react-hot-toast';
import { TrackCard } from '../../components/public'; 
import { useSearchParams } from 'react-router-dom';

const BrowseTracksPage: React.FC = () => {
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const fetchTracks = async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: PublicTrack[]; pagination: PaginationMetadata }>(
        `/public/tracks`,
        {
          params: {
            page,
            limit: pagination.limit,
            orderBy: 'created_at',
            orderDirection: 'DESC',
            search: query,
          },
        }
      );
      setTracks(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tracks.');
      toast.error(err.response?.data?.message || 'Failed to fetch tracks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks(pagination.page, searchQuery);
  }, [pagination.page, searchQuery]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchParams(query ? { search: query } : {});
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-lime-light glow-text-lime text-center">Explore Tracks</h1>

      <div className="flex justify-center mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search tracks, albums, artists..." initialQuery={searchQuery} className="w-full max-w-md" />
      </div>

      {tracks.length === 0 ? (
        <EmptyState message="No published tracks found." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        </>
      )}
    </div>
  );
};

export default BrowseTracksPage;