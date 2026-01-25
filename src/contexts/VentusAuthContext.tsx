import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, VentusUserProfile } from '@/lib/ventusApi';

interface AuthState {
  user: VentusUserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ user: VentusUserProfile; session: string }>;
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ user: VentusUserProfile; session: string }>;
  logout: () => Promise<void>;
  setUser: (user: VentusUserProfile | null) => void;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const VentusAuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage immediately to avoid flash
  const [state, setState] = useState<AuthState>(() => {
    const cachedUser = localStorage.getItem('ventus_user');
    const token = localStorage.getItem('ventus_token');
    if (cachedUser && token) {
      try {
        const user = JSON.parse(cachedUser);
        return { user, isLoading: true, isAuthenticated: true };
      } catch {
        // Invalid cached data
      }
    }
    return { user: null, isLoading: true, isAuthenticated: false };
  });

  const checkSession = async (): Promise<boolean> => {
    const token = localStorage.getItem('ventus_token');
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return false;
    }

    try {
      const data = await authApi.getSession();
      setState({ user: data.user, isLoading: false, isAuthenticated: true });
      // Update cache with fresh data
      localStorage.setItem('ventus_user', JSON.stringify(data.user));
      return true;
    } catch {
      localStorage.removeItem('ventus_token');
      localStorage.removeItem('ventus_user');
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return false;
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('ventus_token', data.session);
    localStorage.setItem('ventus_user', JSON.stringify(data.user));
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
    return data;
  };

  const signup = async (signupData: { email: string; password: string; firstName: string; lastName: string }) => {
    const data = await authApi.signup(signupData);
    localStorage.setItem('ventus_token', data.session);
    localStorage.setItem('ventus_user', JSON.stringify(data.user));
    setState({ user: data.user, isLoading: false, isAuthenticated: true });
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('ventus_token');
    localStorage.removeItem('ventus_user');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const setUser = (user: VentusUserProfile | null) => {
    setState(prev => ({ ...prev, user }));
    if (user) {
      localStorage.setItem('ventus_user', JSON.stringify(user));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, setUser, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useVentusAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useVentusAuth must be used within VentusAuthProvider');
  }
  return context;
};
