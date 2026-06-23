import { apiClient } from "@/lib/api/client";
import type { ApiResponse, GalleryItem } from "@/lib/types/api";

type GalleryCollection = GalleryItem[] | { data: GalleryItem[] };

function normalizeGalleryResponse(response: ApiResponse<GalleryCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getGalleryItems(params?: { search?: string; category?: string; per_page?: number }) {
  const { data } = await apiClient.get<ApiResponse<GalleryCollection>>("/gallery", { params });
  return normalizeGalleryResponse(data);
}

export async function createGalleryItem(payload: FormData) {
  const { data } = await apiClient.post<ApiResponse<GalleryItem>>("/gallery", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateGalleryItem(id: number, payload: FormData) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<GalleryItem>>(`/gallery/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteGalleryItem(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/gallery/${id}`);
  return data;
}
