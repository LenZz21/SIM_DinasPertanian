import axios from "axios";
import { toast } from "sonner";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
  timeout: 6000,
});

const AUTH_STORAGE_KEY = "sim-pertanian-auth";
const AUTH_REDIRECT_FLAG = "sim-auth-redirecting";
const AUTH_EXPIRED_EVENT = "sim-auth-expired";

type HandledAuthError = {
  __authHandled?: boolean;
};

function getCookieValue(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : undefined;
}

function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = "sim_token=; path=/; max-age=0; samesite=lax";
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

function isAuthEndpoint(url?: string) {
  return Boolean(
    url?.includes("/auth/login") ||
      url?.includes("/auth/forgot-password") ||
      url?.includes("/auth/reset-password") ||
      url?.includes("/auth/logout"),
  );
}

function isPublicEndpoint(url?: string) {
  return Boolean(url?.includes("/public/"));
}

function redirectToLoginOnce(message?: string) {
  if (sessionStorage.getItem(AUTH_REDIRECT_FLAG) === "1") return;

  sessionStorage.setItem(AUTH_REDIRECT_FLAG, "1");
  clearStoredAuth();
  toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const redirect = currentPath.startsWith("/login") ? "/admin" : currentPath;
  window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
}

export function clearAuthRedirectFlag() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_REDIRECT_FLAG);
}

export function isHandledAuthError(error: unknown) {
  return Boolean((error as HandledAuthError)?.__authHandled);
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const persisted = localStorage.getItem(AUTH_STORAGE_KEY);
    let persistedToken: string | undefined;

    try {
      const parsed = persisted ? JSON.parse(persisted) : null;
      persistedToken = parsed?.state?.token as string | undefined;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    const token = persistedToken ?? getCookieValue("sim_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const url = error?.config?.url as string | undefined;

    if (status === 401 && !isAuthEndpoint(url) && !isPublicEndpoint(url)) {
      (error as HandledAuthError).__authHandled = true;
      const message = error?.response?.data?.message as string | undefined;
      redirectToLoginOnce(message);

      return new Promise(() => undefined);
    }

    return Promise.reject(error);
  },
);
