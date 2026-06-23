<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LandAreaResource extends JsonResource
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
            'region' => $this->region,
            'land_type' => $this->land_type,
            'area_size' => (float) $this->area_size,
            'unit' => $this->unit,
            'status' => $this->status,
            'main_crop' => $this->main_crop,
            'owner_group' => $this->owner_group,
            'last_surveyed_at' => optional($this->last_surveyed_at)->toDateString(),
            'notes' => $this->notes,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
