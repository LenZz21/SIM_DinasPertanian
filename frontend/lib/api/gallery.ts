import { apiClient } from "@/lib/api/client";
import { clearPublicApiCache } from "@/lib/api/public";
import type { ApiResponse, GalleryAlbum } from "@/lib/types/api";

type GalleryCollection = GalleryAlbum[] | { data: GalleryAlbum[] };

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
  const { data } = await apiClient.post<ApiResponse<GalleryAlbum>>("/gallery", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function updateGalleryItem(id: number, payload: FormData) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<GalleryAlbum>>(`/gallery/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function deleteGalleryItem(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/gallery/${id}`);
  clearPublicApiCache();
  return data;
}

export async function addGalleryPhotos(id: number, payload: FormData) {
  const { data } = await apiClient.post<ApiResponse<GalleryAlbum>>(`/gallery/${id}/photos`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function deleteGalleryPhoto(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/gallery/photos/${id}`);
  clearPublicApiCache();
  return data;
}
