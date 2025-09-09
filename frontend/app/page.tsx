"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Carousel from './components/Carousel';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Movie } from './types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PageData {
  popular: Movie[];
  topRated: Movie[];
  trending: Movie[];
}

export default function HomePage() {
  const [data, setData] = useState<PageData>({ popular: [], topRated: [], trending: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popularRes, topRatedRes, trendingRes] = await Promise.all([
          api.get('/movies/popular'),
          api.get('/tv/top_rated'),
          api.get('/trending/all/day'),
        ]);
        setData({
          popular: popularRes.data.results,
          topRated: topRatedRes.data.results,
          trending: trendingRes.data.results,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroItem = data.trending[0];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {heroItem && (
        <motion.div variants={itemVariants} className="relative h-[50vh] min-h-[450px]">
          <Image src={`https://image.tmdb.org/t/p/original${heroItem.backdrop_path}`} alt={heroItem.title || heroItem.name || ''} fill className="object-cover" priority/>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-0 pb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white max-w-2xl">{heroItem.title || heroItem.name}</h1>
            <p className="text-gray-300 max-w-2xl mt-4 line-clamp-3">{heroItem.overview}</p>
          </div>
        </motion.div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={itemVariants}>
          <Carousel title="Trending Today" items={data.trending} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Carousel title="Popular Movies" items={data.popular} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Carousel title="Top Rated TV Shows" items={data.topRated} />
        </motion.div>
      </div>
    </motion.main>
  );
}