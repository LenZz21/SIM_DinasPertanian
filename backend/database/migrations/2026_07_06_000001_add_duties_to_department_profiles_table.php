<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('department_profiles', function (Blueprint $table) {
            $table->text('main_duty')->nullable()->after('missions');
            $table->json('functions')->nullable()->after('main_duty');
        });

        DB::table('department_profiles')->update([
            'main_duty' => 'Membantu Bupati melaksanakan urusan Pemerintahan di bidang pertanian yang menjadi kewenangan Daerah dan Tugas Pembantuan yang diberikan kepada kabupaten di bidang Pertanian.',
            'functions' => json_encode([
                'Perumusan kebijakan teknis di bidang Pertanian;',
                'Pelaksanaan kebijakan di bidang Pertanian;',
                'Pelaksanaan evaluasi dan pelaporan di bidang Tanaman Pangan, Peternakan, Perkebunan dan Penyuluhan;',
                'Pelaksanaan administrasi dinas di bidang pertanian; dan',
                'Pelaksanaan fungsi lain yang diberikan oleh atasan terkait dengan tugas dan fungsinya.',
            ]),
        ]);
    }

    public function down(): void
    {
        Schema::table('department_profiles', function (Blueprint $table) {
            $table->dropColumn(['main_duty', 'functions']);
        });
    }
};
