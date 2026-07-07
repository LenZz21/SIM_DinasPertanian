<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_albums', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('Kegiatan Lapangan');
            $table->date('taken_at')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['category', 'created_at']);
        });

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->foreignId('album_id')->nullable()->after('id')->constrained('gallery_albums')->cascadeOnDelete();
        });

        DB::table('gallery_items')
            ->orderBy('id')
            ->get()
            ->each(function ($item) {
                $albumId = DB::table('gallery_albums')->insertGetId([
                    'title' => $item->title,
                    'description' => $item->description,
                    'category' => $item->category,
                    'taken_at' => $item->taken_at,
                    'uploaded_by' => $item->uploaded_by,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ]);

                DB::table('gallery_items')
                    ->where('id', $item->id)
                    ->update(['album_id' => $albumId]);
            });
    }

    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('album_id');
        });

        Schema::dropIfExists('gallery_albums');
    }
};
