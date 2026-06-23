import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PartnerFarmer } from "@/lib/types/api";

export async function getMitra(params?: Record<string, string | number>) {
  const { data } = await apiClient.get<ApiResponse<PartnerFarmer[] | { data: PartnerFarmer[] }>>("/mitra", { params });
  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function createMitra(payload: FormData) {
  const { data } = await apiClient.post<ApiResponse<PartnerFarmer>>("/mitra", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateMitra(id: number, payload: FormData) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<PartnerFarmer>>(`/mitra/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteMitra(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/mitra/${id}`);
  return data;
}
