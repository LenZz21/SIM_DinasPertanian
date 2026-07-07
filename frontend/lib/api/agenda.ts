import { apiClient } from "@/lib/api/client";
import { clearPublicApiCache } from "@/lib/api/public";
import type { AgendaEvent, ApiResponse } from "@/lib/types/api";

type AgendaCollection = AgendaEvent[] | { data: AgendaEvent[] };
export type AgendaPayload = Omit<AgendaEvent, "id" | "image_url" | "created_by" | "created_at">;

function normalizeAgendaResponse(response: ApiResponse<AgendaCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getAgendaEvents(params?: {
  search?: string;
  status?: string;
  category?: string;
  per_page?: number;
}) {
  const { data } = await apiClient.get<ApiResponse<AgendaCollection>>("/agenda-events", { params });
  return normalizeAgendaResponse(data);
}

export async function createAgendaEvent(payload: FormData) {
  const { data } = await apiClient.post<ApiResponse<AgendaEvent>>("/agenda-events", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function updateAgendaEvent(id: number, payload: FormData) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<AgendaEvent>>(`/agenda-events/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function deleteAgendaEvent(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/agenda-events/${id}`);
  clearPublicApiCache();
  return data;
}
