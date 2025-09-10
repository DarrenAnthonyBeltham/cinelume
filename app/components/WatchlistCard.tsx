"use client";

import api from "@/lib/api";
import MovieCard from "./MovieCard";

export default function WatchlistCard({ item, onListUpdate }: { item: any, onListUpdate: () => void }) {
  const handleRemove = async () => {
    try {
      await api.delete(`/watchlist/${item.mediaId}`);
      onListUpdate();
    } catch (error) {
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newStatus = e.target.value;
      await api.post('/watchlist', {
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        status: newStatus,
      });
      onListUpdate();
    } catch (error) {
    }
  };

  return (
    <div>
      <MovieCard movie={{
        id: item.mediaId,
        poster_path: item.posterPath,
        title: item.title,
        vote_average: item.rating,
        release_date: '',
        overview: '',
        backdrop_path: '',
        name: item.title,
      }} />
      <div className="mt-2 flex items-center space-x-2">
        <select
          value={item.status}
          onChange={handleStatusChange}
          className="w-full bg-gray-700 text-white text-xs p-2 rounded-md focus:outline-none"
        >
          <option value="Plan to Watch">Plan to Watch</option>
          <option value="Watching">Watching</option>
          <option value="Completed">Completed</option>
          <option value="On-Hold">On-Hold</option>
          <option value="Dropped">Dropped</option>
        </select>
        <button
          onClick={handleRemove}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
        </button>
      </div>
    </div>
  );
}