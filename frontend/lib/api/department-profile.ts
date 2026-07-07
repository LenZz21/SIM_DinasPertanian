import { apiClient } from "@/lib/api/client";
import { clearPublicApiCache } from "@/lib/api/public";
import type { ApiResponse, DepartmentProfile } from "@/lib/types/api";

export type DepartmentProfilePayload = {
  overview: string;
  vision: string;
  missions: string[];
  main_duty: string;
  functions: string[];
  hero_image_1?: File;
  hero_image_2?: File;
  hero_image_3?: File;
  active_hero_image_index?: number;
};

export async function getDepartmentProfile() {
  const { data } = await apiClient.get<ApiResponse<DepartmentProfile>>("/department-profile");
  return data;
}

export async function updateDepartmentProfile(payload: DepartmentProfilePayload) {
  const formData = new FormData();

  formData.append("overview", payload.overview);
  formData.append("vision", payload.vision);
  payload.missions.forEach((mission) => formData.append("missions[]", mission));
  formData.append("main_duty", payload.main_duty);
  payload.functions.forEach((item) => formData.append("functions[]", item));

  if (payload.active_hero_image_index) {
    formData.append("active_hero_image_index", String(payload.active_hero_image_index));
  }

  if (payload.hero_image_1) {
    formData.append("hero_image_1", payload.hero_image_1);
  }

  if (payload.hero_image_2) {
    formData.append("hero_image_2", payload.hero_image_2);
  }

  if (payload.hero_image_3) {
    formData.append("hero_image_3", payload.hero_image_3);
  }

  const { data } = await apiClient.post<ApiResponse<DepartmentProfile>>("/department-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  clearPublicApiCache();
  return data;
}
