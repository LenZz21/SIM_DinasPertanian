<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LandAreaResource;
use App\Models\LandArea;
use App\Services\ActivityLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandAreaController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ActivityLogService $activityLogService) {}

    public function index(Request $request): JsonResponse
    {
        $items = LandArea::query()
            ->with('creator:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('region', 'like', '%'.$search.'%')
                        ->orWhere('land_type', 'like', '%'.$search.'%')
                        ->orWhere('main_crop', 'like', '%'.$search.'%')
                        ->orWhere('owner_group', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('type') && $request->string('type')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('land_type', $request->string('type'));
            })
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 50));

        return $this->success(LandAreaResource::collection($items), 'Data luas lahan berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate($this->rules());

        $landArea = LandArea::create([
            ...$payload,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('land-area.create', $landArea, 'Menambahkan data luas lahan.');

        return $this->success(new LandAreaResource($landArea->load('creator')), 'Data luas lahan berhasil ditambahkan.', 201);
    }

    public function show(LandArea $landArea): JsonResponse
    {
        return $this->success(new LandAreaResource($landArea->load('creator')), 'Detail luas lahan.');
    }

    public function update(Request $request, LandArea $landArea): JsonResponse
    {
        $payload = $request->validate($this->rules());

        $landArea->update($payload);

        $this->activityLogService->log('land-area.update', $landArea, 'Memperbarui data luas lahan.');

        return $this->success(new LandAreaResource($landArea->load('creator')), 'Data luas lahan berhasil diperbarui.');
    }

    public function destroy(LandArea $landArea): JsonResponse
    {
        $landArea->delete();

        $this->activityLogService->log('land-area.delete', $landArea, 'Menghapus data luas lahan.');

        return $this->success(null, 'Data luas lahan berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'region' => ['required', 'string', 'max:190'],
            'land_type' => ['required', 'string', 'max:80'],
            'area_size' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:20'],
            'status' => ['required', 'string', 'max:80'],
            'main_crop' => ['nullable', 'string', 'max:120'],
            'owner_group' => ['nullable', 'string', 'max:190'],
            'last_surveyed_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
