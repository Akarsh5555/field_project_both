import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, LoginCredentials, SignUpData } from '../types/auth';
import { api } from '../api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check active Supabase backend session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const currentUser = await api.auth.getCurrentUser();
          const userObj: User = currentUser || {
            id: data.session.user.id,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Field User',
            email: data.session.user.email || '',
            role: (data.session.user.user_metadata?.role as UserRole) || 'Sales Manager',
            avatar: data.session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            territory: data.session.user.user_metadata?.territory || 'North Delhi',
            region: 'North Zone (Delhi-NCR)',
            department: 'Field Sales Operations',
            permissions: ['all', 'read:all', 'write:orders'],
          };
          setUser(userObj);
          setToken(data.session.access_token);
          localStorage.setItem('fieldassist_user_profile', JSON.stringify(userObj));
          localStorage.setItem('fieldassist_auth_token', data.session.access_token);
          setIsLoading(false);
          return;
        }

        // Check local cached profile for demo accounts
        const cachedProfile = localStorage.getItem('fieldassist_user_profile');
        const cachedToken = localStorage.getItem('fieldassist_auth_token');
        if (cachedProfile && cachedToken) {
          try {
            const parsed = JSON.parse(cachedProfile);
            setUser(parsed);
            setToken(cachedToken);
          } catch {
            // Ignore
          }
        }
      } catch (err: any) {
        console.error('Failed to verify session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    // Reactive listener for Supabase authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('fieldassist_user_profile');
        localStorage.removeItem('fieldassist_auth_token');
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        try {
          const currentUser = await api.auth.getCurrentUser();
          const userObj: User = currentUser || {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Field User',
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as UserRole) || 'Sales Manager',
            avatar: session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            territory: session.user.user_metadata?.territory || 'North Delhi',
            region: 'North Zone (Delhi-NCR)',
            department: 'Field Sales Operations',
            permissions: ['all', 'read:all', 'write:orders'],
          };
          setUser(userObj);
          setToken(session.access_token);
          localStorage.setItem('fieldassist_user_profile', JSON.stringify(userObj));
          localStorage.setItem('fieldassist_auth_token', session.access_token);
        } catch {
          // Ignore
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.auth.login(credentials);
      setUser(response.user);
      setToken(response.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.auth.signUp(data);
      setUser(response.user);
      setToken(response.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'System Admin') return true;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        signUp,
        logout,
        hasRole,
        hasPermission,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
