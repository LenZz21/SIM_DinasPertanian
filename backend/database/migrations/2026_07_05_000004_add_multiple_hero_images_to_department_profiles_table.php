<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('department_profiles', function (Blueprint $table) {
            $table->string('hero_image_path_2')->nullable()->after('hero_image_path');
            $table->string('hero_image_path_3')->nullable()->after('hero_image_path_2');
            $table->unsignedTinyInteger('active_hero_image_index')->default(1)->after('hero_image_path_3');
        });
    }

    public function down(): void
    {
        Schema::table('department_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'hero_image_path_2',
                'hero_image_path_3',
                'active_hero_image_index',
            ]);
        });
    }
};
