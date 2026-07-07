<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DepartmentProfile;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly FileUploadService $fileUploadService
    ) {}

    public function show(): JsonResponse
    {
        return $this->success($this->profile(), 'Profil dinas berhasil diambil.');
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'overview' => ['required', 'string', 'min:10'],
            'vision' => ['required', 'string', 'min:10'],
            'missions' => ['required', 'array', 'min:1'],
            'missions.*' => ['required', 'string', 'min:3'],
            'main_duty' => ['required', 'string', 'min:10'],
            'functions' => ['required', 'array', 'min:1'],
            'functions.*' => ['required', 'string', 'min:3'],
            'hero_image_1' => ['nullable', 'image', 'max:4096'],
            'hero_image_2' => ['nullable', 'image', 'max:4096'],
            'hero_image_3' => ['nullable', 'image', 'max:4096'],
            'active_hero_image_index' => ['nullable', 'integer', 'min:1', 'max:3'],
        ]);

        $profile = $this->profile();
        $heroImagePath = $this->fileUploadService->replace($request->file('hero_image_1'), $profile->hero_image_path, 'department-profile');
        $heroImagePath2 = $this->fileUploadService->replace($request->file('hero_image_2'), $profile->hero_image_path_2, 'department-profile');
        $heroImagePath3 = $this->fileUploadService->replace($request->file('hero_image_3'), $profile->hero_image_path_3, 'department-profile');

        $profile->update([
            'overview' => $payload['overview'],
            'vision' => $payload['vision'],
            'missions' => array_values($payload['missions']),
            'main_duty' => $payload['main_duty'],
            'functions' => array_values($payload['functions']),
            'hero_image_path' => $heroImagePath,
            'hero_image_path_2' => $heroImagePath2,
            'hero_image_path_3' => $heroImagePath3,
            'active_hero_image_index' => (int) ($payload['active_hero_image_index'] ?? $profile->active_hero_image_index ?? 1),
            'is_active' => true,
        ]);

        return $this->success($profile->fresh(), 'Profil dinas berhasil diperbarui.');
    }

    private function profile(): DepartmentProfile
    {
        $profile = DepartmentProfile::query()
            ->where('is_active', true)
            ->latest()
            ->first();

        if ($profile) {
            return $profile;
        }

        return DepartmentProfile::create([
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
            'active_hero_image_index' => 1,
            'is_active' => true,
        ]);
    }
}
