<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeRecordResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'structure_key' => $this->structure_key,
            'name' => $this->name,
            'position' => $this->position,
            'unit' => $this->unit,
            'category' => $this->category,
            'status' => $this->status,
            'phone' => $this->phone,
            'email' => $this->email,
            'photo_url' => $this->photo_path ? asset('storage/'.$this->photo_path) : null,
            'joined_at' => optional($this->joined_at)->toDateString(),
            'notes' => $this->notes,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
