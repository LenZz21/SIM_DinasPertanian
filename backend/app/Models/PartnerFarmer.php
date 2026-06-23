<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerFarmer extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerFarmerFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'photo_path',
        'region',
        'plant_type',
        'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function harvests(): HasMany
    {
        return $this->hasMany(Harvest::class);
    }
}
