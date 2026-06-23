<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extension_sessions', function (Blueprint $table) {
            $table->id();
            $table->date('scheduled_at');
            $table->string('topic');
            $table->string('location');
            $table->string('instructor')->nullable();
            $table->unsignedInteger('registered_participants')->default(0);
            $table->unsignedInteger('attended_participants')->default(0);
            $table->unsignedInteger('materials_count')->default(0);
            $table->string('status')->default('Terjadwal');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::table('extension_sessions')->insert([
            [
                'scheduled_at' => '2026-06-03',
                'topic' => 'Irigasi Hemat Air',
                'location' => 'Gowa',
                'instructor' => 'Siti Nurhaliza',
                'registered_participants' => 120,
                'attended_participants' => 108,
                'materials_count' => 8,
                'status' => 'Selesai',
                'notes' => 'Materi fokus pada efisiensi air sawah.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'scheduled_at' => '2026-06-05',
                'topic' => 'Pupuk Organik',
                'location' => 'Maros',
                'instructor' => 'Dian Prasetyo',
                'registered_participants' => 95,
                'attended_participants' => 87,
                'materials_count' => 6,
                'status' => 'Selesai',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'scheduled_at' => '2026-06-08',
                'topic' => 'Teknologi Panen',
                'location' => 'Takalar',
                'instructor' => 'Rahmat Hidayat',
                'registered_participants' => 140,
                'attended_participants' => 0,
                'materials_count' => 5,
                'status' => 'Terjadwal',
                'notes' => 'Menunggu konfirmasi lokasi aula.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'scheduled_at' => '2026-06-12',
                'topic' => 'Pengendalian Hama Terpadu',
                'location' => 'Jeneponto',
                'instructor' => 'Andi Wijaya',
                'registered_participants' => 180,
                'attended_participants' => 0,
                'materials_count' => 9,
                'status' => 'Terjadwal',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'scheduled_at' => '2026-06-17',
                'topic' => 'Smart Farming Desa',
                'location' => 'Gowa',
                'instructor' => 'Nur Aisyah',
                'registered_participants' => 210,
                'attended_participants' => 0,
                'materials_count' => 12,
                'status' => 'Terjadwal',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('extension_sessions');
    }
};
