import { apiClient } from "@/lib/api/client";
import type { ApiResponse, FertilizerStock } from "@/lib/types/api";

type FertilizerCollection = FertilizerStock[] | { data: FertilizerStock[] };
export type FertilizerPayload = Omit<FertilizerStock, "id" | "status" | "created_by" | "created_at">;

function normalizeFertilizerResponse(response: ApiResponse<FertilizerCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getFertilizerStocks(params?: {
  search?: string;
  type?: string;
  status?: string;
  per_page?: number;
}) {
  const { data } = await apiClient.get<ApiResponse<FertilizerCollection>>("/fertilizers", { params });
  return normalizeFertilizerResponse(data);
}

export async function createFertilizerStock(payload: FertilizerPayload) {
  const { data } = await apiClient.post<ApiResponse<FertilizerStock>>("/fertilizers", payload);
  return data;
}

export async function updateFertilizerStock(id: number, payload: FertilizerPayload) {
  const { data } = await apiClient.put<ApiResponse<FertilizerStock>>(`/fertilizers/${id}`, payload);
  return data;
}

export async function deleteFertilizerStock(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/fertilizers/${id}`);
  return data;
}
