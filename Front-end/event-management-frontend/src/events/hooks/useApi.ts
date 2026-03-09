import { useCallback } from 'react';
import { useAuth, API_BASE } from '../context/AuthContext';

export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(async (method: string, path: string, body?: unknown) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `Error ${res.status}`); }
    if (res.status === 204) return null;
    return res.json();
  }, [token, logout]);

  return {
    get:   (path: string)                 => request('GET',    path),
    post:  (path: string, body?: unknown) => request('POST',   path, body),
    put:   (path: string, body?: unknown) => request('PUT',    path, body),
    patch: (path: string, body?: unknown) => request('PATCH',  path, body),
    del:   (path: string)                 => request('DELETE', path),
  };
}
