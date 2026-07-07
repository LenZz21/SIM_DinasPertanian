<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category ?? 'Berita',
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'is_published' => (bool) $this->is_published,
            'views_count' => (int) ($this->views_count ?? 0),
            'published_at' => optional($this->published_at)->toISOString(),
            'author' => $this->author?->name,
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'comments' => NewsCommentResource::collection($this->whenLoaded('comments')),
            'comments_count' => $this->whenCounted('comments'),
        ];
    }
}
