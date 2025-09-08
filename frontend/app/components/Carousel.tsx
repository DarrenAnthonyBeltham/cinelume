import { Movie } from '../types';
import MovieCard from './MovieCard';

interface CarouselProps {
  title: string;
  items: Movie[];
}

export default function Carousel({ title, items }: CarouselProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-40 sm:w-48 md:w-56">
            <MovieCard movie={item} />
          </div>
        ))}
      </div>
    </div>
  );
}