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
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
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
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function parseJwt(token: string): AuthUser | null {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return { id: decoded.sub, email: decoded.email, role: decoded.role, name: decoded.name };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (stored) {
      const parsed = parseJwt(stored);
      if (parsed) { setToken(stored); setUser(parsed); }
      else localStorage.removeItem('access_token');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Login failed'); }
    const { access_token } = await res.json();
    const parsed = parseJwt(access_token);
    if (!parsed) throw new Error('Invalid token');
    localStorage.setItem('access_token', access_token);
    setToken(access_token); setUser(parsed);
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Registration failed'); }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
