import { apiClient } from "@/lib/api/client";
import type { ApiResponse, DashboardPayload } from "@/lib/types/api";

export async function getDashboard(year?: number) {
  const { data } = await apiClient.get<ApiResponse<DashboardPayload>>("/dashboard", {
    params: year ? { year } : {},
  });
  return data;
}
