import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Omit<User, 'password_hash'> | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { full_name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserContext: (updatedUser: Omit<User, 'password_hash'>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password_hash'> | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('smart_task_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err: any) {
          console.error("Failed to load user with active token", err);
          // Token is likely invalid or expired, clean up
          localStorage.removeItem('smart_task_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    
    loadCurrentUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      const data: AuthResponse = await api.login(credentials);
      localStorage.setItem('smart_task_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { full_name: string; email: string; password: string; role?: string }) => {
    setError(null);
    setLoading(true);
    try {
      const res: AuthResponse = await api.register(data);
      localStorage.setItem('smart_task_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout endpoint error:", err);
    } finally {
      localStorage.removeItem('smart_task_token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const updateUserContext = (updatedUser: Omit<User, 'password_hash'>) => {
    setUser(updatedUser);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUserContext,
        clearError,
      }}
    >
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
