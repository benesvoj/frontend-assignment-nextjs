'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthUser } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: AuthUser) => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      // Add cookie for middleware
      document.cookie = `user=${JSON.stringify(userWithoutPassword)}; path=/; max-age=86400`;
      return true;
    }
    return false;
  };

  const register = (email: string, password: string, name: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.find((u: AuthUser) => u.email === email)) {
      return false;
    }

    const newUser = { email, password, name };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    // Add cookie for middleware
    document.cookie = `user=${JSON.stringify(userWithoutPassword)}; path=/; max-age=86400`;
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Remove cookie
    document.cookie = 'user=; path=/; max-age=0';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
