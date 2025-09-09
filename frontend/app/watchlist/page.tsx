"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import WatchlistCard from "@/app/components/WatchlistCard";

const statusCategories = ["Watching", "Completed", "Plan to Watch", "On-Hold", "Dropped"];

export default function WatchlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get('/watchlist');
      setWatchlist(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchWatchlist();
    }
  }, [user, router]);

  const getItemsByStatus = (status: string) => {
    return watchlist.filter(item => item.status === status);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Watchlist...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-2">My Watchlist</h1>
      </div>
      
      {watchlist.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty. Add some movies and TV shows!</p>
      ) : (
        <div className="space-y-12">
          {statusCategories.map(status => {
            const items = getItemsByStatus(status);
            if (items.length === 0) return null;
            
            return (
              <section key={status}>
                <h2 className="text-3xl font-bold mb-6 border-l-4 border-cyan-400 pl-4">{status}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {items.map(item => (
                    <WatchlistCard key={item.id} item={item} onListUpdate={fetchWatchlist} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}