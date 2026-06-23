<?php

namespace App\Repositories\Eloquent;

use App\Models\Harvest;
use App\Repositories\Contracts\HarvestRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HarvestRepository implements HarvestRepositoryInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $search = $filters['search'] ?? null;
        $partnerFarmerId = $filters['partner_farmer_id'] ?? null;
        $cropType = $filters['crop_type'] ?? null;
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        return Harvest::query()
            ->with(['partnerFarmer:id,name,region', 'creator:id,name'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('crop_type', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('notes', 'like', "%{$search}%");
                });
            })
            ->when($partnerFarmerId, fn ($query) => $query->where('partner_farmer_id', $partnerFarmerId))
            ->when($cropType, fn ($query) => $query->where('crop_type', $cropType))
            ->when($dateFrom, fn ($query) => $query->whereDate('harvested_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('harvested_at', '<=', $dateTo))
            ->latest('harvested_at')
            ->paginate($perPage);
    }

    public function create(array $data): Harvest
    {
        return Harvest::create($data);
    }

    public function update(Harvest $harvest, array $data): Harvest
    {
        $harvest->update($data);

        return $harvest->refresh();
    }

    public function delete(Harvest $harvest): bool
    {
        return (bool) $harvest->delete();
    }

    public function monthlyStatistics(?int $year = null): Collection
    {
        $year = $year ?? now()->year;

        return Harvest::query()
            ->selectRaw('MONTH(harvested_at) as month, SUM(harvest_amount) as total')
            ->whereYear('harvested_at', $year)
            ->groupBy(DB::raw('MONTH(harvested_at)'))
            ->orderBy(DB::raw('MONTH(harvested_at)'))
            ->get()
            ->map(fn ($item) => [
                'month' => (int) $item->month,
                'total' => (float) $item->total,
            ]);
    }

    public function cropDistribution(?int $year = null): Collection
    {
        $year = $year ?? now()->year;

        return Harvest::query()
            ->selectRaw('crop_type, SUM(harvest_amount) as total')
            ->whereYear('harvested_at', $year)
            ->groupBy('crop_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'crop_type' => $item->crop_type,
                'total' => (float) $item->total,
            ]);
    }
}
