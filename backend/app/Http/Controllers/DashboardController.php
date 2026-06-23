<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'meta' => [
                'generated_at' => now()->toIso8601String(),
                'source' => 'backend',
            ],
            'period' => [
                'label' => 'Jan 2024 - Des 2024',
            ],
            'alerts' => [
                [
                    'type' => 'urgent',
                    'title' => 'Peringatan Mendesak',
                    'message' => 'Terdapat 14 pengajuan subsidi pupuk yang melewati batas waktu validasi 24 jam.',
                    'action_label' => 'Tindak Lanjut',
                ],
                [
                    'type' => 'info',
                    'title' => 'Kelengkapan Data',
                    'message' => '82 profil kelompok tani baru belum melengkapi titik koordinat poligon lahan.',
                    'action_label' => 'Cek Data',
                ],
            ],
            'kpis' => [
                [
                    'id' => 'total_petani',
                    'title' => 'Total Petani',
                    'value' => '12.842',
                    'trend' => '+2.4%',
                    'icon' => 'person',
                    'trend_type' => 'positive',
                ],
                [
                    'id' => 'total_lahan',
                    'title' => 'Total Lahan (ha)',
                    'value' => '45.290,5',
                    'trend' => '+120ha',
                    'icon' => 'landscape',
                    'trend_type' => 'positive',
                ],
                [
                    'id' => 'produksi_bulan_ini',
                    'title' => 'Produksi Bulan Ini',
                    'value' => '8.421',
                    'unit' => 'ton',
                    'trend' => '-0.8%',
                    'icon' => 'agriculture',
                    'trend_type' => 'warning',
                ],
                [
                    'id' => 'menunggu_validasi',
                    'title' => 'Menunggu Validasi',
                    'value' => '142',
                    'trend' => 'Segera',
                    'icon' => 'new_releases',
                    'trend_type' => 'danger',
                ],
            ],
            'production_trend' => [
                'series' => 'Padi (Ton)',
                'data' => [
                    ['month' => 'JAN', 'value' => 420],
                    ['month' => 'FEB', 'value' => 520],
                    ['month' => 'MAR', 'value' => 610],
                    ['month' => 'APR', 'value' => 450],
                    ['month' => 'MEI', 'value' => 740],
                    ['month' => 'JUN', 'value' => 820],
                    ['month' => 'JUL', 'value' => 870],
                    ['month' => 'AGU', 'value' => 780],
                    ['month' => 'SEP', 'value' => 650],
                    ['month' => 'OKT', 'value' => 560],
                    ['month' => 'NOV', 'value' => 470],
                    ['month' => 'DES', 'value' => 420],
                ],
            ],
            'commodities' => [
                [
                    'name' => 'Padi Sawah',
                    'area' => '29.4K ha',
                    'percentage' => 65,
                ],
                [
                    'name' => 'Jagung',
                    'area' => '8.1K ha',
                    'percentage' => 18,
                ],
                [
                    'name' => 'Kedelai',
                    'area' => '5.4K ha',
                    'percentage' => 12,
                ],
                [
                    'name' => 'Lainnya',
                    'area' => '2.3K ha',
                    'percentage' => 5,
                ],
            ],
            'activities' => [
                [
                    'initials' => 'AM',
                    'name' => 'Ahmad Munir',
                    'group' => 'Poktan Suka Maju',
                    'activity_type' => 'Pengajuan Subsidi Benih',
                    'date' => '24 Okt 2024, 14:20',
                    'status' => 'Menunggu',
                ],
                [
                    'initials' => 'SK',
                    'name' => 'Siti Khotimah',
                    'group' => 'Poktan Tani Makmur',
                    'activity_type' => 'Update Laporan Panen',
                    'date' => '24 Okt 2024, 11:05',
                    'status' => 'Aktif',
                ],
                [
                    'initials' => 'BP',
                    'name' => 'Bambang Pamungkas',
                    'group' => 'Mandiri',
                    'activity_type' => 'Pendaftaran Petani Baru',
                    'date' => '24 Okt 2024, 09:30',
                    'status' => 'Aktif',
                ],
                [
                    'initials' => 'DY',
                    'name' => 'Dedi Yulianto',
                    'group' => 'Poktan Subur',
                    'activity_type' => 'Klaim Asuransi Tani',
                    'date' => '23 Okt 2024, 16:45',
                    'status' => 'Ditolak',
                ],
                [
                    'initials' => 'RW',
                    'name' => 'Rina Wati',
                    'group' => 'Poktan Makmur',
                    'activity_type' => 'Revisi Luas Lahan',
                    'date' => '23 Okt 2024, 15:12',
                    'status' => 'Selesai',
                ],
            ],
            'admin' => [
                'name' => 'Budi Setiawan',
                'role' => 'Super Admin',
            ],
        ]);
    }
}
