<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\News\StoreNewsRequest;
use App\Http\Requests\News\UpdateNewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Services\ActivityLogService;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly FileUploadService $fileUploadService,
        private readonly ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $news = News::query()
            ->with('author:id,name')
            ->withCount('comments')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('title', 'like', '%'.$request->string('search').'%');
            })
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return $this->success(NewsResource::collection($news), 'Data berita berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'per_page' => $news->perPage(),
                'total' => $news->total(),
            ],
        ]);
    }

    public function store(StoreNewsRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $imagePath = $this->fileUploadService->upload($request->file('image'), 'news');

        $news = News::create([
            'title' => $payload['title'],
            'slug' => Str::slug($payload['title']).'-'.Str::random(6),
            'category' => $payload['category'] ?? 'Berita',
            'excerpt' => $payload['excerpt'] ?? null,
            'content' => $payload['content'],
            'image_path' => $imagePath,
            'is_published' => $payload['is_published'] ?? false,
            'published_at' => ($payload['is_published'] ?? false) ? ($payload['published_at'] ?? now()) : null,
            'author_id' => auth('api')->id(),
        ]);

        $this->activityLogService->log('news.create', $news, 'Menambahkan berita pertanian.');

        return $this->success(new NewsResource($news->load('author')), 'Berita berhasil ditambahkan.', 201);
    }

    public function show(News $berita): JsonResponse
    {
        return $this->success(new NewsResource($berita->load('author')), 'Detail berita.');
    }

    public function update(UpdateNewsRequest $request, News $berita): JsonResponse
    {
        $payload = $request->validated();
        $imagePath = $this->fileUploadService->replace($request->file('image'), $berita->image_path, 'news');

        $berita->update([
            'title' => $payload['title'] ?? $berita->title,
            'slug' => isset($payload['title']) ? Str::slug($payload['title']).'-'.Str::random(6) : $berita->slug,
            'category' => $payload['category'] ?? $berita->category,
            'excerpt' => $payload['excerpt'] ?? $berita->excerpt,
            'content' => $payload['content'] ?? $berita->content,
            'image_path' => $imagePath,
            'is_published' => $payload['is_published'] ?? $berita->is_published,
            'published_at' => ($payload['is_published'] ?? $berita->is_published) ? ($payload['published_at'] ?? $berita->published_at ?? now()) : null,
        ]);

        $this->activityLogService->log('news.update', $berita, 'Memperbarui berita pertanian.');

        return $this->success(new NewsResource($berita->load('author')), 'Berita berhasil diperbarui.');
    }

    public function destroy(News $berita): JsonResponse
    {
        $this->fileUploadService->delete($berita->image_path);
        $berita->delete();

        $this->activityLogService->log('news.delete', $berita, 'Menghapus berita pertanian.');

        return $this->success(null, 'Berita berhasil dihapus.');
    }
}
