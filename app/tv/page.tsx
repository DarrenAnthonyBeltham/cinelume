"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Carousel from '@/app/components/Carousel';

interface TvList {
  title: string;
  items: any[];
}

export default function TvShowsPage() {
  const [lists, setLists] = useState<TvList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTvData = async () => {
      try {
        const [popularRes, topRatedRes] = await Promise.all([
          api.get('/tv/popular'), 
          api.get('/tv/top_rated'),
        ]);

        const initialLists: TvList[] = [
          { title: 'Popular TV Shows', items: popularRes.data.results },
          { title: 'Top Rated TV Shows', items: topRatedRes.data.results },
        ];
        
        setLists(initialLists);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTvData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading TV Shows...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-2">TV Shows</h1>
        <p className="text-gray-400">Discover binge-worthy series, from popular hits to critically acclaimed shows.</p>
      </div>

      <div className="space-y-12">
        {lists.map(list => (
          <Carousel key={list.title} title={list.title} items={list.items} />
        ))}
      </div>
    </main>
  );
}