<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExtensionSession extends Model
{
    /** @use HasFactory<\Database\Factories\ExtensionSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'scheduled_at',
        'topic',
        'location',
        'instructor',
        'registered_participants',
        'attended_participants',
        'materials_count',
        'status',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'date',
            'registered_participants' => 'integer',
            'attended_participants' => 'integer',
            'materials_count' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
