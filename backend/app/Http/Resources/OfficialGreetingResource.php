<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OfficialGreetingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'position' => $this->position,
            'institution' => $this->institution,
            'photo_url' => $this->resolvePhotoUrl($this->photo_path),
            'detail_url' => $this->detail_url,
            'paragraphs' => $this->paragraphs ?? [],
            'is_active' => (bool) $this->is_active,
            'updated_at' => optional($this->updated_at)->toISOString(),
        ];
    }

    private function resolvePhotoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        if (file_exists(public_path($path))) {
            return asset($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return asset('storage/'.$path);
        }

        return null;
    }
}
