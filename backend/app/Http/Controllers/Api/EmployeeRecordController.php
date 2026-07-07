<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeRecordResource;
use App\Models\EmployeeRecord;
use App\Services\ActivityLogService;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeRecordController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ActivityLogService $activityLogService,
        private readonly FileUploadService $fileUploadService
    ) {}

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
        $payload = $request->validate($this->rules(), $this->messages());
        $photoPath = $this->fileUploadService->upload($request->file('photo'), 'employees');

        unset($payload['photo']);

        $employeeRecord = EmployeeRecord::create([
            ...$payload,
            'photo_path' => $photoPath,
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
        $payload = $request->validate($this->rules(), $this->messages());
        $photoPath = $this->fileUploadService->replace($request->file('photo'), $employeeRecord->photo_path, 'employees');

        unset($payload['photo']);

        $employeeRecord->update([
            ...$payload,
            'photo_path' => $photoPath,
        ]);

        $this->activityLogService->log('employee.update', $employeeRecord, 'Memperbarui data pegawai.');

        return $this->success(new EmployeeRecordResource($employeeRecord->load('creator')), 'Data pegawai berhasil diperbarui.');
    }

    public function destroy(EmployeeRecord $employeeRecord): JsonResponse
    {
        $this->fileUploadService->delete($employeeRecord->photo_path);

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
            'photo' => ['nullable', 'image', 'max:4096'],
            'joined_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return [
            'photo.image' => 'File foto harus berupa gambar JPG, PNG, atau format gambar lain yang valid.',
            'photo.max' => 'Ukuran foto maksimal 4 MB.',
        ];
    }
}
