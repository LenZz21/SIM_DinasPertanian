<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GalleryAlbum extends Model
{
    protected $fillable = [
        'title',
        'description',
        'category',
        'taken_at',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'date',
        ];
    }

    public function photos(): HasMany
    {
        return $this->hasMany(GalleryItem::class, 'album_id')->latest();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
