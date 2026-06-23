<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FertilizerStock extends Model
{
    /** @use HasFactory<\Database\Factories\FertilizerStockFactory> */
    use HasFactory;

    protected $fillable = [
        'warehouse',
        'fertilizer_type',
        'stock_amount',
        'unit',
        'minimum_stock',
        'supplier',
        'last_restocked_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'stock_amount' => 'decimal:2',
            'minimum_stock' => 'decimal:2',
            'last_restocked_at' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getStockStatusAttribute(): string
    {
        if ((float) $this->stock_amount <= 0) {
            return 'Kosong';
        }

        if ((float) $this->stock_amount <= (float) $this->minimum_stock) {
            return 'Menipis';
        }

        return 'Aman';
    }
}
