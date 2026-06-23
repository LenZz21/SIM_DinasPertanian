<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsCommentResource;
use App\Http\Resources\NewsResource;
use App\Models\Harvest;
use App\Models\News;
use App\Models\PartnerFarmer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    use ApiResponse;

    public function stats(): JsonResponse
    {
        $monthly = Harvest::query()
            ->selectRaw('MONTH(harvested_at) as month, SUM(harvest_amount) as total')
            ->whereYear('harvested_at', now()->year)
            ->groupBy(DB::raw('MONTH(harvested_at)'))
            ->orderBy(DB::raw('MONTH(harvested_at)'))
            ->get();

        return $this->success([
            'total_mitra' => PartnerFarmer::count(),
            'total_panen' => (float) Harvest::sum('harvest_amount'),
            'monthly' => $monthly,
        ], 'Statistik publik berhasil diambil.');
    }

    public function news(Request $request): JsonResponse
    {
        $items = News::query()
            ->where('is_published', true)
            ->withCount(['comments' => fn ($query) => $query->where('is_approved', true)])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('title', 'like', '%'.$request->string('search').'%');
            })
            ->latest('published_at')
            ->paginate((int) $request->integer('per_page', 6));

        return $this->success(NewsResource::collection($items), 'Berita publik berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function newsDetail(News $news): JsonResponse
    {
        abort_unless($news->is_published, 404);

        $news->load([
            'author',
            'comments' => fn ($query) => $query
                ->where('is_approved', true)
                ->latest()
                ->limit(25),
        ]);
        $news->loadCount(['comments' => fn ($query) => $query->where('is_approved', true)]);

        return $this->success(new NewsResource($news), 'Detail berita publik.');
    }

    public function storeNewsComment(Request $request, News $news): JsonResponse
    {
        abort_unless($news->is_published, 404);

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'content' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        $comment = $news->comments()->create([
            'name' => $payload['name'],
            'email' => $payload['email'] ?? null,
            'content' => $payload['content'],
            'is_approved' => true,
        ]);

        return $this->success(new NewsCommentResource($comment), 'Komentar berhasil dikirim.', 201);
    }
}
