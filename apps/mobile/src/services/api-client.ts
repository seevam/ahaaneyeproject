import Constants from 'expo-constants';
import { getAuthToken } from '@/stores/auth-store';

const API_URL = (Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000') as string;

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
