import { apiClient } from "@/lib/api/client";
import type { ApiResponse, SystemNotification } from "@/lib/types/api";

export type NotificationPayload = {
  items: SystemNotification[] | { data: SystemNotification[] };
  unread_count: number;
};

export async function getNotifications(params?: { search?: string; type?: string; status?: string; per_page?: number }) {
  const { data } = await apiClient.get<ApiResponse<NotificationPayload>>("/notifications", { params });
  const items = Array.isArray(data.data.items) ? data.data.items : data.data.items.data;

  return {
    ...data,
    data: {
      ...data.data,
      items,
    },
  };
}

export async function markNotificationAsRead(id: number) {
  const { data } = await apiClient.patch<ApiResponse<SystemNotification>>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await apiClient.patch<ApiResponse<null>>("/notifications/read-all");
  return data;
}

export async function deleteNotification(id: number) {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
  return data;
}
