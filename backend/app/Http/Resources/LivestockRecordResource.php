<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LivestockRecordResource extends JsonResource
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
            'partner_name' => $this->partner_name,
            'livestock_type' => $this->livestock_type,
            'quantity' => (int) $this->quantity,
            'region' => $this->region,
            'health_status' => $this->health_status,
            'owner_phone' => $this->owner_phone,
            'last_checked_at' => optional($this->last_checked_at)->toDateString(),
            'notes' => $this->notes,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
