'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, getAuthState, saveAuthState, clearAuthState, validateCredentials } from '../lib/auth';

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load auth state from localStorage on mount
    const storedAuth = getAuthState();
    setAuthState(storedAuth);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validateCredentials(username, password)) {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        username
      };
      setAuthState(newAuthState);
      saveAuthState(newAuthState);
      return true;
    }
    return false;
  };

  const logout = () => {
    const newAuthState: AuthState = { isAuthenticated: false };
    setAuthState(newAuthState);
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading }}>
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