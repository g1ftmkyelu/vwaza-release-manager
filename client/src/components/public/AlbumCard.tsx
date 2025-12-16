import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Release } from '@shared/types';
import { FaMusic, FaPlay, FaClock, FaCalendar, FaUser, FaHeart, FaShare } from 'react-icons/fa';

interface AlbumCardProps {
  album: Release;
  showActions?: boolean; 
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, showActions = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);

  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

  };

  return (
    <Link to={`/albums/${album.id}`} className="block group">
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-lime-accent/20 transition-all duration-500 transform hover:scale-[1.02]">
   
        {album.cover_art_url ? (
          <>
            <img
              src={album.cover_art_url}
              alt={album.title}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary animate-pulse flex items-center justify-center">
                <FaMusic className="text-gray-600 text-6xl animate-pulse" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-bg-secondary via-dark-bg-tertiary to-dark-bg-secondary">
            <FaMusic className="text-gray-600 text-6xl group-hover:text-lime-accent/30 transition-all duration-500" />
          </div>
        )}

     
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

   
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-lime-accent rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-lime-accent flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500 shadow-2xl cursor-pointer hover:bg-lime-light">
              <FaPlay className="text-dark-bg-primary text-2xl ml-1" />
            </div>
          </div>
        </div>

   
        {showActions && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transform hover:scale-110 transition-all duration-200 ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <FaHeart className={isLiked ? 'animate-pulse' : ''} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transform hover:scale-110 transition-all duration-200"
            >
              <FaShare />
            </button>
          </div>
        )}

  
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white z-10">
    
          <div className="transform transition-all duration-500 group-hover:-translate-y-3">
            <h3 className="text-2xl font-bold mb-2 line-clamp-2 drop-shadow-2xl leading-tight">
              {album.title}
            </h3>
            <p className="text-lime-accent font-semibold text-sm mb-1 line-clamp-1 drop-shadow-lg">
              {album.genre || 'Various'}
            </p>
          </div>


          <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500 ease-out">
            <div className="space-y-2.5 mt-4 pt-4 border-t border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">

                <div className="flex items-center gap-2.5 text-sm text-gray-200">
                  <div className="w-6 h-6 rounded-full bg-lime-accent/20 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-lime-accent text-xs" />
                  </div>
                  <span className="line-clamp-1 font-medium">Artist Name (Placeholder)</span>
                </div>
   
              
              <div className="flex items-center justify-between gap-4 text-xs text-gray-300">
                {album.track_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FaMusic className="text-lime-accent" />
                    <span>{album.track_count} tracks</span>
                  </div>
                )}



                {album.created_at && ( 
                  <div className="flex items-center gap-1.5">
                    <FaCalendar className="text-lime-accent" />
                    <span>{new Date(album.created_at).getFullYear()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {album.is_featured && ( 
          <div className="absolute top-3 left-3 z-30">
            <div className="relative">
              <div className="absolute inset-0 bg-lime-accent blur-md opacity-50" />
              <div className="relative bg-gradient-to-r from-lime-accent to-lime-light text-dark-bg-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-xl uppercase tracking-wide">
                Featured
              </div>
            </div>
          </div>
        )}


        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl ring-2 ring-lime-accent/50 ring-offset-2 ring-offset-dark-bg-primary" />
        </div>
      </div>
    </Link>
  );
};



export default AlbumCard;