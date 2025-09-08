"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ProfileData {
  username: string;
  email: string;
  description: string;
  profilePictureUrl: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    email: '',
    description: '',
    profilePictureUrl: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile({
          username: response.data.username || '',
          email: response.data.email || '',
          description: response.data.description || '',
          profilePictureUrl: response.data.profilePictureUrl || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, router, logout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/users/profile', profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage('Error updating profile.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
        {message && <p className="bg-green-500/20 text-green-400 p-3 rounded mb-6">{message}</p>}
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="username">Username</label>
          <input type="text" name="username" value={profile.username} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
          <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="description">Description</label>
          <textarea name="description" value={profile.description} onChange={handleChange} rows={4} className="w-full bg-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        </div>

        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-md transition duration-300">Save Changes</button>
      </form>
    </div>
  );
}