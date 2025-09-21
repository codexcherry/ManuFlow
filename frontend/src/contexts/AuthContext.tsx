import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { setAuthState, isProbablyAuthenticated, clearAuthState } from '../utils/authHelper';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{success: boolean; errorMessage?: string}>;
  register: (username: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only make the API call if we think the user might be authenticated
        // This prevents unnecessary API calls and 401 errors
        if (isProbablyAuthenticated()) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setAuthState(true);
        } else {
          setUser(null);
        }
      } catch (error) {
        // User is not authenticated
        setUser(null);
        setAuthState(false);
      } finally {
        setLoading(false);
      }
    };

    // Check if we're on a login page to avoid unnecessary API calls
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
    if (isAuthPage) {
      setLoading(false);
    } else {
      checkAuth();
    }
  }, []);

  const login = async (username: string, password: string): Promise<{success: boolean; errorMessage?: string}> => {
    try {
      setLoading(true);
      const response = await authAPI.login(username, password);
      setUser(response.user);
      setAuthState(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid Login ID or Password';
      toast.error(errorMessage);
      return { success: false, errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, role: string = 'operator'): Promise<boolean> => {
    try {
      setLoading(true);
      await authAPI.register(username, email, password, role);
      toast.success('Registration successful! Please login with your credentials.');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
      setUser(null);
      clearAuthState();
      toast.success('Logged out successfully!');
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      clearAuthState();
      toast.success('Logged out successfully!');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
