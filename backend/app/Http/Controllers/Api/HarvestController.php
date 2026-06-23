<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Harvest\StoreHarvestRequest;
use App\Http\Requests\Harvest\UpdateHarvestRequest;
use App\Http\Resources\HarvestResource;
use App\Models\Harvest;
use App\Repositories\Contracts\HarvestRepositoryInterface;
use App\Services\ActivityLogService;
use App\Services\FileUploadService;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HarvestController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly HarvestRepositoryInterface $harvestRepository,
        private readonly FileUploadService $fileUploadService,
        private readonly NotificationService $notificationService,
        private readonly ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $harvests = $this->harvestRepository->paginate($request->all());

        return $this->success(HarvestResource::collection($harvests), 'Data hasil panen berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $harvests->currentPage(),
                'last_page' => $harvests->lastPage(),
                'per_page' => $harvests->perPage(),
                'total' => $harvests->total(),
            ],
        ]);
    }

    public function store(StoreHarvestRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $photoPath = $this->fileUploadService->upload($request->file('photo'), 'harvests');

        $harvest = $this->harvestRepository->create([
            'partner_farmer_id' => $payload['partner_farmer_id'],
            'crop_type' => $payload['crop_type'],
            'harvest_amount' => $payload['harvest_amount'],
            'harvested_at' => $payload['harvested_at'],
            'location' => $payload['location'],
            'notes' => $payload['notes'] ?? null,
            'photo_path' => $photoPath,
            'created_by' => auth('api')->id(),
        ]);

        $this->notificationService->notifyRoles(
            ['Admin', 'Petugas'],
            'Hasil panen baru',
            "Input panen baru: {$harvest->crop_type} sebanyak {$harvest->harvest_amount}.",
            'success',
            ['harvest_id' => $harvest->id]
        );

        $this->activityLogService->log('harvest.create', $harvest, 'Menambahkan hasil panen.');

        return $this->success(new HarvestResource($harvest->load('partnerFarmer', 'creator')), 'Data hasil panen berhasil ditambahkan.', 201);
    }

    public function show(Harvest $hasil): JsonResponse
    {
        return $this->success(new HarvestResource($hasil->load('partnerFarmer', 'creator')), 'Detail hasil panen.');
    }

    public function update(UpdateHarvestRequest $request, Harvest $hasil): JsonResponse
    {
        $payload = $request->validated();
        $photoPath = $this->fileUploadService->replace($request->file('photo'), $hasil->photo_path, 'harvests');

        $hasil = $this->harvestRepository->update($hasil, [
            'partner_farmer_id' => $payload['partner_farmer_id'] ?? $hasil->partner_farmer_id,
            'crop_type' => $payload['crop_type'] ?? $hasil->crop_type,
            'harvest_amount' => $payload['harvest_amount'] ?? $hasil->harvest_amount,
            'harvested_at' => $payload['harvested_at'] ?? $hasil->harvested_at,
            'location' => $payload['location'] ?? $hasil->location,
            'notes' => $payload['notes'] ?? $hasil->notes,
            'photo_path' => $photoPath,
        ]);

        $this->activityLogService->log('harvest.update', $hasil, 'Memperbarui hasil panen.');

        return $this->success(new HarvestResource($hasil->load('partnerFarmer', 'creator')), 'Data hasil panen berhasil diperbarui.');
    }

    public function destroy(Harvest $hasil): JsonResponse
    {
        $this->fileUploadService->delete($hasil->photo_path);
        $this->harvestRepository->delete($hasil);
        $this->activityLogService->log('harvest.delete', $hasil, 'Menghapus hasil panen.');

        return $this->success(null, 'Data hasil panen berhasil dihapus.');
    }

    public function statistics(Request $request): JsonResponse
    {
        $year = $request->integer('year');

        return $this->success([
            'monthly' => $this->harvestRepository->monthlyStatistics($year),
            'crop_distribution' => $this->harvestRepository->cropDistribution($year),
        ], 'Statistik panen berhasil diambil.');
    }
}
