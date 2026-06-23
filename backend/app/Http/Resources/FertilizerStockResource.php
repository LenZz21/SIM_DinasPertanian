<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FertilizerStockResource extends JsonResource
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
            'warehouse' => $this->warehouse,
            'fertilizer_type' => $this->fertilizer_type,
            'stock_amount' => (float) $this->stock_amount,
            'unit' => $this->unit,
            'minimum_stock' => (float) $this->minimum_stock,
            'status' => $this->stock_status,
            'supplier' => $this->supplier,
            'last_restocked_at' => optional($this->last_restocked_at)->toDateString(),
            'notes' => $this->notes,
            'created_by' => $this->creator?->name,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
