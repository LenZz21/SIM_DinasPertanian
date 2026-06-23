import { apiClient } from "@/lib/api/client";
import type { ApiResponse, News, NewsComment } from "@/lib/types/api";

type PublicStats = {
  total_mitra: number;
  total_panen: number;
  monthly: Array<{ month: number; total: number }>;
};

export async function getPublicStats() {
  const { data } = await apiClient.get<ApiResponse<PublicStats>>("/public/stats");
  return data;
}

export async function getPublicNews(search = "") {
  const { data } = await apiClient.get<ApiResponse<News[] | { data: News[] }>>("/public/news", {
    params: search ? { search } : {},
  });
  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function getPublicNewsDetail(slug: string) {
  const { data } = await apiClient.get<ApiResponse<News>>(`/public/news/${slug}`);
  return data;
}

export async function createPublicNewsComment(slug: string, payload: { name: string; email?: string; content: string }) {
  const { data } = await apiClient.post<ApiResponse<NewsComment>>(`/public/news/${slug}/comments`, payload);
  return data;
}
