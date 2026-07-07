import { apiClient } from "@/lib/api/client";
import type { AgendaEvent, ApiResponse, DepartmentProfile, EmployeeRecord, GalleryAlbum, News, NewsComment, OfficialGreeting } from "@/lib/types/api";

type PublicStats = {
  total_mitra: number;
  total_panen: number;
  monthly: Array<{ month: number; total: number }>;
};

const PUBLIC_API_CACHE_PREFIX = "sim_pertanian_public_api:v2:";
const PUBLIC_API_CACHE_TTL_MS = 5 * 60 * 1000;

type PublicCacheEntry<T> = {
  expiresAt: number;
  value: T;
};

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function publicCacheKey(endpoint: string, params?: Record<string, unknown>) {
  const query = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  return `${PUBLIC_API_CACHE_PREFIX}${endpoint}${query ? `?${query}` : ""}`;
}

function readPublicCache<T>(key: string) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const cached = storage.getItem(key);
    return cached ? (JSON.parse(cached) as PublicCacheEntry<T>) : null;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function writePublicCache<T>(key: string, value: T) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (isEmptyPublicCollection(value)) {
    return;
  }

  try {
    storage.setItem(
      key,
      JSON.stringify({
        expiresAt: Date.now() + PUBLIC_API_CACHE_TTL_MS,
        value,
      }),
    );
  } catch {
    clearPublicApiCache();
  }
}

function isEmptyPublicCollection(value: unknown) {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return false;
  }

  const data = (value as { data?: unknown }).data;

  if (Array.isArray(data)) {
    return data.length === 0;
  }

  if (data && typeof data === "object" && "data" in data) {
    const nestedData = (data as { data?: unknown }).data;
    return Array.isArray(nestedData) && nestedData.length === 0;
  }

  return false;
}

async function cachedPublicGet<T>(key: string, request: () => Promise<T>) {
  const cached = readPublicCache<T>(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const value = await request();
    writePublicCache(key, value);
    return value;
  } catch (error) {
    if (cached) {
      return cached.value;
    }

    throw error;
  }
}

export function clearPublicApiCache() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  Object.keys(storage)
    .filter((key) => key.startsWith(PUBLIC_API_CACHE_PREFIX))
    .forEach((key) => storage.removeItem(key));
}

export async function getPublicStats() {
  return cachedPublicGet(publicCacheKey("/public/stats"), async () => {
    const { data } = await apiClient.get<ApiResponse<PublicStats>>("/public/stats");
    return data;
  });
}

export async function getPublicGreeting() {
  return cachedPublicGet(publicCacheKey("/public/greeting"), async () => {
    const { data } = await apiClient.get<ApiResponse<OfficialGreeting | null>>("/public/greeting");
    return data;
  });
}

export async function getPublicDepartmentProfile() {
  return cachedPublicGet(publicCacheKey("/public/profile"), async () => {
    const { data } = await apiClient.get<ApiResponse<DepartmentProfile | null>>("/public/profile");
    return data;
  });
}

export async function getPublicEmployees(params?: { search?: string; per_page?: number }) {
  const data = await cachedPublicGet(publicCacheKey("/public/employees", params), async () => {
    const response = await apiClient.get<ApiResponse<EmployeeRecord[] | { data: EmployeeRecord[] }>>("/public/employees", { params });
    return response.data;
  });

  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function getPublicGalleryItems(params?: { search?: string; category?: string; per_page?: number }) {
  const data = await cachedPublicGet(publicCacheKey("/public/gallery", params), async () => {
    const response = await apiClient.get<ApiResponse<GalleryAlbum[] | { data: GalleryAlbum[] }>>("/public/gallery", { params });
    return response.data;
  });

  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function getPublicAgenda(params?: { status?: string; category?: string; per_page?: number }) {
  const data = await cachedPublicGet(publicCacheKey("/public/agenda", params), async () => {
    const response = await apiClient.get<ApiResponse<AgendaEvent[] | { data: AgendaEvent[] }>>("/public/agenda", { params });
    return response.data;
  });

  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function getPublicAgendaDetail(slug: string) {
  return cachedPublicGet(publicCacheKey(`/public/agenda/${slug}`), async () => {
    const { data } = await apiClient.get<ApiResponse<AgendaEvent>>(`/public/agenda/${slug}`);
    return data;
  });
}

type PublicNewsParams = {
  search?: string;
  per_page?: number;
  page?: number;
};

type PublicRequestOptions = {
  cache?: boolean;
};

export async function getPublicNews(paramsOrSearch: string | PublicNewsParams = "", options: PublicRequestOptions = {}) {
  const params = typeof paramsOrSearch === "string" ? (paramsOrSearch ? { search: paramsOrSearch } : {}) : paramsOrSearch;
  const request = async () => {
    const response = await apiClient.get<ApiResponse<News[] | { data: News[] }>>("/public/news", {
      params,
    });
    return response.data;
  };
  const data = options.cache === false ? await request() : await cachedPublicGet(publicCacheKey("/public/news", params), request);

  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function getPublicNewsDetail(slug: string) {
  return cachedPublicGet(publicCacheKey(`/public/news/${slug}`), async () => {
    const { data } = await apiClient.get<ApiResponse<News>>(`/public/news/${slug}`);
    return data;
  });
}

export async function recordPublicNewsView(slug: string) {
  const { data } = await apiClient.post<ApiResponse<{ counted: boolean; views_count: number }>>(`/public/news/${slug}/view`);
  return data;
}

export async function createPublicNewsComment(slug: string, payload: { name: string; email?: string; content: string }) {
  const { data } = await apiClient.post<ApiResponse<NewsComment>>(`/public/news/${slug}/comments`, payload);
  return data;
}
