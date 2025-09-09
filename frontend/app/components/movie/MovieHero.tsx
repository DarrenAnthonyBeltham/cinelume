"use client";

import { useState } from 'react';
import Image from 'next/image';
import TrailerModal from './TrailerModal';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MovieHero({ details, videos }: { details: any, videos: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const mediaType = details.title ? 'movie' : 'tv';

  const handleAddToWatchlist = async (status: string) => {
    if (!user) {
      toast.error('Please log in to add to your watchlist.');
      return;
    }
    try {
      await api.post('/watchlist', {
        mediaId: details.id,
        mediaType: mediaType,
        title: title,
        posterPath: details.poster_path,
        status: status,
      });
      toast.success(`Added to ${status}!`);
    } catch (error) {
      toast.error('Failed to add to watchlist.');
    }
  };

  return (
    <>
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-0 pb-8">
          <div className="flex items-end space-x-8">
            <div className="w-48 h-72 relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white">{title}</h1>
              <p className="text-gray-300 mt-2">{details.tagline}</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center text-yellow-400">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold ml-2">{details.vote_average.toFixed(1)}</span>
                </div>
                {releaseDate && <p className="text-gray-300">{releaseDate.substring(0, 4)}</p>}
                {details.runtime && <p className="text-gray-300">{details.runtime} min</p>}
                {details.number_of_seasons && <p className="text-gray-300">{details.number_of_seasons} Seasons</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-start md:items-center">
          <p className="text-gray-300 flex-grow md:pr-8">{details.overview}</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0 flex-shrink-0">
            {trailer && (
              <button onClick={() => setIsModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors">Watch Trailer</button>
            )}
            <button onClick={() => handleAddToWatchlist('Plan to Watch')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add to Watchlist</button>
          </div>
        </div>
      </div>

      {trailer && <TrailerModal videoKey={trailer.key} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}