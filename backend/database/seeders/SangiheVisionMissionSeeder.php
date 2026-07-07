<?php

namespace Database\Seeders;

use App\Models\DepartmentProfile;
use Illuminate\Database\Seeder;

class SangiheVisionMissionSeeder extends Seeder
{
    public function run(): void
    {
        $profile = DepartmentProfile::query()
            ->where('is_active', true)
            ->latest()
            ->first();

        if (! $profile) {
            $profile = new DepartmentProfile([
                'overview' => 'Dinas Pertanian Daerah Kabupaten Kepulauan Sangihe mendukung arah pembangunan daerah melalui pelayanan, pendampingan, dan penguatan sektor pertanian.',
                'is_active' => true,
            ]);
        }

        $profile->fill([
            'vision' => 'Muda Berkarya, Wujudkan Sangihe Lebih Sejahtera dan Berbudaya.',
            'missions' => [
                'Reformasi birokrasi diutamakan pengembangan kapasitas SDM aparatur, restrukturisasi organisasi, tata kelola pemerintahan, serta upaya pembentukan daerah otonomi baru.',
                'Mendorong pemenuhan kebutuhan dasar penduduk.',
                'Mengakselerasi pengembangan sektor-sektor unggulan guna memantapkan perekonomian rakyat, yang diutamakan pada sektor: perkebunan, perikanan, pariwisata, dan UMKM.',
                'Mengembangkan prioritas pelayanan sosial dasar penduduk khususnya sektor kesehatan, pendidikan, dan ketenagakerjaan.',
                'Memperteguh tatanan sosial masyarakat yang berbudaya dan religius dengan mengedepankan kearifan lokal.',
                'Mewujudkan pengelolaan sumber daya alam strategis yang menjamin kelestarian lingkungan hidup, serta meningkatkan kemampuan terhadap mitigasi bencana.',
                'Menyiapkan Sangihe Muda guna meraih bonus demografi menuju Indonesia Emas 2045.',
            ],
            'main_duty' => 'Membantu Bupati melaksanakan urusan Pemerintahan di bidang pertanian yang menjadi kewenangan Daerah dan Tugas Pembantuan yang diberikan kepada kabupaten di bidang Pertanian.',
            'functions' => [
                'Perumusan kebijakan teknis di bidang Pertanian;',
                'Pelaksanaan kebijakan di bidang Pertanian;',
                'Pelaksanaan evaluasi dan pelaporan di bidang Tanaman Pangan, Peternakan, Perkebunan dan Penyuluhan;',
                'Pelaksanaan administrasi dinas di bidang pertanian; dan',
                'Pelaksanaan fungsi lain yang diberikan oleh atasan terkait dengan tugas dan fungsinya.',
            ],
            'is_active' => true,
        ])->save();
    }
}
