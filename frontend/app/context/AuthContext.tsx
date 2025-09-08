"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  sub: number; 
  username: string;
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
        const decoded: { sub: number; username: string } = jwtDecode(storedToken);
        setUser({ sub: decoded.sub, username: decoded.username });
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (data: any) => {
    const res = await fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('token', token);
      const decoded: { sub: number; username: string } = jwtDecode(token);
      setUser({ sub: decoded.sub, username: decoded.username }); 
      setToken(token);
      router.push('/');
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (data: any) => {
    const res = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (res.ok) {
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

  const updateUser = (newUserData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...newUserData } : null);
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