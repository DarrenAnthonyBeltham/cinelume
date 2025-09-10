import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '../types';
import { motion } from 'framer-motion';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MovieCard({ movie }: { movie: Movie }) {
  const mediaType = movie.title ? 'movie' : 'tv';
  
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/${mediaType}/${movie.id}`} className="block h-full">
        <motion.div 
          whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.4)" }}
          transition={{ duration: 0.2 }}
          className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col group cursor-pointer"
        >
          <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
            {movie.poster_path ? (
              <Image
                src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                alt={`Poster for ${movie.title || movie.name}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700"></div>
            )}
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
        </motion.div>
      </Link>
    </motion.div>
  );
}