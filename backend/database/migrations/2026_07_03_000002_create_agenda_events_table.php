<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agenda_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->string('location');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('category')->default('Agenda Pertanian');
            $table->string('image_path')->nullable();
            $table->string('status')->default('Terjadwal');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'starts_at']);
            $table->index(['category', 'starts_at']);
        });

        if (Schema::hasTable('extension_sessions')) {
            DB::table('extension_sessions')
                ->orderBy('scheduled_at')
                ->get()
                ->each(function ($item) {
                    DB::table('agenda_events')->insert([
                        'title' => $item->topic,
                        'summary' => $item->notes,
                        'location' => $item->location,
                        'starts_at' => $item->scheduled_at.' 09:00:00',
                        'ends_at' => $item->scheduled_at.' 12:00:00',
                        'category' => 'Agenda Pertanian',
                        'image_path' => null,
                        'status' => $item->status,
                        'created_by' => $item->created_by,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                    ]);
                });

            Schema::dropIfExists('extension_sessions');
        }
    }

    public function down(): void
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

        Schema::dropIfExists('agenda_events');
    }
};
