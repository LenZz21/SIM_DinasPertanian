<?php

namespace Database\Seeders;

use App\Models\EmployeeRecord;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrganizationEmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::query()->where('email', 'admin@gmail.com')->value('id');

        $employees = [
            ['kepala-dinas', 'Kepala Dinas', 'FRANKY NANTINGKASEH, S.Pi', 'Pimpinan', 'Pimpinan', 'NIP. 19751104 200212 1 004'],
            ['sekretaris', 'Sekretaris', 'Ir. Dj. RUMOUW, MSi', 'Sekretariat', 'Pimpinan', 'NIP. 19690829 200003 1 003'],
            ['subbag-umum-hukum-kepegawaian', 'Sub Bagian Umum, Hukum dan Kepegawaian', 'CHRISYE A. LIMPONG, SP', 'Sekretariat', 'Staf Administrasi', 'NIP. 19790829 201001 2 006'],
            ['analis-keuangan', 'Analis Keuangan Pusat dan Daerah Ahli Muda', 'PATRINA A. UADA, SST', 'Sekretariat', 'Staf Administrasi', 'NIP. 19730221 199403 2 003'],
            ['bidang-tph', 'Bidang Tanaman Pangan dan Hortikultura', 'ELLEN LOMBONBITUNG, SP.MSi', 'Bidang Tanaman Pangan dan Hortikultura', 'Pimpinan', 'NIP. 19740711 200003 2 003'],
            ['tph-pengawas-benih', 'Ahli Muda Pengawas Benih Tanaman', 'SILA P. UBATTA, SST', 'Bidang Tanaman Pangan dan Hortikultura', 'Petugas Lapangan', 'NIP. 19790515 200801 1 022'],
            ['tph-pengendali-opt', 'Ahli Muda Pengendali Organisme Pengganggu Tumbuhan', 'PAULUS SASIANG, SP', 'Bidang Tanaman Pangan dan Hortikultura', 'Petugas Lapangan', 'NIP. 19730525 200701 1 032'],
            ['bidang-peternakan', 'Bidang Peternakan', 'JUS CHARLES ONTHONI, SP', 'Bidang Peternakan', 'Pimpinan', 'NIP. 19720501 199803 1 011'],
            ['peternakan-pemasaran-pakan', 'Ahli Muda Pemasaran dan Pakan Ternak', '', 'Bidang Peternakan', 'Petugas Lapangan', null],
            ['peternakan-medik-veteriner', 'Ahli Muda Medik Veteriner', '', 'Bidang Peternakan', 'Petugas Lapangan', null],
            ['bidang-perkebunan', 'Bidang Perkebunan', 'NOOVRY D.J. RINDENGAN, STP', 'Bidang Perkebunan', 'Pimpinan', 'NIP. 19701129 200012 1 001'],
            ['perkebunan-analis-pasar', 'Ahli Muda Analis Pasar', 'HESKIA HORMAN, S.Hut', 'Bidang Perkebunan', 'Petugas Lapangan', 'NIP. 19690414 199803 1 006'],
            ['perkebunan-pengendali-opt', 'Ahli Muda Pengendali Organisme Pengganggu Tumbuhan', 'SITTI S. TAMPILANG, SP', 'Bidang Perkebunan', 'Petugas Lapangan', 'NIP. 19800807 200604 2 032'],
            ['bidang-penyuluhan', 'Bidang Penyuluhan', 'FIBRIANTI J. PADANG, SP', 'Bidang Penyuluhan', 'Penyuluh', 'NIP. 19820213 200604 2 022'],
            ['penyuluhan-ahli-muda-1', 'Ahli Muda Penyuluh Pertanian', '', 'Bidang Penyuluhan', 'Penyuluh', null],
            ['penyuluhan-ahli-muda-2', 'Ahli Muda Penyuluh Pertanian', 'JETRO MANENGGEK, SP', 'Bidang Penyuluhan', 'Penyuluh', 'NIP. 19731130 200801 1 012'],
            ['upt', 'Unit Pelaksana Teknis', 'LEXIE RAMBITAN, S.IP.SP', 'Unit Pelaksana Teknis', 'Pimpinan', 'NIP. 19650307 199305 1 001'],
        ];

        foreach ($employees as [$structureKey, $position, $name, $unit, $category, $nip]) {
            $employee = EmployeeRecord::query()
                ->where('structure_key', $structureKey)
                ->orWhere(function ($query) use ($position, $name, $unit) {
                    $query
                        ->whereNull('structure_key')
                        ->where('position', $position)
                        ->where('name', $name ?: $position)
                        ->where('unit', $unit);
                })
                ->first();

            if (! $employee) {
                $employee = new EmployeeRecord([
                    'position' => $position,
                    'name' => $name ?: $position,
                    'unit' => $unit,
                    'category' => $category,
                    'status' => 'Aktif',
                    'phone' => null,
                    'email' => null,
                    'joined_at' => null,
                    'notes' => $nip,
                    'created_by' => $adminId,
                ]);
            }

            $employee->forceFill([
                'structure_key' => $structureKey,
                'unit' => $unit,
                'category' => $category,
                'status' => $employee->status ?: 'Aktif',
                'notes' => $employee->notes ?: $nip,
                'created_by' => $employee->created_by ?: $adminId,
            ])->save();
        }
    }
}
