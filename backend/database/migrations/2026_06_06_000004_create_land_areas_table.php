<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('land_areas', function (Blueprint $table) {
            $table->id();
            $table->string('region');
            $table->string('land_type');
            $table->decimal('area_size', 12, 2)->default(0);
            $table->string('unit', 20)->default('Ha');
            $table->string('status')->default('Aktif');
            $table->string('main_crop')->nullable();
            $table->string('owner_group')->nullable();
            $table->date('last_surveyed_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::table('land_areas')->insert([
            [
                'region' => 'Kec. Bontomarannu',
                'land_type' => 'Sawah',
                'area_size' => 420,
                'unit' => 'Ha',
                'status' => 'Aktif',
                'main_crop' => 'Padi',
                'owner_group' => 'Poktan Maju Jaya',
                'last_surveyed_at' => '2026-05-24',
                'notes' => 'Irigasi aktif dan siap tanam.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'region' => 'Kec. Pattallassang',
                'land_type' => 'Hortikultura',
                'area_size' => 280,
                'unit' => 'Ha',
                'status' => 'Aktif',
                'main_crop' => 'Cabai dan Sayuran',
                'owner_group' => 'Kelompok Sejahtera',
                'last_surveyed_at' => '2026-05-22',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'region' => 'Kec. Somba Opu',
                'land_type' => 'Perkebunan',
                'area_size' => 145,
                'unit' => 'Ha',
                'status' => 'Monitoring',
                'main_crop' => 'Kakao',
                'owner_group' => 'Mitra Tani Mandiri',
                'last_surveyed_at' => '2026-05-19',
                'notes' => 'Perlu verifikasi ulang batas lahan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'region' => 'Kec. Bajeng',
                'land_type' => 'Sawah',
                'area_size' => 760,
                'unit' => 'Ha',
                'status' => 'Aktif',
                'main_crop' => 'Padi',
                'owner_group' => 'Tunas Harapan',
                'last_surveyed_at' => '2026-05-26',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'region' => 'Kec. Barombong',
                'land_type' => 'Sawah',
                'area_size' => 1000,
                'unit' => 'Ha',
                'status' => 'Aktif',
                'main_crop' => 'Padi',
                'owner_group' => 'Bina Tani Jaya',
                'last_surveyed_at' => '2026-05-27',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'region' => 'Kec. Pallangga',
                'land_type' => 'Hortikultura',
                'area_size' => 710,
                'unit' => 'Ha',
                'status' => 'Aktif',
                'main_crop' => 'Bawang dan Tomat',
                'owner_group' => 'Mandiri Pangan',
                'last_surveyed_at' => '2026-05-25',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'region' => 'Kec. Tinggimoncong',
                'land_type' => 'Perkebunan',
                'area_size' => 305,
                'unit' => 'Ha',
                'status' => 'Aktif',
                'main_crop' => 'Kopi',
                'owner_group' => 'Kelompok Perkebunan Hijau',
                'last_surveyed_at' => '2026-05-21',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('land_areas');
    }
};
