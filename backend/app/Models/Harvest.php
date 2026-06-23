<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Harvest extends Model
{
    /** @use HasFactory<\Database\Factories\HarvestFactory> */
    use HasFactory;

    protected $fillable = [
        'partner_farmer_id',
        'crop_type',
        'harvest_amount',
        'harvested_at',
        'location',
        'photo_path',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'harvested_at' => 'date',
            'harvest_amount' => 'decimal:2',
        ];
    }

    public function partnerFarmer(): BelongsTo
    {
        return $this->belongsTo(PartnerFarmer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
