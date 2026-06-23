<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fertilizer_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('warehouse');
            $table->string('fertilizer_type');
            $table->decimal('stock_amount', 12, 2)->default(0);
            $table->string('unit', 20)->default('Kg');
            $table->decimal('minimum_stock', 12, 2)->default(200);
            $table->string('supplier')->nullable();
            $table->date('last_restocked_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::table('fertilizer_stocks')->insert([
            [
                'warehouse' => 'Gudang Tahuna',
                'fertilizer_type' => 'Urea',
                'stock_amount' => 150,
                'unit' => 'Kg',
                'minimum_stock' => 200,
                'supplier' => 'Distributor Subsidi Wilayah Utara',
                'last_restocked_at' => '2026-05-24',
                'notes' => 'Prioritas restock karena stok menipis.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'warehouse' => 'Gudang Bontoala',
                'fertilizer_type' => 'NPK',
                'stock_amount' => 640,
                'unit' => 'Kg',
                'minimum_stock' => 250,
                'supplier' => 'PT Pupuk Indonesia',
                'last_restocked_at' => '2026-05-21',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'warehouse' => 'Gudang Maccini',
                'fertilizer_type' => 'Organik',
                'stock_amount' => 820,
                'unit' => 'Kg',
                'minimum_stock' => 300,
                'supplier' => 'Koperasi Tani Hijau',
                'last_restocked_at' => '2026-05-18',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'warehouse' => 'Gudang Bira',
                'fertilizer_type' => 'Urea',
                'stock_amount' => 1370,
                'unit' => 'Kg',
                'minimum_stock' => 300,
                'supplier' => 'Distributor Subsidi Wilayah Timur',
                'last_restocked_at' => '2026-05-20',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'warehouse' => 'Gudang Paal Dua',
                'fertilizer_type' => 'Urea',
                'stock_amount' => 2000,
                'unit' => 'Kg',
                'minimum_stock' => 350,
                'supplier' => 'PT Pupuk Indonesia',
                'last_restocked_at' => '2026-05-27',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'warehouse' => 'Gudang Paniki',
                'fertilizer_type' => 'NPK',
                'stock_amount' => 2100,
                'unit' => 'Kg',
                'minimum_stock' => 350,
                'supplier' => 'PT Pupuk Indonesia',
                'last_restocked_at' => '2026-05-26',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'warehouse' => 'Gudang Tamalanrea',
                'fertilizer_type' => 'Organik',
                'stock_amount' => 1670,
                'unit' => 'Kg',
                'minimum_stock' => 300,
                'supplier' => 'Koperasi Tani Hijau',
                'last_restocked_at' => '2026-05-25',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('fertilizer_stocks');
    }
};
