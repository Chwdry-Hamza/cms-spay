'use client';

import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'spay_cms_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    // On 401 from auth-required routes, drop token + bounce to login
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const isLoginRequest = err.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        setToken(null);
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
        }
      }
    }
    return Promise.reject(err);
  }
);

/** Pull a friendly error message from an axios error. */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data: any = err.response?.data;
    const baseMessage = data?.error?.message ?? data?.message ?? err.message;

    // Zod validation failures from our backend → show which field broke
    const fieldErrors = data?.error?.details?.fieldErrors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const parts: string[] = [];
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (Array.isArray(messages) && messages.length) {
          parts.push(`${field}: ${(messages as string[]).join(', ')}`);
        }
      }
      if (parts.length) return `${baseMessage} — ${parts.join('; ')}`;
    }

    // Mongoose duplicate-key + other detail payloads
    const details = data?.error?.details;
    if (details && typeof details === 'object' && !Array.isArray(details) && !fieldErrors) {
      const entries = Object.entries(details as Record<string, unknown>);
      if (entries.length) {
        const pretty = entries.map(([k, v]) =>
          `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`
        ).join(', ');
        return `${baseMessage} (${pretty})`;
      }
    }

    return baseMessage;
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}
