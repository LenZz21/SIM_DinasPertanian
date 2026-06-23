<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FertilizerStockResource;
use App\Models\FertilizerStock;
use App\Services\ActivityLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FertilizerStockController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ActivityLogService $activityLogService) {}

    public function index(Request $request): JsonResponse
    {
        $items = FertilizerStock::query()
            ->with('creator:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('warehouse', 'like', '%'.$search.'%')
                        ->orWhere('fertilizer_type', 'like', '%'.$search.'%')
                        ->orWhere('supplier', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('type') && $request->string('type')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('fertilizer_type', $request->string('type'));
            })
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                match ($request->string('status')->toString()) {
                    'Kosong' => $query->where('stock_amount', '<=', 0),
                    'Menipis' => $query->where('stock_amount', '>', 0)->whereColumn('stock_amount', '<=', 'minimum_stock'),
                    'Aman' => $query->whereColumn('stock_amount', '>', 'minimum_stock'),
                    default => $query,
                };
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 50));

        return $this->success(FertilizerStockResource::collection($items), 'Data stok pupuk berhasil diambil.', 200, [
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

        $fertilizerStock = FertilizerStock::create([
            ...$payload,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('fertilizer.create', $fertilizerStock, 'Menambahkan data stok pupuk.');

        return $this->success(new FertilizerStockResource($fertilizerStock->load('creator')), 'Data stok pupuk berhasil ditambahkan.', 201);
    }

    public function show(FertilizerStock $fertilizerStock): JsonResponse
    {
        return $this->success(new FertilizerStockResource($fertilizerStock->load('creator')), 'Detail stok pupuk.');
    }

    public function update(Request $request, FertilizerStock $fertilizerStock): JsonResponse
    {
        $payload = $request->validate($this->rules());

        $fertilizerStock->update($payload);

        $this->activityLogService->log('fertilizer.update', $fertilizerStock, 'Memperbarui data stok pupuk.');

        return $this->success(new FertilizerStockResource($fertilizerStock->load('creator')), 'Data stok pupuk berhasil diperbarui.');
    }

    public function destroy(FertilizerStock $fertilizerStock): JsonResponse
    {
        $fertilizerStock->delete();

        $this->activityLogService->log('fertilizer.delete', $fertilizerStock, 'Menghapus data stok pupuk.');

        return $this->success(null, 'Data stok pupuk berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'warehouse' => ['required', 'string', 'max:190'],
            'fertilizer_type' => ['required', 'string', 'max:80'],
            'stock_amount' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:20'],
            'minimum_stock' => ['required', 'numeric', 'min:0'],
            'supplier' => ['nullable', 'string', 'max:190'],
            'last_restocked_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
