<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('news_id')->constrained('news')->cascadeOnDelete();
            $table->date('viewed_on');
            $table->string('visitor_hash', 64);
            $table->timestamps();

            $table->unique(['news_id', 'viewed_on', 'visitor_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_views');
    }
};
