<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeRecord extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeRecordFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'position',
        'unit',
        'category',
        'status',
        'phone',
        'email',
        'joined_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
