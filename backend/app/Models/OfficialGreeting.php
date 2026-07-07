<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialGreeting extends Model
{
    protected $fillable = [
        'name',
        'position',
        'institution',
        'photo_path',
        'detail_url',
        'paragraphs',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'paragraphs' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
