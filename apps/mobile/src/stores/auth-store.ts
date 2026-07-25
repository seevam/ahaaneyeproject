import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  phone: string | null;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isGuest: boolean;

  signIn: (token: string, user: User) => void;
  signOut: () => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isGuest: false,

  signIn: (token, user) => set({ token, user, isGuest: false }),
  signOut: () => set({ token: null, user: null, isGuest: false }),
  enterGuestMode: () => set({ isGuest: true }),
  exitGuestMode: () => set({ isGuest: false }),
}));

/** Read the current token outside React (used by apiClient) */
export const getAuthToken = () => useAuthStore.getState().token;
