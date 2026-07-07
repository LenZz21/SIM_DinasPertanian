<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryAlbumResource;
use App\Models\GalleryAlbum;
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
        $items = GalleryAlbum::query()
            ->with('uploader:id,name')
            ->with(['photos' => fn ($query) => $query->latest()])
            ->withCount('photos')
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

        return $this->success(GalleryAlbumResource::collection($items), 'Data album galeri berhasil diambil.', 200, [
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
            'taken_at' => ['nullable', 'date'],
        ]);

        $album = GalleryAlbum::create([
            'title' => $payload['title'],
            'description' => $payload['description'] ?? null,
            'category' => $payload['category'],
            'taken_at' => $payload['taken_at'] ?? null,
            'uploaded_by' => auth('api')->id(),
        ]);

        $this->activityLogService->log('gallery.create', $album, 'Menambahkan album galeri.');

        return $this->success(new GalleryAlbumResource($album->load(['uploader', 'photos'])->loadCount('photos')), 'Album galeri berhasil ditambahkan.', 201);
    }

    public function show(GalleryAlbum $gallery): JsonResponse
    {
        return $this->success(new GalleryAlbumResource($gallery->load(['uploader', 'photos'])->loadCount('photos')), 'Detail album galeri.');
    }

    public function update(Request $request, GalleryAlbum $gallery): JsonResponse
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:190'],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'required', 'string', 'max:80'],
            'taken_at' => ['nullable', 'date'],
        ]);

        $gallery->update([
            'title' => $payload['title'] ?? $gallery->title,
            'description' => array_key_exists('description', $payload) ? $payload['description'] : $gallery->description,
            'category' => $payload['category'] ?? $gallery->category,
            'taken_at' => array_key_exists('taken_at', $payload) ? $payload['taken_at'] : $gallery->taken_at,
        ]);

        $gallery->photos()->update([
            'title' => $gallery->title,
            'description' => $gallery->description,
            'category' => $gallery->category,
            'taken_at' => $gallery->taken_at,
        ]);

        $this->activityLogService->log('gallery.update', $gallery, 'Memperbarui album galeri.');

        return $this->success(new GalleryAlbumResource($gallery->load(['uploader', 'photos'])->loadCount('photos')), 'Album galeri berhasil diperbarui.');
    }

    public function storePhotos(Request $request, GalleryAlbum $gallery): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['required', 'image', 'max:4096'],
        ]);

        foreach ($request->file('images', []) as $image) {
            $gallery->photos()->create([
                'title' => $gallery->title,
                'description' => $gallery->description,
                'category' => $gallery->category,
                'image_path' => $this->fileUploadService->upload($image, 'gallery'),
                'taken_at' => $gallery->taken_at,
                'uploaded_by' => auth('api')->id(),
            ]);
        }

        return $this->success(new GalleryAlbumResource($gallery->load(['uploader', 'photos'])->loadCount('photos')), 'Foto album berhasil ditambahkan.');
    }

    public function destroy(GalleryAlbum $gallery): JsonResponse
    {
        foreach ($gallery->photos as $photo) {
            $this->fileUploadService->delete($photo->image_path);
        }

        $gallery->delete();

        $this->activityLogService->log('gallery.delete', $gallery, 'Menghapus album galeri.');

        return $this->success(null, 'Album galeri berhasil dihapus.');
    }

    public function destroyPhoto(GalleryItem $photo): JsonResponse
    {
        $this->fileUploadService->delete($photo->image_path);
        $photo->delete();

        return $this->success(null, 'Foto album berhasil dihapus.');
    }
}
