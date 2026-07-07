import { apiClient } from "@/lib/api/client";
import type { ApiResponse, User } from "@/lib/types/api";

export async function getUsers(params?: Record<string, string | number>) {
  const { data } = await apiClient.get<ApiResponse<User[] | { data: User[] }>>("/users", { params });
  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}

export async function updateUser(id: number, payload: Partial<User> & { password?: string; password_confirmation?: string; role?: string }) {
  const { data } = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, payload);
  return data;
}
