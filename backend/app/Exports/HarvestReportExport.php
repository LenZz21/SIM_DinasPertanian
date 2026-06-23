<?php

namespace App\Exports;

use App\Models\Harvest;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Headings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class HarvestReportExport implements FromCollection, Headings, ShouldAutoSize
{
    public function __construct(
        private readonly ?string $dateFrom = null,
        private readonly ?string $dateTo = null
    ) {}

    public function collection(): Collection
    {
        return Harvest::query()
            ->with('partnerFarmer:id,name,region')
            ->when($this->dateFrom, fn ($query) => $query->whereDate('harvested_at', '>=', $this->dateFrom))
            ->when($this->dateTo, fn ($query) => $query->whereDate('harvested_at', '<=', $this->dateTo))
            ->latest('harvested_at')
            ->get()
            ->map(fn ($harvest) => [
                'Tanggal Panen' => optional($harvest->harvested_at)->format('Y-m-d'),
                'Nama Mitra' => $harvest->partnerFarmer?->name,
                'Wilayah' => $harvest->partnerFarmer?->region,
                'Jenis Tanaman' => $harvest->crop_type,
                'Jumlah Panen' => (float) $harvest->harvest_amount,
                'Lokasi' => $harvest->location,
                'Catatan' => $harvest->notes,
            ]);
    }

    public function headings(): array
    {
        return [
            'Tanggal Panen',
            'Nama Mitra',
            'Wilayah',
            'Jenis Tanaman',
            'Jumlah Panen',
            'Lokasi',
            'Catatan',
        ];
    }
}
