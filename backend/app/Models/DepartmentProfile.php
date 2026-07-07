<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DepartmentProfile extends Model
{
    protected $fillable = [
        'overview',
        'vision',
        'missions',
        'main_duty',
        'functions',
        'hero_image_path',
        'hero_image_path_2',
        'hero_image_path_3',
        'active_hero_image_index',
        'is_active',
    ];

    protected $appends = [
        'hero_image_url',
        'hero_image_urls',
    ];

    protected function casts(): array
    {
        return [
            'missions' => 'array',
            'functions' => 'array',
            'active_hero_image_index' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getHeroImageUrlAttribute(): ?string
    {
        $paths = $this->heroImagePaths();
        $activeIndex = max(1, min(3, (int) ($this->active_hero_image_index ?: 1)));
        $activeUrl = $this->resolveHeroImageUrl($paths[$activeIndex - 1] ?? null);

        if ($activeUrl) {
            return $activeUrl;
        }

        foreach ($paths as $path) {
            $url = $this->resolveHeroImageUrl($path);

            if ($url) {
                return $url;
            }
        }

        return null;
    }

    public function getHeroImageUrlsAttribute(): array
    {
        return array_map(
            fn (?string $path) => $this->resolveHeroImageUrl($path),
            $this->heroImagePaths(),
        );
    }

    private function heroImagePaths(): array
    {
        return [
            $this->hero_image_path,
            $this->hero_image_path_2,
            $this->hero_image_path_3,
        ];
    }

    private function resolveHeroImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        if (Storage::disk('public')->exists($path)) {
            return asset('storage/'.$path);
        }

        return null;
    }
}
