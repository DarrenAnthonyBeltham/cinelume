"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import MovieCard from '@/app/components/MovieCard';
import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    };
    
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/search?query=${query}`);
        const filteredResults = response.data.results.filter(
          (item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
        setResults(filteredResults);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return <div className="text-center py-20">Searching...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8">
        Results for <span className="text-cyan-400">"{query}"</span>
      </h1>
      
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((item) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-400">No results found for your search.</p>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}