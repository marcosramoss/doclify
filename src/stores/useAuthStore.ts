import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(devtools(
  (set) => ({
    user: null,
    isLoading: true,
    isInitialized: false,
    
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ isLoading: loading }),
    setInitialized: (initialized) => set({ isInitialized: initialized }),
    
    signOut: () => set({
      user: null,
      isLoading: false,
      isInitialized: true,
    }),
  }),
  {
    name: 'auth-store',
  }
));