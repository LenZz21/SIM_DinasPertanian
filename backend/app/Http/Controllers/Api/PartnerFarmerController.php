<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PartnerFarmer\StorePartnerFarmerRequest;
use App\Http\Requests\PartnerFarmer\UpdatePartnerFarmerRequest;
use App\Http\Resources\PartnerFarmerResource;
use App\Models\PartnerFarmer;
use App\Repositories\Contracts\PartnerFarmerRepositoryInterface;
use App\Services\ActivityLogService;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerFarmerController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PartnerFarmerRepositoryInterface $partnerFarmerRepository,
        private readonly FileUploadService $fileUploadService,
        private readonly ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $mitra = $this->partnerFarmerRepository->paginate($request->all());

        return $this->success(PartnerFarmerResource::collection($mitra), 'Data mitra berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $mitra->currentPage(),
                'last_page' => $mitra->lastPage(),
                'per_page' => $mitra->perPage(),
                'total' => $mitra->total(),
            ],
        ]);
    }

    public function store(StorePartnerFarmerRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $photoPath = $this->fileUploadService->upload($request->file('photo'), 'mitra');

        $partnerFarmer = $this->partnerFarmerRepository->create([
            'name' => $payload['name'],
            'address' => $payload['address'],
            'phone' => $payload['phone'],
            'region' => $payload['region'],
            'plant_type' => $payload['plant_type'],
            'photo_path' => $photoPath,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('mitra.create', $partnerFarmer, 'Menambahkan data mitra.');

        return $this->success(
            new PartnerFarmerResource($partnerFarmer->load('creator', 'harvests')),
            'Mitra berhasil ditambahkan.',
            201
        );
    }

    public function show(PartnerFarmer $mitra): JsonResponse
    {
        return $this->success(new PartnerFarmerResource($mitra->load('creator', 'harvests')), 'Detail mitra.');
    }

    public function update(UpdatePartnerFarmerRequest $request, PartnerFarmer $mitra): JsonResponse
    {
        $payload = $request->validated();
        $photoPath = $this->fileUploadService->replace($request->file('photo'), $mitra->photo_path, 'mitra');

        $mitra = $this->partnerFarmerRepository->update($mitra, [
            'name' => $payload['name'] ?? $mitra->name,
            'address' => $payload['address'] ?? $mitra->address,
            'phone' => $payload['phone'] ?? $mitra->phone,
            'region' => $payload['region'] ?? $mitra->region,
            'plant_type' => $payload['plant_type'] ?? $mitra->plant_type,
            'photo_path' => $photoPath,
        ]);

        $this->activityLogService->log('mitra.update', $mitra, 'Memperbarui data mitra.');

        return $this->success(new PartnerFarmerResource($mitra->load('creator', 'harvests')), 'Mitra berhasil diperbarui.');
    }

    public function destroy(PartnerFarmer $mitra): JsonResponse
    {
        $this->fileUploadService->delete($mitra->photo_path);
        $this->partnerFarmerRepository->delete($mitra);
        $this->activityLogService->log('mitra.delete', $mitra, 'Menghapus data mitra.');

        return $this->success(null, 'Mitra berhasil dihapus.');
    }
}
