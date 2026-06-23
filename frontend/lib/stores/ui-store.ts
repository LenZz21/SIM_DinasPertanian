"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_ADMIN_NOTIFICATIONS, type AdminNotification } from "@/lib/data/admin-notifications";

type NotificationItem = AdminNotification & { read: boolean };
type ThemeMode = "light" | "dark";

type UIState = {
  theme: ThemeMode;
  notifications: NotificationItem[];
  initialized: boolean;
  initUI: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetNotifications: () => void;
};

const defaultNotifications: NotificationItem[] = DEFAULT_ADMIN_NOTIFICATIONS.map((item) => ({
  ...item,
  read: false,
}));

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      notifications: defaultNotifications,
      initialized: false,
      initUI: () => {
        const { theme, initialized } = get();
        if (!initialized) {
          applyTheme(theme);
          set({ initialized: true });
        } else {
          applyTheme(theme);
        }
      },
      toggleTheme: () => {
        const nextTheme: ThemeMode = get().theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        set({ theme: nextTheme });
      },
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, read: true })),
        })),
      resetNotifications: () => set({ notifications: defaultNotifications }),
    }),
    {
      name: "sim-pertanian-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
      }),
    },
  ),
);
