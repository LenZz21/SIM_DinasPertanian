<?php

namespace App\Http\Controllers\Api;

use App\Exports\HarvestReportExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\HarvestResource;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ReportService $reportService
    ) {}

    public function preview(Request $request): JsonResponse
    {
        $dateFrom = $request->string('date_from')->toString() ?: null;
        $dateTo = $request->string('date_to')->toString() ?: null;

        $data = $this->reportService->harvestData($dateFrom, $dateTo);

        return $this->success([
            'items' => HarvestResource::collection($data),
            'summary' => $this->reportService->summary($dateFrom, $dateTo),
        ], 'Preview laporan berhasil diambil.');
    }

    public function exportExcel(Request $request)
    {
        $dateFrom = $request->string('date_from')->toString() ?: null;
        $dateTo = $request->string('date_to')->toString() ?: null;
        $fileName = 'laporan-hasil-pertanian-'.now()->format('YmdHis').'.xlsx';

        return Excel::download(new HarvestReportExport($dateFrom, $dateTo), $fileName);
    }

    public function exportPdf(Request $request)
    {
        $dateFrom = $request->string('date_from')->toString() ?: null;
        $dateTo = $request->string('date_to')->toString() ?: null;

        $rows = $this->reportService->harvestData($dateFrom, $dateTo);
        $summary = $this->reportService->summary($dateFrom, $dateTo);

        $pdf = Pdf::loadView('reports.harvest', [
            'rows' => $rows,
            'summary' => $summary,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('laporan-hasil-pertanian-'.now()->format('YmdHis').'.pdf');
    }
}
