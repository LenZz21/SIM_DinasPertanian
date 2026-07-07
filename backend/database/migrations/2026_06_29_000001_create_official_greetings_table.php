<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('official_greetings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('institution');
            $table->string('photo_path')->nullable();
            $table->string('detail_url')->default('/profil/sambutan-kepala-dinas');
            $table->json('paragraphs');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('official_greetings')->insert([
            'name' => 'Drs. Nama Kepala Dinas',
            'position' => 'Kepala Dinas Pertanian',
            'institution' => 'Kabupaten Kepulauan Sangihe',
            'photo_path' => 'images/kepala-dinas.png',
            'detail_url' => '/profil/sambutan-kepala-dinas',
            'paragraphs' => json_encode([
                'Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas dedikasi dan kerja keras seluruh insan pertanian di Kepulauan Sangihe.',
                'Dinas Pertanian berkomitmen untuk terus mendorong kemajuan sektor pertanian melalui pelayanan publik yang prima, inovasi teknologi, serta penguatan kolaborasi bersama seluruh pemangku kepentingan.',
                'Bersama, kita wujudkan pertanian yang maju, mandiri, dan modern demi kesejahteraan petani dan pembangunan berkelanjutan di Kepulauan Sangihe.',
            ]),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('official_greetings');
    }
};
