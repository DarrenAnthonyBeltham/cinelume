"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="container mx-auto max-w-sm mt-20">
      <h1 className="text-3xl font-bold text-center mb-8 text-cyan-400">Login to CineLume</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>
        <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-md transition duration-300">Log In</button>
      </form>
      <p className="text-center text-gray-400 mt-4">
        Don't have an account? <Link href="/register" className="text-cyan-400 hover:underline">Register here</Link>
      </p>
    </div>
  );
}