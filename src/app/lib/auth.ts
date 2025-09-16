export interface AuthState {
  isAuthenticated: boolean;
  username?: string;
}

export const AUTH_STORAGE_KEY = 'tnext_auth_state';

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.NEXT_PUBLIC_PATIENT_USERNAME || process.env.TNEXT_PATIENT_USERNAME;
  const validPassword = process.env.NEXT_PUBLIC_PATIENT_PW || process.env.TNEXT_PATIENT_PW;

  return username === validUsername && password === validPassword;
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