import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../api/types';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('leaveflow_token');
    localStorage.removeItem('leaveflow_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem('leaveflow_user', JSON.stringify(profile));
    } catch (error: any) {
      console.error('Failed to fetch profile', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('leaveflow_token');
      const storedUser = localStorage.getItem('leaveflow_user');

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Fetch fresh profile in the background to ensure details are accurate
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
          localStorage.setItem('leaveflow_user', JSON.stringify(profile));
        } catch (error) {
          console.error('Session validation failed', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('leaveflow_token', response.token);
      localStorage.setItem('leaveflow_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
