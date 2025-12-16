import React, { useEffect, useState } from 'react';
import { Release, PaginationMetadata } from '@shared/types';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { AlbumCard } from '../../components/public'; 
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import toast from 'react-hot-toast';

const BrowseAlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlbums = async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: Release[]; pagination: PaginationMetadata }>(
        `/public/releases`,
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
      setAlbums(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch albums.');
      toast.error(err.response?.data?.message || 'Failed to fetch albums.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums(pagination.page, searchQuery);
  }, [pagination.page, searchQuery]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); 
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-lime-light glow-text-lime text-center">Explore Albums</h1>

      <div className="flex justify-center mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search albums..." className="w-full max-w-md" />
      </div>

      {albums.length === 0 ? (
        <EmptyState message="No published albums found." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
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

export default BrowseAlbumsPage;