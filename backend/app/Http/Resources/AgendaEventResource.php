<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class AgendaEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->id.'-'.Str::slug($this->title),
            'title' => $this->title,
            'summary' => $this->summary,
            'location' => $this->location,
            'starts_at' => optional($this->starts_at)->toISOString(),
            'ends_at' => optional($this->ends_at)->toISOString(),
            'category' => $this->category,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'status' => $this->status,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
