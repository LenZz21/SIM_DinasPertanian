<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LivestockRecordResource;
use App\Models\LivestockRecord;
use App\Services\ActivityLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LivestockRecordController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ActivityLogService $activityLogService) {}

    public function index(Request $request): JsonResponse
    {
        $items = LivestockRecord::query()
            ->with('creator:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('partner_name', 'like', '%'.$search.'%')
                        ->orWhere('livestock_type', 'like', '%'.$search.'%')
                        ->orWhere('region', 'like', '%'.$search.'%')
                        ->orWhere('owner_phone', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('type') && $request->string('type')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('livestock_type', $request->string('type'));
            })
            ->when($request->filled('region') && $request->string('region')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('region', $request->string('region'));
            })
            ->when($request->filled('health_status') && $request->string('health_status')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('health_status', $request->string('health_status'));
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 50));

        return $this->success(LivestockRecordResource::collection($items), 'Data ternak berhasil diambil.', 200, [
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

        $livestockRecord = LivestockRecord::create([
            ...$payload,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('livestock.create', $livestockRecord, 'Menambahkan data ternak.');

        return $this->success(new LivestockRecordResource($livestockRecord->load('creator')), 'Data ternak berhasil ditambahkan.', 201);
    }

    public function show(LivestockRecord $livestockRecord): JsonResponse
    {
        return $this->success(new LivestockRecordResource($livestockRecord->load('creator')), 'Detail data ternak.');
    }

    public function update(Request $request, LivestockRecord $livestockRecord): JsonResponse
    {
        $payload = $request->validate($this->rules());

        $livestockRecord->update($payload);

        $this->activityLogService->log('livestock.update', $livestockRecord, 'Memperbarui data ternak.');

        return $this->success(new LivestockRecordResource($livestockRecord->load('creator')), 'Data ternak berhasil diperbarui.');
    }

    public function destroy(LivestockRecord $livestockRecord): JsonResponse
    {
        $livestockRecord->delete();

        $this->activityLogService->log('livestock.delete', $livestockRecord, 'Menghapus data ternak.');

        return $this->success(null, 'Data ternak berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'partner_name' => ['required', 'string', 'max:190'],
            'livestock_type' => ['required', 'string', 'max:80'],
            'quantity' => ['required', 'integer', 'min:0'],
            'region' => ['required', 'string', 'max:120'],
            'health_status' => ['required', 'string', 'max:80'],
            'owner_phone' => ['nullable', 'string', 'max:30'],
            'last_checked_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
