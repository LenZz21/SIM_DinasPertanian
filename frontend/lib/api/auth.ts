import { apiClient } from "@/lib/api/client";
import type { ApiResponse, User } from "@/lib/types/api";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
  return data;
}

export async function logout() {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/logout");
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
  return data;
}
