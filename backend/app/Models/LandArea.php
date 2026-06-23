<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandArea extends Model
{
    /** @use HasFactory<\Database\Factories\LandAreaFactory> */
    use HasFactory;

    protected $fillable = [
        'region',
        'land_type',
        'area_size',
        'unit',
        'status',
        'main_crop',
        'owner_group',
        'last_surveyed_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'area_size' => 'decimal:2',
            'last_surveyed_at' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
