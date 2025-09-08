import Image from 'next/image';
import Carousel from './components/Carousel';
import { Movie, MoviesResponse } from './types';

const API_BASE_URL = 'http://localhost:8080/api';

async function fetchData(endpoint: string): Promise<Movie[]> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: MoviesResponse = await res.json();
    return data.results;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return [];
  }
}

export default async function HomePage() {
  const [popularMovies, topRatedShows, trendingItems] = await Promise.all([
    fetchData('/movies/popular'),
    fetchData('/tv/top_rated'),
    fetchData('/trending/all/day'),
  ]);

  const heroItem = trendingItems[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {heroItem && (
        <div className="relative h-96 rounded-lg overflow-hidden mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
          <Image 
            src={`https://image.tmdb.org/t/p/original${heroItem.backdrop_path}`}
            alt={`Backdrop for ${heroItem.title || heroItem.name}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl font-extrabold text-white mb-2">{heroItem.title || heroItem.name}</h1>
            <p className="text-gray-300 max-w-2xl line-clamp-2">{heroItem.overview}</p>
          </div>
        </div>
      )}
      
      <Carousel title="Trending Today" items={trendingItems} />
      <Carousel title="Popular Movies" items={popularMovies} />
      <Carousel title="Top Rated TV Shows" items={topRatedShows} />
    </div>
  );
}