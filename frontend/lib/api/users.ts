import { apiClient } from "@/lib/api/client";
import type { ApiResponse, User } from "@/lib/types/api";

export async function getUsers(params?: Record<string, string | number>) {
  const { data } = await apiClient.get<ApiResponse<User[] | { data: User[] }>>("/users", { params });
  return {
    ...data,
    data: Array.isArray(data.data) ? data.data : data.data.data,
  };
}
