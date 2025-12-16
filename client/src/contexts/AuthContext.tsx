import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { AuthenticatedUser, AuthPayload, UserCreatePayload } from '@shared/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: AuthPayload) => Promise<AuthenticatedUser>;
  register: (userData: UserCreatePayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  const saveAuthData = useCallback((user: AuthenticatedUser, token: string) => {
    localStorage.setItem('jwt_token', token);

    setIsAuthenticated(true);
    setUser(user);
    setToken(token);
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('jwt_token');

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1])); 
        setUser({ id: payload.id, email: payload.email, role: payload.role });
        setIsAuthenticated(true);
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to decode JWT from localStorage:", e);
        clearAuthData();
      }
    }
    setIsLoading(false);
  }, [clearAuthData]);

  const login = useCallback(async (credentials: AuthPayload): Promise<AuthenticatedUser> => {
    setIsLoading(true);
    try {
      const response = await api.post<{ user: AuthenticatedUser; token: string }>('/auth/login', credentials);
      saveAuthData(response.data.user, response.data.token);
      toast.success('Logged in successfully!');
      return response.data.user;
    } catch (error: any) {
      clearAuthData();
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveAuthData, clearAuthData]);

  const register = useCallback(async (userData: UserCreatePayload) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ user: AuthenticatedUser; token: string }>('/auth/register', userData);
      saveAuthData(response.data.user, response.data.token);
      toast.success('Account created successfully!');
    } catch (error: any) {
      clearAuthData();
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveAuthData, clearAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
    toast('You have been logged out.', { icon: '👋' });
  }, [clearAuthData]);

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};