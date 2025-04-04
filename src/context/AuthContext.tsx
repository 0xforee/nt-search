import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials } from '../types';
import { apiRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface LoginResponse {
  code: number;
  success: boolean;
  data: {
    token: string;
    apikey: string;
    userinfo: {
      userid: number;
      username: string;
      userpris: string[];
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored authentication token
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // TODO: Validate token with backend
          // For now, we'll just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          // setUser(userData);
        }
      } catch (err) {
        setError('Failed to restore authentication state');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use apiRequest instead of direct fetch
      const data: LoginResponse = await apiRequest('/user/login', {
        method: 'POST',
        body: credentials,
        urlEncoded: true
      });
      
      if (!data.success) {
        throw new Error('Login failed');
      }

      // Store the token
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('apikey', data.data.apikey);

      // Set user data
      const userData: User = {
        id: data.data.userinfo.userid.toString(),
        username: data.data.userinfo.username,
        email: `${data.data.userinfo.username}@example.com`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        permissions: data.data.userinfo.userpris,
      };

      setUser(userData);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement actual API call
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('apikey');
    } catch (err) {
      setError('Logout failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};