<?php

namespace App\Repositories\Contracts;

use App\Models\Harvest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface HarvestRepositoryInterface
{
    public function paginate(array $filters = []): LengthAwarePaginator;

    public function create(array $data): Harvest;

    public function update(Harvest $harvest, array $data): Harvest;

    public function delete(Harvest $harvest): bool;

    public function monthlyStatistics(?int $year = null): Collection;

    public function cropDistribution(?int $year = null): Collection;
}
