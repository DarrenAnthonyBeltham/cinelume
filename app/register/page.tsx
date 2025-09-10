"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }
    try {
      await register({ username, email, password });
    } catch (err) {
      setError('Registration failed. The username or email may already be taken.');
    }
  };

  return (
    <div className="container mx-auto max-w-sm mt-20">
      <h1 className="text-3xl font-bold text-center mb-8 text-cyan-400">Create an Account</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="username">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>
        <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-md transition duration-300">Register</button>
      </form>
       <p className="text-center text-gray-400 mt-4">
        Already have an account? <Link href="/login" className="text-cyan-400 hover:underline">Login here</Link>
      </p>
    </div>
  );
}