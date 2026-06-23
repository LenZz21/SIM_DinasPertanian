<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\FertilizerStock;
use App\Models\Harvest;
use App\Models\LandArea;
use App\Models\LivestockRecord;
use App\Models\PartnerFarmer;
use App\Repositories\Contracts\HarvestRepositoryInterface;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(
        private readonly HarvestRepositoryInterface $harvestRepository
    ) {}

    public function summary(?int $year = null): array
    {
        $year = $year ?? now()->year;

        $totalMitra = PartnerFarmer::count();
        $totalHarvest = Harvest::query()
            ->whereYear('harvested_at', $year)
            ->sum('harvest_amount');
        $harvestThisMonth = Harvest::query()
            ->whereYear('harvested_at', $year)
            ->whereMonth('harvested_at', now()->month)
            ->sum('harvest_amount');
        $totalHarvestRecords = Harvest::query()
            ->whereYear('harvested_at', $year)
            ->count();
        $totalActiveLand = LandArea::query()
            ->where('status', 'Aktif')
            ->sum('area_size');
        $totalLivestock = LivestockRecord::sum('quantity');
        $totalFertilizerStock = FertilizerStock::sum('stock_amount');

        $monthlyStats = $this->harvestRepository->monthlyStatistics($year);
        $cropDistribution = $this->harvestRepository->cropDistribution($year);

        $latestActivities = ActivityLog::query()
            ->with('user:id,name')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'user' => $item->user?->name ?? 'System',
                'action' => $item->action,
                'description' => $item->description,
                'created_at' => $item->created_at?->toISOString(),
            ]);

        $regionTotals = Harvest::query()
            ->join('partner_farmers', 'harvests.partner_farmer_id', '=', 'partner_farmers.id')
            ->select('partner_farmers.region', DB::raw('SUM(harvest_amount) as total'))
            ->whereYear('harvests.harvested_at', $year)
            ->groupBy('partner_farmers.region')
            ->orderByDesc('total')
            ->limit(15)
            ->get();

        return [
            'totals' => [
                'total_mitra' => $totalMitra,
                'total_hasil_panen' => (float) $totalHarvest,
                'hasil_panen_bulan_ini' => (float) $harvestThisMonth,
                'total_luas_lahan_aktif' => (float) $totalActiveLand,
                'total_ternak' => (int) $totalLivestock,
                'total_stok_pupuk' => (float) $totalFertilizerStock,
                'total_laporan' => $totalHarvestRecords,
            ],
            'statistics' => [
                'monthly' => $monthlyStats,
                'crop_distribution' => $cropDistribution,
                'region_heatmap' => $regionTotals,
            ],
            'latest_activities' => $latestActivities,
        ];
    }
}
