"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearAuthRedirectFlag } from "@/lib/api/client";
import type { User } from "@/lib/types/api";

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        clearAuthRedirectFlag();
        document.cookie = `sim_token=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
        set({ token, user, isAuthenticated: true });
      },
      clearAuth: () => {
        clearAuthRedirectFlag();
        document.cookie = "sim_token=; path=/; max-age=0";
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "sim-pertanian-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
