"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Carousel from '@/app/components/Carousel';

interface MovieList {
  title: string;
  items: any[];
}

export default function MoviesPage() {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [popularRes, topRatedRes, upcomingRes] = await Promise.all([
          api.get('/movies/popular'),
          api.get('/movies/top_rated'),
          api.get('/movies/upcoming'),
        ]);

        const initialLists: MovieList[] = [
          { title: 'Popular Movies', items: popularRes.data.results },
          { title: 'Top Rated Movies', items: topRatedRes.data.results },
          { title: 'Upcoming Movies', items: upcomingRes.data.results },
        ];
        
        setLists(initialLists);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Movies...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-2">Movies</h1>
        <p className="text-gray-400">Explore a world of cinema. Discover popular, top-rated, and upcoming films.</p>
      </div>

      <div className="space-y-12">
        {lists.map(list => (
          <Carousel key={list.title} title={list.title} items={list.items} />
        ))}
      </div>
    </main>
  );
}