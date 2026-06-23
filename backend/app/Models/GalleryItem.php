<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GalleryItem extends Model
{
    /** @use HasFactory<\Database\Factories\GalleryItemFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'image_path',
        'taken_at',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'date',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
