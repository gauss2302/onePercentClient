// src/lib/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  accessToken: string | null;
  user: User | null;

  setAuth: (token: string, user: User) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAuth: (token, user) => set({ accessToken: token, user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
