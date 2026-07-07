<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryItemResource extends JsonResource
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
            'album_id' => $this->album_id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'taken_at' => optional($this->taken_at)->toDateString(),
            'uploaded_by' => $this->uploader?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
