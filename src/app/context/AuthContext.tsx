'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, getAuthState, saveAuthState, clearAuthState, validateCredentials, verifySession, logout as apiLogout } from '../lib/auth';
import { LOCAL_STORAGE_KEYS } from '@/lib/utils';

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
    // First check if there's a valid server session
    const checkSession = async () => {
      try {
        const sessionState = await verifySession();
        if (sessionState.isAuthenticated) {
          setAuthState(sessionState);
          saveAuthState(sessionState);
        } else {
          // If no server session, check localStorage for cached state
          const storedAuth = getAuthState();
          if (storedAuth.isAuthenticated) {
            // Clear invalid cached state
            clearAuthState();
            setAuthState({ isAuthenticated: false });
          } else {
            setAuthState(storedAuth);
          }
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        const storedAuth = getAuthState();
        setAuthState(storedAuth);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    window.addEventListener('beforeunload', () => {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.DEMO_BANNER, true.toString());
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_BANNER, true.toString());
    });
    return () => {
      window.removeEventListener('beforeunload', () => {
        window.localStorage.setItem(LOCAL_STORAGE_KEYS.DEMO_BANNER, true.toString());
        window.localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECT_BANNER, true.toString());
      });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Call server-side authentication API
      const result = await validateCredentials(username, password);

      if (result.success) {
        const newAuthState: AuthState = {
          isAuthenticated: true,
          username: result.user?.username || username
        };
        setAuthState(newAuthState);
        saveAuthState(newAuthState);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call server-side logout API
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state regardless of API result
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