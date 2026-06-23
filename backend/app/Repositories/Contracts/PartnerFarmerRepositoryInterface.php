<?php

namespace App\Repositories\Contracts;

use App\Models\PartnerFarmer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PartnerFarmerRepositoryInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator;

    public function create(array $data): PartnerFarmer;

    public function update(PartnerFarmer $partnerFarmer, array $data): PartnerFarmer;

    public function delete(PartnerFarmer $partnerFarmer): bool;
}
