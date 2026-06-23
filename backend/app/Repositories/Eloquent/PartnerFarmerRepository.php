<?php

namespace App\Repositories\Eloquent;

use App\Models\PartnerFarmer;
use App\Repositories\Contracts\PartnerFarmerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PartnerFarmerRepository implements PartnerFarmerRepositoryInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $search = $filters['search'] ?? null;
        $region = $filters['region'] ?? null;
        $plantType = $filters['plant_type'] ?? null;

        return PartnerFarmer::query()
            ->with(['creator:id,name', 'harvests:id,partner_farmer_id,harvest_amount,harvested_at'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('region', 'like', "%{$search}%")
                        ->orWhere('plant_type', 'like', "%{$search}%");
                });
            })
            ->when($region, fn ($query) => $query->where('region', $region))
            ->when($plantType, fn ($query) => $query->where('plant_type', $plantType))
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): PartnerFarmer
    {
        return PartnerFarmer::create($data);
    }

    public function update(PartnerFarmer $partnerFarmer, array $data): PartnerFarmer
    {
        $partnerFarmer->update($data);

        return $partnerFarmer->refresh();
    }

    public function delete(PartnerFarmer $partnerFarmer): bool
    {
        return (bool) $partnerFarmer->delete();
    }
}
