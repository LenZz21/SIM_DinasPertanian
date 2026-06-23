<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LivestockRecord extends Model
{
    /** @use HasFactory<\Database\Factories\LivestockRecordFactory> */
    use HasFactory;

    protected $fillable = [
        'partner_name',
        'livestock_type',
        'quantity',
        'region',
        'health_status',
        'owner_phone',
        'last_checked_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'last_checked_at' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
