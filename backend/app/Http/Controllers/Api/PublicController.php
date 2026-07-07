<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgendaEventResource;
use App\Http\Resources\EmployeeRecordResource;
use App\Http\Resources\GalleryAlbumResource;
use App\Http\Resources\NewsCommentResource;
use App\Http\Resources\NewsResource;
use App\Models\AgendaEvent;
use App\Models\DepartmentProfile;
use App\Models\GalleryAlbum;
use App\Models\Harvest;
use App\Models\News;
use App\Models\OfficialGreeting;
use App\Models\EmployeeRecord;
use App\Models\PartnerFarmer;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    use ApiResponse;

    public function greeting(): JsonResponse
    {
        $greeting = OfficialGreeting::query()
            ->where('is_active', true)
            ->latest()
            ->first();

        $leader = EmployeeRecord::query()
            ->where('status', 'Aktif')
            ->where('position', 'like', '%Kepala Dinas%')
            ->latest()
            ->first();

        $leader ??= EmployeeRecord::query()
            ->where('status', 'Aktif')
            ->where('category', 'Pimpinan')
            ->latest()
            ->first();

        if (! $greeting && ! $leader) {
            return $this->success(null, 'Sambutan kepala dinas belum tersedia.');
        }

        return $this->success([
            'id' => $greeting?->id ?? 0,
            'name' => $leader?->name ?? $greeting?->name,
            'position' => $leader?->position ?? $greeting?->position,
            'institution' => $greeting?->institution,
            'photo_url' => $this->resolvePublicAssetUrl($leader?->photo_path ?? $greeting?->photo_path),
            'detail_url' => $greeting?->detail_url ?? '/profil/sambutan-kepala-dinas',
            'paragraphs' => $greeting?->paragraphs ?? [],
            'is_active' => (bool) ($greeting?->is_active ?? true),
            'updated_at' => optional($leader?->updated_at ?? $greeting?->updated_at)->toISOString(),
        ], 'Sambutan kepala dinas berhasil diambil.');
    }

    public function profile(): JsonResponse
    {
        $profile = DepartmentProfile::query()
            ->where('is_active', true)
            ->latest()
            ->first();

        return $this->success($profile ?? [
            'id' => 0,
            'overview' => 'Dinas Pertanian Daerah berperan dalam pelayanan, pendampingan, dan penguatan sektor pertanian daerah.',
            'vision' => 'Terwujudnya pertanian daerah yang maju, mandiri, modern, dan berkelanjutan.',
            'missions' => [
                'Meningkatkan pelayanan publik bidang pertanian.',
                'Memperkuat pendampingan petani dan kelompok tani.',
                'Mendorong produksi pertanian yang berkelanjutan.',
            ],
            'main_duty' => 'Membantu Bupati melaksanakan urusan Pemerintahan di bidang pertanian yang menjadi kewenangan Daerah dan Tugas Pembantuan yang diberikan kepada kabupaten di bidang Pertanian.',
            'functions' => [
                'Perumusan kebijakan teknis di bidang Pertanian;',
                'Pelaksanaan kebijakan di bidang Pertanian;',
                'Pelaksanaan evaluasi dan pelaporan di bidang Tanaman Pangan, Peternakan, Perkebunan dan Penyuluhan;',
                'Pelaksanaan administrasi dinas di bidang pertanian; dan',
                'Pelaksanaan fungsi lain yang diberikan oleh atasan terkait dengan tugas dan fungsinya.',
            ],
            'hero_image_url' => null,
            'hero_image_urls' => [null, null, null],
            'active_hero_image_index' => 1,
            'is_active' => true,
            'updated_at' => null,
        ], 'Profil dinas berhasil diambil.');
    }

    private function resolvePublicAssetUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        if (file_exists(public_path($path))) {
            return asset($path);
        }

        if (Storage::disk('public')->exists($path)) {
            return asset('storage/'.$path);
        }

        return null;
    }

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

    public function gallery(Request $request): JsonResponse
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
            ->latest('taken_at')
            ->latest()
            ->paginate((int) $request->integer('per_page', 24));

        return $this->success(GalleryAlbumResource::collection($items), 'Galeri publik berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function employees(Request $request): JsonResponse
    {
        $items = EmployeeRecord::query()
            ->where('status', 'Aktif')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('position', 'like', '%'.$search.'%')
                        ->orWhere('category', 'like', '%'.$search.'%');
                });
            })
            ->orderByRaw("
                CASE
                    WHEN structure_key IS NOT NULL THEN 0
                    WHEN LOWER(position) LIKE '%kepala dinas%' THEN 1
                    WHEN LOWER(position) LIKE '%sekretaris%' THEN 2
                    WHEN LOWER(position) LIKE '%sub bagian%' THEN 3
                    WHEN LOWER(position) LIKE '%analis keuangan%' THEN 4
                    WHEN LOWER(position) LIKE '%bidang%' THEN 5
                    WHEN LOWER(position) LIKE '%unit pelaksana%' THEN 7
                    ELSE 6
                END
            ")
            ->orderByRaw("
                CASE structure_key
                    WHEN 'kepala-dinas' THEN 1
                    WHEN 'sekretaris' THEN 2
                    WHEN 'subbag-umum-hukum-kepegawaian' THEN 3
                    WHEN 'analis-keuangan' THEN 4
                    WHEN 'bidang-tph' THEN 5
                    WHEN 'tph-pengawas-benih' THEN 6
                    WHEN 'tph-pengendali-opt' THEN 7
                    WHEN 'bidang-peternakan' THEN 8
                    WHEN 'peternakan-pemasaran-pakan' THEN 9
                    WHEN 'peternakan-medik-veteriner' THEN 10
                    WHEN 'bidang-perkebunan' THEN 11
                    WHEN 'perkebunan-analis-pasar' THEN 12
                    WHEN 'perkebunan-pengendali-opt' THEN 13
                    WHEN 'bidang-penyuluhan' THEN 14
                    WHEN 'penyuluhan-ahli-muda-1' THEN 15
                    WHEN 'penyuluhan-ahli-muda-2' THEN 16
                    WHEN 'upt' THEN 17
                    ELSE 99
                END
            ")
            ->orderBy('position')
            ->orderBy('name')
            ->paginate((int) $request->integer('per_page', 100));

        return $this->success(EmployeeRecordResource::collection($items), 'Struktur pegawai publik berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function agenda(Request $request): JsonResponse
    {
        $items = AgendaEvent::query()
            ->with('creator:id,name')
            ->when($request->filled('status') && $request->string('status')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->when($request->filled('category') && $request->string('category')->toString() !== 'Semua', function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->where('status', '!=', 'Dibatalkan')
            ->orderBy('starts_at')
            ->paginate((int) $request->integer('per_page', 10));

        return $this->success(AgendaEventResource::collection($items), 'Agenda publik berhasil diambil.', 200, [
            'pagination' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function agendaDetail(string $identifier): JsonResponse
    {
        $id = (int) Str::before($identifier, '-');

        abort_if($id < 1, 404);

        $agenda = AgendaEvent::query()
            ->with('creator:id,name')
            ->where('status', '!=', 'Dibatalkan')
            ->findOrFail($id);

        return $this->success(new AgendaEventResource($agenda), 'Detail agenda publik berhasil diambil.');
    }

    public function news(Request $request): JsonResponse
    {
        $items = News::query()
            ->where('is_published', true)
            ->withCount(['comments' => fn ($query) => $query->where('is_approved', true)])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('title', 'like', '%'.$request->string('search').'%');
            })
            ->latest('updated_at')
            ->latest('published_at')
            ->latest('created_at')
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

    public function recordNewsView(Request $request, News $news): JsonResponse
    {
        abort_unless($news->is_published, 404);

        $viewedOn = now('Asia/Makassar')->toDateString();
        $visitorHash = hash('sha256', implode('|', [
            $request->ip() ?? 'unknown-ip',
            substr($request->userAgent() ?? 'unknown-agent', 0, 500),
        ]));

        $alreadyViewed = DB::table('news_views')
            ->where('news_id', $news->id)
            ->where('viewed_on', $viewedOn)
            ->where('visitor_hash', $visitorHash)
            ->exists();

        if (! $alreadyViewed) {
            DB::table('news_views')->insert([
                'news_id' => $news->id,
                'viewed_on' => $viewedOn,
                'visitor_hash' => $visitorHash,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $news->increment('views_count');
            $news->refresh();
        }

        return $this->success([
            'counted' => ! $alreadyViewed,
            'views_count' => (int) $news->views_count,
        ], $alreadyViewed ? 'Berita sudah dihitung hari ini.' : 'View berita berhasil dihitung.');
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
