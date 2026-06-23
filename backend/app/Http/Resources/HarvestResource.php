<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HarvestResource extends JsonResource
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
            'partner_farmer' => [
                'id' => $this->partnerFarmer?->id,
                'name' => $this->partnerFarmer?->name,
                'region' => $this->partnerFarmer?->region,
            ],
            'crop_type' => $this->crop_type,
            'harvest_amount' => (float) $this->harvest_amount,
            'harvested_at' => optional($this->harvested_at)->format('Y-m-d'),
            'location' => $this->location,
            'notes' => $this->notes,
            'photo_url' => $this->photo_path ? asset('storage/'.$this->photo_path) : null,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
