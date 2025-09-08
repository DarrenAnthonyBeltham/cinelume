"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';

interface WatchlistStat {
  status: string;
  count: number;
}

interface UserStats {
  watchlistStats: WatchlistStat[];
  meanScore: number;
  totalEntries: number;
  reviewsCount: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: loggedInUser, updateUser: updateAuthUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [editableUsername, setEditableUsername] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!username) return;
    if (loggedInUser && loggedInUser.username === username) setIsOwner(true);

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const statsRes = await axios.get(`http://localhost:8080/api/users/${username}/stats`);
        setStats(statsRes.data);

        if (loggedInUser && loggedInUser.username === username) {
          const profileRes = await api.get('/users/profile');
          setProfileUser(profileRes.data);
          setEditableUsername(profileRes.data.username);
          setEditableEmail(profileRes.data.email);
          setEditableDescription(profileRes.data.description || '');
        }
      } catch (err) {
        console.error('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username, loggedInUser]);

  const handleSaveChanges = async () => {
    try {
      const payload = {
        username: editableUsername,
        email: editableEmail,
        description: editableDescription,
        profilePictureUrl: profileUser.profilePictureUrl || ''
      };
      await api.put('/users/profile', payload);
      
      setProfileUser((prev: any) => ({ ...prev, ...payload }));
      if (updateAuthUser && loggedInUser) {
        updateAuthUser({ username: editableUsername, sub: loggedInUser.sub });
      }
      
      setIsEditing(false);
      
      if (username !== editableUsername) {
        router.push(`/profile/${editableUsername}`);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setIsPasswordModalOpen(false), 2000);
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Failed to update password. Check your current password.' });
    }
  };

  const getStatCount = (status: string) => {
    if (!stats || !stats.watchlistStats) return 0;
    return stats.watchlistStats.find(s => s.status === status)?.count || 0;
  };

  if (loading) return <div className="text-center p-10">Loading profile...</div>;

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold break-words">{username}'s Profile</h1>
              <p className="text-sm text-gray-400 mt-2">Joined: {/* Date here */}</p>
              {isOwner && !isEditing && (
                <div className="mt-4 space-y-2">
                  <button onClick={() => setIsEditing(true)} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">Edit Profile</button>
                  <button onClick={() => setIsPasswordModalOpen(true)} className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">Change Password</button>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Username</label>
                  <input type="text" value={editableUsername} onChange={(e) => setEditableUsername(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input type="email" value={editableEmail} onChange={(e) => setEditableEmail(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea value={editableDescription} onChange={(e) => setEditableDescription(e.target.value)} rows={4} className="w-full bg-gray-800 p-3 rounded-md"/>
                </div>
              </form>
            ) : (
              <p className="mb-6 text-gray-300">{editableDescription || 'No description provided.'}</p>
            )}

            <div className="bg-gray-800 p-6 rounded-lg my-8">
              <h2 className="text-xl font-bold mb-4">Watchlist Statistics</h2>
              <div className="flex items-center mb-6">
                <p className="text-4xl font-bold">{stats?.totalEntries}</p>
                <p className="ml-4">Total Entries</p>
                <div className="ml-auto text-right">
                  <p className="text-gray-400">Mean Score</p>
                  <p className="text-2xl font-bold">{stats?.meanScore.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <StatBar label="Watching" value={getStatCount('Watching')} total={stats?.totalEntries || 1} color="bg-green-500" />
                <StatBar label="Completed" value={getStatCount('Completed')} total={stats?.totalEntries || 1} color="bg-blue-500" />
                <StatBar label="On-Hold" value={getStatCount('On-Hold')} total={stats?.totalEntries || 1} color="bg-yellow-500" />
                <StatBar label="Dropped" value={getStatCount('Dropped')} total={stats?.totalEntries || 1} color="bg-red-500" />
                <StatBar label="Plan to Watch" value={getStatCount('Plan to Watch')} total={stats?.totalEntries || 1} color="bg-gray-500" />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center space-x-4">
                <button onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md" required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md" required />
              </div>
              {passwordMessage.text && (
                <p className={`p-3 rounded mb-4 text-sm ${passwordMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const StatBar = ({ label, value, total, color }: { label: string, value: number, total: number, color: string }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center text-sm mb-2">
      <span className="w-28">{label}</span>
      <div className="w-full bg-gray-700 rounded-full h-4 mr-2">
        <div className={color + " h-4 rounded-full"} style={{ width: `${percentage}%` }}></div>
      </div>
      <span>{value}</span>
    </div>
  );
};