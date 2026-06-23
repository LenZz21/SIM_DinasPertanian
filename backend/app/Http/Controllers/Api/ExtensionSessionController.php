<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExtensionSessionResource;
use App\Models\ExtensionSession;
use App\Services\ActivityLogService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExtensionSessionController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ActivityLogService $activityLogService) {}

    public function index(Request $request): JsonResponse
    {
        $items = ExtensionSession::query()
            ->with('creator:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('topic', 'like', '%'.$search.'%')
                        ->orWhere('location', 'like', '%'.$search.'%')
                        ->orWhere('instructor', 'like', '%'.$search.'%')
                        ->orWhere('notes', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->when($request->filled('location') && $request->string('location')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('location', $request->string('location'));
            })
            ->orderBy('scheduled_at')
            ->paginate((int) $request->integer('per_page', 50));

        return $this->success(ExtensionSessionResource::collection($items), 'Data penyuluhan berhasil diambil.', 200, [
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

        $extensionSession = ExtensionSession::create([
            ...$payload,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('extension.create', $extensionSession, 'Menambahkan jadwal penyuluhan.');

        return $this->success(new ExtensionSessionResource($extensionSession->load('creator')), 'Jadwal penyuluhan berhasil ditambahkan.', 201);
    }

    public function show(ExtensionSession $extensionSession): JsonResponse
    {
        return $this->success(new ExtensionSessionResource($extensionSession->load('creator')), 'Detail penyuluhan.');
    }

    public function update(Request $request, ExtensionSession $extensionSession): JsonResponse
    {
        $payload = $request->validate($this->rules());

        $extensionSession->update($payload);

        $this->activityLogService->log('extension.update', $extensionSession, 'Memperbarui jadwal penyuluhan.');

        return $this->success(new ExtensionSessionResource($extensionSession->load('creator')), 'Jadwal penyuluhan berhasil diperbarui.');
    }

    public function destroy(ExtensionSession $extensionSession): JsonResponse
    {
        $extensionSession->delete();

        $this->activityLogService->log('extension.delete', $extensionSession, 'Menghapus jadwal penyuluhan.');

        return $this->success(null, 'Jadwal penyuluhan berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'scheduled_at' => ['required', 'date'],
            'topic' => ['required', 'string', 'max:190'],
            'location' => ['required', 'string', 'max:120'],
            'instructor' => ['nullable', 'string', 'max:150'],
            'registered_participants' => ['required', 'integer', 'min:0'],
            'attended_participants' => ['required', 'integer', 'min:0'],
            'materials_count' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
