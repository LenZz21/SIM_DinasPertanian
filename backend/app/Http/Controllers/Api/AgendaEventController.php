<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgendaEventResource;
use App\Models\AgendaEvent;
use App\Services\ActivityLogService;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaEventController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ActivityLogService $activityLogService,
        private readonly FileUploadService $fileUploadService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = AgendaEvent::query()
            ->with('creator:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', '%'.$search.'%')
                        ->orWhere('summary', 'like', '%'.$search.'%')
                        ->orWhere('location', 'like', '%'.$search.'%')
                        ->orWhere('category', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->when($request->filled('category') && $request->string('category')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->orderBy('starts_at')
            ->paginate((int) $request->integer('per_page', 50));

        return $this->success(AgendaEventResource::collection($items), 'Data agenda berhasil diambil.', 200, [
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
        $imagePath = $this->fileUploadService->upload($request->file('image'), 'agenda');

        unset($payload['image']);

        $agendaEvent = AgendaEvent::create([
            ...$payload,
            'image_path' => $imagePath,
            'created_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('agenda.create', $agendaEvent, 'Menambahkan agenda.');

        return $this->success(new AgendaEventResource($agendaEvent->load('creator')), 'Agenda berhasil ditambahkan.', 201);
    }

    public function show(AgendaEvent $agendaEvent): JsonResponse
    {
        return $this->success(new AgendaEventResource($agendaEvent->load('creator')), 'Detail agenda.');
    }

    public function update(Request $request, AgendaEvent $agendaEvent): JsonResponse
    {
        $payload = $request->validate($this->rules());
        $imagePath = $this->fileUploadService->replace($request->file('image'), $agendaEvent->image_path, 'agenda');

        unset($payload['image']);

        $agendaEvent->update([
            ...$payload,
            'image_path' => $imagePath,
        ]);

        $this->activityLogService->log('agenda.update', $agendaEvent, 'Memperbarui agenda.');

        return $this->success(new AgendaEventResource($agendaEvent->load('creator')), 'Agenda berhasil diperbarui.');
    }

    public function destroy(AgendaEvent $agendaEvent): JsonResponse
    {
        $this->fileUploadService->delete($agendaEvent->image_path);
        $agendaEvent->delete();

        $this->activityLogService->log('agenda.delete', $agendaEvent, 'Menghapus agenda.');

        return $this->success(null, 'Agenda berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:190'],
            'summary' => ['nullable', 'string'],
            'location' => ['required', 'string', 'max:160'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'category' => ['required', 'string', 'max:80'],
            'image' => ['nullable', 'image', 'max:4096'],
            'status' => ['required', 'string', 'max:80'],
        ];
    }
}
