import { apiClient } from "@/lib/api/client";
import { clearPublicApiCache } from "@/lib/api/public";
import type { ApiResponse, EmployeeRecord } from "@/lib/types/api";

type EmployeeCollection = EmployeeRecord[] | { data: EmployeeRecord[] };
export type EmployeePayload = FormData;

function normalizeEmployeeResponse(response: ApiResponse<EmployeeCollection>) {
  return {
    ...response,
    data: Array.isArray(response.data) ? response.data : response.data.data,
  };
}

export async function getEmployees(params?: { search?: string; category?: string; status?: string; per_page?: number }) {
  const { data } = await apiClient.get<ApiResponse<EmployeeCollection>>("/employees", { params });
  return normalizeEmployeeResponse(data);
}

export async function createEmployee(payload: EmployeePayload) {
  const { data } = await apiClient.post<ApiResponse<EmployeeRecord>>("/employees", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function updateEmployee(id: number, payload: EmployeePayload) {
  payload.append("_method", "PUT");

  const { data } = await apiClient.post<ApiResponse<EmployeeRecord>>(`/employees/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}

export async function deleteEmployee(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/employees/${id}`);
  clearPublicApiCache();
  return data;
}
