import { apiClient } from "@/lib/api/client";
import type { ApiResponse, LivestockRecord } from "@/lib/types/api";

type LivestockCollection = LivestockRecord[] | { data: LivestockRecord[] };
export type LivestockPayload = Omit<LivestockRecord, "id" | "created_by" | "created_at">;

function normalizeLivestockResponse(response: ApiResponse<LivestockCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getLivestockRecords(params?: {
  search?: string;
  type?: string;
  region?: string;
  health_status?: string;
  per_page?: number;
}) {
  const { data } = await apiClient.get<ApiResponse<LivestockCollection>>("/livestock", { params });
  return normalizeLivestockResponse(data);
}

export async function createLivestockRecord(payload: LivestockPayload) {
  const { data } = await apiClient.post<ApiResponse<LivestockRecord>>("/livestock", payload);
  return data;
}

export async function updateLivestockRecord(id: number, payload: LivestockPayload) {
  const { data } = await apiClient.put<ApiResponse<LivestockRecord>>(`/livestock/${id}`, payload);
  return data;
}

export async function deleteLivestockRecord(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/livestock/${id}`);
  return data;
}
