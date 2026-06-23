import { apiClient } from "@/lib/api/client";
import type { ApiResponse, News } from "@/lib/types/api";

type NewsCollection = News[] | { data: News[] };

function normalizeNewsResponse(response: ApiResponse<NewsCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getAdminNews(params?: { search?: string; per_page?: number }) {
  const { data } = await apiClient.get<ApiResponse<NewsCollection>>("/news", { params });
  return normalizeNewsResponse(data);
}

export async function createAdminNews(payload: FormData) {
  const { data } = await apiClient.post<ApiResponse<News>>("/news", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateAdminNews(id: number, payload: FormData) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<News>>(`/news/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteAdminNews(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/news/${id}`);
  return data;
}
