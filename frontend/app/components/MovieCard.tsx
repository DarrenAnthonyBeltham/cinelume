import Image from 'next/image';
import { Movie } from '../types';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-400/50 transition-shadow duration-300 h-full flex flex-col">
      <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
        <Image
          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
          alt={`Poster for ${movie.title || movie.name}`}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-full text-sm font-bold flex items-center">
          <span className="text-yellow-400 mr-1">⭐</span>
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-3 flex-grow">
        <h3 className="font-bold truncate" title={movie.title || movie.name}>
          {movie.title || movie.name}
        </h3>
      </div>
    </div>
  );
}