<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_records', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('unit');
            $table->string('category');
            $table->string('status')->default('Aktif');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->date('joined_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::table('employee_records')->insert([
            [
                'name' => 'Rahmat Hidayat',
                'position' => 'Kepala Bidang',
                'unit' => 'Produksi',
                'category' => 'Pimpinan',
                'status' => 'Aktif',
                'phone' => '081234560001',
                'email' => 'rahmat@dinas.test',
                'joined_at' => '2018-02-12',
                'notes' => 'Koordinator program produksi tanaman pangan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Nurhaliza',
                'position' => 'Penyuluh Senior',
                'unit' => 'Penyuluhan',
                'category' => 'Penyuluh',
                'status' => 'Aktif',
                'phone' => '081234560002',
                'email' => 'siti@dinas.test',
                'joined_at' => '2019-05-21',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dian Prasetyo',
                'position' => 'Staf Data',
                'unit' => 'Monitoring',
                'category' => 'Staf Administrasi',
                'status' => 'Aktif',
                'phone' => '081234560003',
                'email' => 'dian@dinas.test',
                'joined_at' => '2020-08-10',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Andi Wijaya',
                'position' => 'Petugas Lapangan',
                'unit' => 'Distribusi',
                'category' => 'Petugas Lapangan',
                'status' => 'Aktif',
                'phone' => '081234560004',
                'email' => 'andi@dinas.test',
                'joined_at' => '2021-03-18',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nur Aisyah',
                'position' => 'Penyuluh Lapangan',
                'unit' => 'Penyuluhan',
                'category' => 'Penyuluh',
                'status' => 'Cuti',
                'phone' => '081234560005',
                'email' => 'aisyah@dinas.test',
                'joined_at' => '2022-01-14',
                'notes' => 'Cuti sampai akhir bulan.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_records');
    }
};
