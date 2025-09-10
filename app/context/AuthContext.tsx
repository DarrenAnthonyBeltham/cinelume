"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';

interface User {
  sub: number; 
  username: string;
  pfp: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded: { sub: number; username: string; pfp: string } = jwtDecode(storedToken);
        setUser({ sub: decoded.sub, username: decoded.username, pfp: decoded.pfp });
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (data: any) => {
    const response = await api.post('/users/login', data);
    if (response.status === 200) {
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decoded: { sub: number; username: string; pfp: string } = jwtDecode(token);
      setUser({ sub: decoded.sub, username: decoded.username, pfp: decoded.pfp }); 
      setToken(token);
      router.push('/');
    } else {
      throw new Error('Login failed');
    }
  };
  
  const updateUser = (newUserData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...newUserData };
      
      const newStoredToken = localStorage.getItem('token');
      if (newStoredToken) {
          const decoded: { sub: number; username: string; pfp: string } = jwtDecode(newStoredToken);
          updatedUser.pfp = decoded.pfp;
      }
      return updatedUser;
    });
  };

  const register = async (data: any) => {
    const response = await api.post('/users/register', data);
    if (response.status === 201) {
        router.push('/login');
    } else {
        throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}