<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryAlbumResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $photos = $this->whenLoaded('photos');
        $cover = $this->photos->first();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'cover_url' => $cover?->image_path ? asset('storage/'.$cover->image_path) : null,
            'photos_count' => $this->photos_count ?? $this->photos->count(),
            'photos' => GalleryItemResource::collection($photos),
            'taken_at' => optional($this->taken_at)->toDateString(),
            'uploaded_by' => $this->uploader?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
