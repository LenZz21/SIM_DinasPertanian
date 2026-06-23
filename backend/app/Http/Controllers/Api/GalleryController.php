<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Services\ActivityLogService;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly FileUploadService $fileUploadService,
        private readonly ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = GalleryItem::query()
            ->with('uploader:id,name')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->when($request->filled('category') && $request->string('category')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 24));

        return $this->success(GalleryItemResource::collection($items), 'Data galeri berhasil diambil.', 200, [
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
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:190'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:80'],
            'image' => ['required', 'image', 'max:4096'],
            'taken_at' => ['nullable', 'date'],
        ]);

        $imagePath = $this->fileUploadService->upload($request->file('image'), 'gallery');

        $galleryItem = GalleryItem::create([
            'title' => $payload['title'],
            'description' => $payload['description'] ?? null,
            'category' => $payload['category'],
            'image_path' => $imagePath,
            'taken_at' => $payload['taken_at'] ?? null,
            'uploaded_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('gallery.create', $galleryItem, 'Menambahkan dokumentasi galeri.');

        return $this->success(new GalleryItemResource($galleryItem->load('uploader')), 'Dokumentasi galeri berhasil ditambahkan.', 201);
    }

    public function show(GalleryItem $gallery): JsonResponse
    {
        return $this->success(new GalleryItemResource($gallery->load('uploader')), 'Detail galeri.');
    }

    public function update(Request $request, GalleryItem $gallery): JsonResponse
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:190'],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'required', 'string', 'max:80'],
            'image' => ['nullable', 'image', 'max:4096'],
            'taken_at' => ['nullable', 'date'],
        ]);

        $imagePath = $this->fileUploadService->replace($request->file('image'), $gallery->image_path, 'gallery');

        $gallery->update([
            'title' => $payload['title'] ?? $gallery->title,
            'description' => array_key_exists('description', $payload) ? $payload['description'] : $gallery->description,
            'category' => $payload['category'] ?? $gallery->category,
            'image_path' => $imagePath,
            'taken_at' => array_key_exists('taken_at', $payload) ? $payload['taken_at'] : $gallery->taken_at,
        ]);

        $this->activityLogService->log('gallery.update', $gallery, 'Memperbarui dokumentasi galeri.');

        return $this->success(new GalleryItemResource($gallery->load('uploader')), 'Dokumentasi galeri berhasil diperbarui.');
    }

    public function destroy(GalleryItem $gallery): JsonResponse
    {
        $this->fileUploadService->delete($gallery->image_path);
        $gallery->delete();

        $this->activityLogService->log('gallery.delete', $gallery, 'Menghapus dokumentasi galeri.');

        return $this->success(null, 'Dokumentasi galeri berhasil dihapus.');
    }
}
