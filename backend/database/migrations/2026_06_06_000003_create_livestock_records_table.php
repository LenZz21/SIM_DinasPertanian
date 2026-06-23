<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livestock_records', function (Blueprint $table) {
            $table->id();
            $table->string('partner_name');
            $table->string('livestock_type');
            $table->unsignedInteger('quantity')->default(0);
            $table->string('region');
            $table->string('health_status')->default('Sehat');
            $table->string('owner_phone')->nullable();
            $table->date('last_checked_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::table('livestock_records')->insert([
            [
                'partner_name' => 'Poktan Maju Jaya',
                'livestock_type' => 'Sapi',
                'quantity' => 52,
                'region' => 'Maros',
                'health_status' => 'Sehat',
                'owner_phone' => '081234567890',
                'last_checked_at' => '2026-05-25',
                'notes' => 'Populasi stabil dan pakan tercukupi.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'partner_name' => 'Kelompok Sejahtera',
                'livestock_type' => 'Kambing',
                'quantity' => 38,
                'region' => 'Gowa',
                'health_status' => 'Perlu Dicek',
                'owner_phone' => '081234567891',
                'last_checked_at' => '2026-05-22',
                'notes' => 'Butuh jadwal pemeriksaan lanjutan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'partner_name' => 'Mitra Tani Mandiri',
                'livestock_type' => 'Unggas',
                'quantity' => 75,
                'region' => 'Takalar',
                'health_status' => 'Sehat',
                'owner_phone' => '081234567892',
                'last_checked_at' => '2026-05-20',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'partner_name' => 'Tunas Harapan',
                'livestock_type' => 'Sapi',
                'quantity' => 220,
                'region' => 'Bone',
                'health_status' => 'Sehat',
                'owner_phone' => '081234567893',
                'last_checked_at' => '2026-05-27',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'partner_name' => 'Bina Tani Jaya',
                'livestock_type' => 'Sapi',
                'quantity' => 368,
                'region' => 'Wajo',
                'health_status' => 'Sehat',
                'owner_phone' => '081234567894',
                'last_checked_at' => '2026-05-28',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'partner_name' => 'Kelompok Ternak Makmur',
                'livestock_type' => 'Kambing',
                'quantity' => 392,
                'region' => 'Enrekang',
                'health_status' => 'Sehat',
                'owner_phone' => '081234567895',
                'last_checked_at' => '2026-05-26',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'partner_name' => 'Mandiri Pangan',
                'livestock_type' => 'Unggas',
                'quantity' => 103,
                'region' => 'Takalar',
                'health_status' => 'Sehat',
                'owner_phone' => '081234567896',
                'last_checked_at' => '2026-05-24',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('livestock_records');
    }
};
