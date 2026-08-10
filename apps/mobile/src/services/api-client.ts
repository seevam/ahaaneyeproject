import Constants from 'expo-constants';
import { getAuthToken } from '@/stores/auth-store';

/**
 * Resolve the API base URL, in priority order:
 * 1. EXPO_PUBLIC_API_URL env var (apps/mobile/.env) — explicit override
 * 2. The Metro host's LAN IP (Expo Go on a physical phone: the API runs on
 *    the same machine as Metro, so reuse its IP with the API port)
 * 3. extra.apiUrl from app.json (localhost — works on simulators)
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.42:8081"
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:3000`;
  }

  return (Constants.expoConfig?.extra?.apiUrl as string) || 'http://localhost:3000';
}

const API_URL = resolveApiUrl();

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const url = `${API_URL}/api/v1${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}
