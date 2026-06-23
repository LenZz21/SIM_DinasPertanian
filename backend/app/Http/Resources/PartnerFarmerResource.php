<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerFarmerResource extends JsonResource
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
            'address' => $this->address,
            'phone' => $this->phone,
            'region' => $this->region,
            'plant_type' => $this->plant_type,
            'photo_url' => $this->photo_path ? asset('storage/'.$this->photo_path) : null,
            'created_by' => $this->creator?->name,
            'total_harvest' => $this->whenLoaded(
                'harvests',
                fn () => (float) $this->harvests->sum('harvest_amount')
            ),
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
