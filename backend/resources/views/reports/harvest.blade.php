<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Hasil Pertanian</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .meta { margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background: #f3f4f6; }
        .summary { margin-top: 14px; }
    </style>
</head>
<body>
    <div class="title">Laporan Hasil Pertanian</div>
    <div class="meta">
        Periode:
        {{ $dateFrom ?? '-' }} s/d {{ $dateTo ?? '-' }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Mitra</th>
                <th>Wilayah</th>
                <th>Jenis Tanaman</th>
                <th>Jumlah Panen</th>
                <th>Lokasi</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>{{ optional($row->harvested_at)->format('Y-m-d') }}</td>
                    <td>{{ $row->partnerFarmer?->name }}</td>
                    <td>{{ $row->partnerFarmer?->region }}</td>
                    <td>{{ $row->crop_type }}</td>
                    <td>{{ number_format((float) $row->harvest_amount, 2, ',', '.') }}</td>
                    <td>{{ $row->location }}</td>
                    <td>{{ $row->notes }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <strong>Ringkasan:</strong><br>
        Total Data: {{ $summary['total_data'] ?? 0 }}<br>
        Total Panen: {{ number_format((float) ($summary['total_panen'] ?? 0), 2, ',', '.') }}<br>
        Rata-rata Panen: {{ number_format((float) ($summary['rata_rata_panen'] ?? 0), 2, ',', '.') }}
    </div>
</body>
</html>
