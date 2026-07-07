<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $items = [
            [
                'type' => 'success',
                'title' => 'Data hasil panen padi berhasil ditambahkan',
                'message' => 'Sistem mencatat input hasil panen terbaru dan memperbarui statistik produksi.',
                'meta' => json_encode(['href' => '/admin/hasil', 'category' => 'Sistem']),
            ],
            [
                'type' => 'warning',
                'title' => 'Stok pupuk Urea menipis sisa 150 Kg di Gudang Tahuna',
                'message' => 'Stok pupuk perlu segera ditindaklanjuti agar distribusi tetap aman.',
                'meta' => json_encode(['href' => '/admin/data-pupuk', 'category' => 'Pupuk']),
            ],
            [
                'type' => 'info',
                'title' => 'Agenda baru Teknologi Tanam Padi Modern',
                'message' => 'Agenda baru sudah masuk ke agenda dinas.',
                'meta' => json_encode(['href' => '/admin/agenda', 'category' => 'Agenda']),
            ],
            [
                'type' => 'error',
                'title' => 'Hasil panen menurun -12% dibanding bulan lalu',
                'message' => 'Monitoring produksi mendeteksi penurunan hasil panen dan perlu evaluasi wilayah.',
                'meta' => json_encode(['href' => '/admin/monitoring', 'category' => 'Monitoring']),
            ],
            [
                'type' => 'info',
                'title' => 'Permintaan verifikasi mitra petani baru',
                'message' => 'Data mitra baru perlu diverifikasi oleh admin atau petugas terkait.',
                'meta' => json_encode(['href' => '/admin/mitra', 'category' => 'Mitra']),
            ],
        ];

        foreach ($items as $item) {
            $exists = DB::table('system_notifications')
                ->where('title', $item['title'])
                ->exists();

            if (! $exists) {
                DB::table('system_notifications')->insert([
                    ...$item,
                    'user_id' => null,
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('system_notifications')
            ->whereIn('title', [
                'Data hasil panen padi berhasil ditambahkan',
                'Stok pupuk Urea menipis sisa 150 Kg di Gudang Tahuna',
                'Agenda baru Teknologi Tanam Padi Modern',
                'Hasil panen menurun -12% dibanding bulan lalu',
                'Permintaan verifikasi mitra petani baru',
            ])
            ->delete();
    }
};
