<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeRecordResource;
use App\Models\EmployeeRecord;
use App\Services\ActivityLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeRecordController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ActivityLogService $activityLogService) {}

    public function index(Request $request): JsonResponse
    {
        $items = EmployeeRecord::query()
            ->with('creator:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('position', 'like', '%'.$search.'%')
                        ->orWhere('unit', 'like', '%'.$search.'%')
                        ->orWhere('category', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('category') && $request->string('category')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 50));

        return $this->success(EmployeeRecordResource::collection($items), 'Data pegawai berhasil diambil.', 200, [
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

        $employeeRecord = EmployeeRecord::create([
            ...$payload,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('employee.create', $employeeRecord, 'Menambahkan data pegawai.');

        return $this->success(new EmployeeRecordResource($employeeRecord->load('creator')), 'Data pegawai berhasil ditambahkan.', 201);
    }

    public function show(EmployeeRecord $employeeRecord): JsonResponse
    {
        return $this->success(new EmployeeRecordResource($employeeRecord->load('creator')), 'Detail pegawai.');
    }

    public function update(Request $request, EmployeeRecord $employeeRecord): JsonResponse
    {
        $payload = $request->validate($this->rules());

        $employeeRecord->update($payload);

        $this->activityLogService->log('employee.update', $employeeRecord, 'Memperbarui data pegawai.');

        return $this->success(new EmployeeRecordResource($employeeRecord->load('creator')), 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(EmployeeRecord $employeeRecord): JsonResponse
    {
        $employeeRecord->delete();

        $this->activityLogService->log('employee.delete', $employeeRecord, 'Menghapus data pegawai.');

        return $this->success(null, 'Data pegawai berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'position' => ['required', 'string', 'max:150'],
            'unit' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', 'max:120'],
            'status' => ['required', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:190'],
            'joined_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
