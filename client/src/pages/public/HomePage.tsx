import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { FaMusic, FaArrowRight, FaPlay, FaTrophy, FaFire, FaClock } from 'react-icons/fa';
import { PublicTrack, Release } from '@shared/types';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { AlbumCard, TrackCard, TrackPlayerModal } from '../../components/public';
import { genres } from '../../utils/constants';

interface TrackCategory {
  title: string;
  icon: React.ReactNode;
  tracks: PublicTrack[];
  endpoint: string;
}

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<TrackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ artists: 0, albums: 0, plays: 0 }); 
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [featuredAlbum, setFeaturedAlbum] = useState<Release | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<PublicTrack | null>(null);

  const fetchTracks = useCallback(async (genreFilter: string | null = null) => {
    setLoading(true);
    try {
      const commonParams = { limit: 4, ...(genreFilter && { genre: genreFilter }) };

 
      const [latest, popular, discover] = await Promise.all([
        api.get<{ data: PublicTrack[] }>('/public/tracks', {
          params: { ...commonParams, orderBy: 'created_at', orderDirection: 'DESC' },
        }),
        api.get<{ data: PublicTrack[] }>('/public/tracks', {
          params: { ...commonParams, orderBy: 'title', orderDirection: 'ASC' }, 
        }),
        api.get<{ data: PublicTrack[] }>('/public/tracks', {
          params: { ...commonParams, orderBy: 'created_at', orderDirection: 'ASC' }, 
        }),
      ]);

      setCategories([
        {
          title: 'Latest Tracks',
          icon: <FaClock className="text-lime-400" />,
          tracks: latest.data.data,
          endpoint: `/tracks?sort=recent${genreFilter ? `&genre=${genreFilter}` : ''}`,
        },
        {
          title: 'Popular Tracks',
          icon: <FaFire className="text-lime-500" />,
          tracks: popular.data.data,
          endpoint: `/tracks?sort=popular${genreFilter ? `&genre=${genreFilter}` : ''}`,
        },
        {
          title: 'Discover Tracks',
          icon: <FaTrophy className="text-lime-400" />,
          tracks: discover.data.data,
          endpoint: `/tracks?sort=discover${genreFilter ? `&genre=${genreFilter}` : ''}`,
        },
      ]);

  
      setStats({ artists: 1250, albums: 3420, plays: 125000 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedAlbum = useCallback(async () => {
    try {
      const response = await api.get<{ data: Release[] }>('/public/releases', {
        params: { limit: 1, is_featured: true },
      });
      if (response.data.data.length > 0) {
        setFeaturedAlbum(response.data.data[0]);
      } else {
        setFeaturedAlbum(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load featured album');
    }
  }, []);

  useEffect(() => {
    fetchFeaturedAlbum();
  }, [fetchFeaturedAlbum]);

  useEffect(() => {
    fetchTracks(selectedGenre);
  }, [fetchTracks, selectedGenre]);

  const handleGenreSelect = (genre: string | null) => {
    setSelectedGenre(genre);
  };

  const handlePlayTrack = (track: PublicTrack) => {
    setCurrentPlayingTrack(track);
    setIsPlayerModalOpen(true);
  };

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setCurrentPlayingTrack(null);
  };

  return (
    <div className="min-h-screen">

      {!loading && featuredAlbum ? (
        <section className="relative mt-11 h-[30vh] md:h-[35vh] lg:h-[40vh] xl:h-[45vh] overflow-hidden flex items-center justify-center text-white">
          {featuredAlbum.cover_art_url && (
            <img
              src={featuredAlbum.cover_art_url}
              alt={featuredAlbum.title}
              className="absolute inset-0 w-full h-full object-cover filter brightness-50 blur-sm scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg-primary via-dark-bg-primary/60 to-transparent" />
          <div className="relative z-10 text-center p-6 max-w-4xl mx-auto space-y-6">
            <FaTrophy className="text-lime-accent text-5xl mx-auto mb-4 glow-text-lime" />
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-gray-50 glow-text-lime drop-shadow-lg">
              {featuredAlbum.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 font-semibold drop-shadow-md">
               <span className="text-lime-light">{featuredAlbum.genre}</span>
            </p>

            <Link to={`/albums/${featuredAlbum.id}`}>
              <Button variant="primary" className="text-lg px-8 py-4 mt-6 shadow-xl flex items-center gap-3 mx-auto">
                <FaPlay /> Listen Now
              </Button>
            </Link>
          </div>
        </section>
      ) : !loading && (
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-6">
          <EmptyState message="No featured album available right now." />
        </section>
      )}

 
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-50 mb-6">Browse by Genre</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedGenre === null ? 'primary' : 'ghost'}
            onClick={() => handleGenreSelect(null)}
            className="px-4 py-2 rounded-full"
          >
            All Genres
          </Button>
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'primary' : 'ghost'}
              onClick={() => handleGenreSelect(genre)}
              className="px-4 py-2 rounded-full"
            >
              {genre}
            </Button>
          ))}
        </div>
      </section>

  
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="text-lime-accent text-3xl" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-50">Featured Album</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : featuredAlbum ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AlbumCard album={featuredAlbum} />
          </div>
        ) : (
          <EmptyState message="No featured album available right now." />
        )}
      </section>


      <section className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.title} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category.icon}
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-50">
                    {category.title}
                  </h2>
                </div>
                <Link to={category.endpoint}>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-lime-accent hover:text-lime-light transition-colors group"
                  >
                    See All
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {category.tracks.length === 0 ? (
                <EmptyState message={`No ${category.title.toLowerCase()} available yet.`} />
              ) : (
                <div className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar"> 
                  {category.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex-shrink-0 w-64 animate-fade-in-up" 
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TrackCard track={track} onPlay={handlePlayTrack} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>

  
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <Card className="relative overflow-hidden bg-gradient-to-r from-lime-accent/10 to-lime-light/5 border-lime-accent/30">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
          <div className="relative p-12 md:p-16 text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-50">
              Ready to Share Your Sound?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of independent artists using Vwaza to reach fans worldwide.
              Upload unlimited tracks, manage releases, and track your growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register">
                <Button variant="primary" className="text-lg px-8 py-4 shadow-xl">
                  Start Free Today
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" className="text-lg px-8 py-4">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>


      <TrackPlayerModal
        isOpen={isPlayerModalOpen}
        onClose={handleClosePlayerModal}
        track={currentPlayingTrack}
      />
    </div>
  );
};

export default HomePage;