<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_records', function (Blueprint $table) {
            $table->string('structure_key')->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('employee_records', function (Blueprint $table) {
            $table->dropUnique(['structure_key']);
            $table->dropColumn('structure_key');
        });
    }
};
