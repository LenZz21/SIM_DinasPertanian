<?php

namespace App\Services;

use App\Models\Harvest;

class ReportService
{
    public function harvestData(?string $dateFrom = null, ?string $dateTo = null)
    {
        return Harvest::query()
            ->with('partnerFarmer:id,name,region')
            ->when($dateFrom, fn ($query) => $query->whereDate('harvested_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('harvested_at', '<=', $dateTo))
            ->latest('harvested_at')
            ->get();
    }

    public function summary(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $query = Harvest::query()
            ->when($dateFrom, fn ($q) => $q->whereDate('harvested_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('harvested_at', '<=', $dateTo));

        return [
            'total_data' => (clone $query)->count(),
            'total_panen' => (float) (clone $query)->sum('harvest_amount'),
            'rata_rata_panen' => (float) (clone $query)->avg('harvest_amount'),
        ];
    }
}
