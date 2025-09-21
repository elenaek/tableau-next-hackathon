export interface AuthState {
  isAuthenticated: boolean;
  username?: string;
}

export const AUTH_STORAGE_KEY = 'tnext_auth_state';

// Server-side authentication via API
export async function validateCredentials(username: string, password: string): Promise<{ success: boolean; user?: { username: string } }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false };
    }

    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false };
  }
}

// Verify session with server
export async function verifySession(): Promise<AuthState> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const data = await response.json();
    return {
      isAuthenticated: data.authenticated,
      username: data.user?.username
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { isAuthenticated: false };
  }
}

// Logout via API
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      clearAuthState();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

export function saveAuthState(authState: AuthState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }
}

export function getAuthState(): AuthState {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false };
      }
    }
  }
  return { isAuthenticated: false };
}

export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}