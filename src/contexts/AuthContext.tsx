'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {User} from '@/types';
import { createClient } from '@/lib/supabase';
import { transformSupabaseUser } from '@/utils/userUtils';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthChange = useCallback((sessionUser: typeof user | null) => {
    if (sessionUser) {
      setUser(sessionUser);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session }, error  }: { data: { session: Session | null }, error: Error | null }) => {
      if (error) {
        console.error('Session error:', error);
        // Handle refresh token errors specifically
        if (error.message.includes('Refresh Token')) {
          console.log('Refresh token invalid, clearing session');
          supabase.auth.signOut();
        }
        setError(error.message);
        handleAuthChange(null);
      } else if (session?.user) {
        handleAuthChange(transformSupabaseUser(session.user));
        setError(null);
      } else {
        handleAuthChange(null);
        setError(null);
      }
      setLoading(false);
    }).catch((err: Error) => {
      console.error('Failed to get session:', err);
      setError('Failed to load session');
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }

      if (session?.user) {
        handleAuthChange(transformSupabaseUser(session.user));
      } else {
        handleAuthChange(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleAuthChange]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      if (data.user) {
        setUser(transformSupabaseUser(data.user));
        return true;
      }
      return false;
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setError(error.message);
        return false;
      }

      if (data.user) {
        setUser(transformSupabaseUser(data.user));
        return true;
      }
      return false;
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      loading,
      error
    }}>
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
