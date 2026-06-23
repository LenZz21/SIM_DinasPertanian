<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExtensionSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'scheduled_at' => optional($this->scheduled_at)->toDateString(),
            'topic' => $this->topic,
            'location' => $this->location,
            'instructor' => $this->instructor,
            'registered_participants' => (int) $this->registered_participants,
            'attended_participants' => (int) $this->attended_participants,
            'materials_count' => (int) $this->materials_count,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
