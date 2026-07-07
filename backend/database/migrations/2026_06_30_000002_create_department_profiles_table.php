<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('department_profiles', function (Blueprint $table) {
            $table->id();
            $table->text('overview');
            $table->text('vision');
            $table->json('missions');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('department_profiles')->insert([
            'overview' => 'Dinas Pertanian Daerah berperan sebagai penyelenggara urusan pemerintahan bidang pertanian melalui pelayanan data, pendampingan petani, penguatan produksi, serta kolaborasi lintas sektor untuk meningkatkan kesejahteraan masyarakat tani.',
            'vision' => 'Terwujudnya pertanian daerah yang maju, mandiri, modern, berdaya saing, dan berkelanjutan.',
            'missions' => json_encode([
                'Meningkatkan kualitas pelayanan publik dan tata kelola data pertanian yang akurat, terbuka, dan mudah diakses.',
                'Memperkuat kapasitas petani, kelompok tani, dan pelaku usaha pertanian melalui penyuluhan dan pendampingan berkelanjutan.',
                'Mendorong peningkatan produksi, produktivitas, dan nilai tambah komoditas pertanian unggulan daerah.',
                'Mengembangkan inovasi, teknologi, dan kemitraan untuk mendukung ketahanan pangan serta kesejahteraan petani.',
            ]),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('department_profiles');
    }
};
