export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  roles?: string[];
};

export type PartnerFarmer = {
  id: number;
  name: string;
  address: string;
  phone: string;
  region: string;
  plant_type: string;
  photo_url?: string | null;
  created_by?: string;
  total_harvest?: number;
};

export type Harvest = {
  id: number;
  partner_farmer: {
    id: number;
    name: string;
    region: string;
  };
  crop_type: string;
  harvest_amount: number;
  harvested_at: string;
  location: string;
  notes?: string | null;
  photo_url?: string | null;
  created_by?: string;
};

export type News = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt?: string | null;
  content: string;
  image_url?: string | null;
  is_published: boolean;
  views_count?: number;
  published_at?: string | null;
  author?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  comments?: NewsComment[];
  comments_count?: number;
};

export type NewsComment = {
  id: number;
  name: string;
  email?: string | null;
  content: string;
  is_approved: boolean;
  created_at?: string | null;
};

export type OfficialGreeting = {
  id: number;
  name: string;
  position: string;
  institution: string;
  photo_url?: string | null;
  detail_url: string;
  paragraphs: string[];
  is_active: boolean;
  updated_at?: string | null;
};

export type DepartmentProfile = {
  id: number;
  overview: string;
  vision: string;
  missions: string[];
  main_duty?: string | null;
  functions?: string[];
  hero_image_url?: string | null;
  hero_image_urls?: Array<string | null>;
  active_hero_image_index?: number | null;
  is_active: boolean;
  updated_at?: string | null;
};

export type GalleryItem = {
  id: number;
  album_id?: number | null;
  title: string;
  description?: string | null;
  category: string;
  image_url?: string | null;
  taken_at?: string | null;
  uploaded_by?: string | null;
  created_at?: string | null;
};

export type GalleryAlbum = {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  cover_url?: string | null;
  photos_count: number;
  photos: GalleryItem[];
  taken_at?: string | null;
  uploaded_by?: string | null;
  created_at?: string | null;
};

export type AgendaEvent = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  location: string;
  starts_at: string;
  ends_at?: string | null;
  category: string;
  image_url?: string | null;
  status: "Terjadwal" | "Berlangsung" | "Selesai" | "Dibatalkan";
  created_by?: string | null;
  created_at?: string | null;
};

export type FertilizerStock = {
  id: number;
  warehouse: string;
  fertilizer_type: string;
  stock_amount: number;
  unit: string;
  minimum_stock: number;
  status: "Aman" | "Menipis" | "Kosong";
  supplier?: string | null;
  last_restocked_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type LivestockRecord = {
  id: number;
  partner_name: string;
  livestock_type: string;
  quantity: number;
  region: string;
  health_status: "Sehat" | "Perlu Dicek" | "Sakit";
  owner_phone?: string | null;
  last_checked_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type LandArea = {
  id: number;
  region: string;
  land_type: string;
  area_size: number;
  unit: string;
  status: "Aktif" | "Monitoring" | "Tidak Aktif";
  main_crop?: string | null;
  owner_group?: string | null;
  last_surveyed_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type EmployeeRecord = {
  id: number;
  structure_key?: string | null;
  name: string;
  position: string;
  unit: string;
  category: "Pimpinan" | "Petugas Lapangan" | "Penyuluh" | "Staf Administrasi";
  status: "Aktif" | "Cuti" | "Nonaktif";
  phone?: string | null;
  email?: string | null;
  photo_url?: string | null;
  joined_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export type SystemNotification = {
  id: number;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  meta?: {
    href?: string;
    category?: string;
    [key: string]: unknown;
  } | null;
  read_at?: string | null;
  created_at?: string | null;
};

export type DashboardPayload = {
  totals: {
    total_mitra: number;
    total_hasil_panen: number;
    hasil_panen_bulan_ini: number;
    total_luas_lahan_aktif?: number;
    total_ternak?: number;
    total_stok_pupuk?: number;
    total_laporan?: number;
  };
  statistics: {
    monthly: Array<{ month: number; total: number }>;
    crop_distribution: Array<{ crop_type: string; total: number }>;
    region_heatmap: Array<{ region: string; total: number }>;
  };
  latest_activities: Array<{
    id: number;
    user: string;
    action: string;
    description: string;
    created_at: string;
  }>;
};
