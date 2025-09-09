"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${searchTerm.trim()}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="bg-gray-900 fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-black text-cyan-400 hover:text-cyan-300 transition-colors">CineLume</Link>
              <div className="hidden md:flex items-baseline space-x-1">
                <Link href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/movies" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Movies</Link>
                <Link href="/tv" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">TV Shows</Link>
                {user && <Link href="/watchlist" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Watchlist</Link>}
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-800 text-white w-48 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
              </form>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href={`/profile/${user.username}`} className="text-white font-medium text-sm hover:text-cyan-300">Hi, {user.username}</Link>
                  <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Logout</button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-md text-sm font-medium">Login</Link>
                  <Link href="/register" className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium">Register</Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-gray-900 z-40 p-4 border-b border-gray-800"
          >
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch}><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-gray-800 text-white w-full px-4 py-2 rounded-full text-sm"/></form>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">Home</Link>
              <Link href="/movies" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">Movies</Link>
              <Link href="/tv" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">TV Shows</Link>
              {user ? (
                <>
                  <Link href="/watchlist" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">Watchlist</Link>
                  <Link href={`/profile/${user.username}`} onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">Profile</Link>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-red-400 hover:bg-gray-700 block px-3 py-2 rounded-md">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">Login</Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:bg-gray-700 block px-3 py-2 rounded-md">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}