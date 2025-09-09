"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import MovieHero from '@/app/components/movie/MovieHero';
import CastList from '@/app/components/movie/CastList';
import ReviewsSection from '@/app/components/movie/ReviewsSection';
import Carousel from '@/app/components/Carousel';

export default function TvDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/tv/${id}`);
        setData(response.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">TV Show not found.</div>;
  }
  
  const { details, credits, videos, recommendations, reviews } = data;

  return (
    <div>
      <MovieHero details={details} videos={videos.results} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CastList cast={credits.cast} />
        <ReviewsSection 
            reviews={reviews} 
            mediaId={details.id} 
            mediaType="tv"
            mediaTitle={details.name}
            mediaPosterPath={details.poster_path}
        />
        <Carousel title="Recommendations" items={recommendations.results} />
      </div>
    </div>
  );
}