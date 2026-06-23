import { apiClient } from "@/lib/api/client";
import type { ApiResponse, ExtensionSession } from "@/lib/types/api";

type ExtensionCollection = ExtensionSession[] | { data: ExtensionSession[] };
export type ExtensionPayload = Omit<ExtensionSession, "id" | "created_by" | "created_at">;

function normalizeExtensionResponse(response: ApiResponse<ExtensionCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getExtensionSessions(params?: {
  search?: string;
  status?: string;
  location?: string;
  per_page?: number;
}) {
  const { data } = await apiClient.get<ApiResponse<ExtensionCollection>>("/extension-sessions", { params });
  return normalizeExtensionResponse(data);
}

export async function createExtensionSession(payload: ExtensionPayload) {
  const { data } = await apiClient.post<ApiResponse<ExtensionSession>>("/extension-sessions", payload);
  return data;
}

export async function updateExtensionSession(id: number, payload: ExtensionPayload) {
  const { data } = await apiClient.put<ApiResponse<ExtensionSession>>(`/extension-sessions/${id}`, payload);
  return data;
}

export async function deleteExtensionSession(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/extension-sessions/${id}`);
  return data;
}
