import { apiClient } from "@/lib/api/client";
import type { ApiResponse, LandArea } from "@/lib/types/api";

type LandAreaCollection = LandArea[] | { data: LandArea[] };
export type LandAreaPayload = Omit<LandArea, "id" | "created_by" | "created_at">;

function normalizeLandAreaResponse(response: ApiResponse<LandAreaCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getLandAreas(params?: { search?: string; type?: string; status?: string; per_page?: number }) {
  const { data } = await apiClient.get<ApiResponse<LandAreaCollection>>("/land-areas", { params });
  return normalizeLandAreaResponse(data);
}

export async function createLandArea(payload: LandAreaPayload) {
  const { data } = await apiClient.post<ApiResponse<LandArea>>("/land-areas", payload);
  return data;
}

export async function updateLandArea(id: number, payload: LandAreaPayload) {
  const { data } = await apiClient.put<ApiResponse<LandArea>>(`/land-areas/${id}`, payload);
  return data;
}

export async function deleteLandArea(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/land-areas/${id}`);
  return data;
}
