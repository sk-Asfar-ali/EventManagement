/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Role = 'user' | 'organizer';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const AuthContext = createContext<AuthContextType | null>(null);
// eslint-disable-next-line react-refresh/only-export-components
export const API_BASE = import.meta.env.VITE_API_URL || "" ;

// All requests include credentials so the httpOnly cookie is sent automatically.
const FETCH_OPTS: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, ask the backend who the cookie belongs to.
  // This replaces the old "parse localStorage token" pattern.
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { ...FETCH_OPTS, method: 'GET' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      ...FETCH_OPTS,
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.message || 'Login failed');
    }
    // Backend sets the httpOnly cookie and returns safe user info in the body
    const userData: AuthUser = await res.json();
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      ...FETCH_OPTS,
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const e = await res.json();
      throw new Error(e.message || 'Registration failed');
    }
  };

  const logout = async () => {
    // Ask the backend to clear the httpOnly cookie (client JS cannot do this)
    await fetch(`${API_BASE}/auth/logout`, { ...FETCH_OPTS, method: 'POST' }).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
