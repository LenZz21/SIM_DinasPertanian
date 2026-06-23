import { apiClient } from "@/lib/api/client";
import type { ApiResponse, Harvest } from "@/lib/types/api";

export async function getHarvests(params?: Record<string, string | number>) {
  const { data } = await apiClient.get<ApiResponse<Harvest[] | { data: Harvest[] }>>("/hasil", { params });
  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function createHarvest(payload: FormData) {
  const { data } = await apiClient.post<ApiResponse<Harvest>>("/hasil", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateHarvest(id: number, payload: FormData) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<Harvest>>(`/hasil/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteHarvest(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/hasil/${id}`);
  return data;
}

export async function getHarvestStats(year?: number) {
  const { data } = await apiClient.get<ApiResponse<unknown>>("/harvests/statistics", {
    params: year ? { year } : {},
  });
  return data;
}
