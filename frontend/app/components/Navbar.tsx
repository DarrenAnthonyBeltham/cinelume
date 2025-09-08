"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900/70 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              CineLume
            </Link>
            <div className="hidden md:flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link href="/movies" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Movies</Link>
              <Link href="/tv" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">TV Shows</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-800 text-white w-full px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link href={`/profile/${user.username}`} className="text-white font-medium text-sm hover:text-cyan-300">
                  Hi, {user.username}
                </Link>
                <button 
                  onClick={logout} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}