'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api, getToken, setToken } from './api';

export type AuthUser = { id: string; email: string; name: string; role: string };

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [ready, setReady] = React.useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  // hydrate from token
  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api.get('/api/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const login: AuthState['login'] = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout: AuthState['logout'] = async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
    qc.clear();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Throws "not logged in" via redirect on first render if no user. */
export function useRequireAuth() {
  const { user, ready } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (ready && !user) router.push('/login');
  }, [ready, user, router]);
  return { user, ready };
}
