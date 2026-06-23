"use client";

import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Wheat,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadReportExcel, downloadReportPdf, getReportPreview, type ReportParams } from "@/lib/api/report";

type PreviewData = {
  items: Array<{
    id: number;
    partner_farmer: { name: string; region?: string | null };
    crop_type: string;
    harvest_amount: number;
    harvested_at: string;
    location: string;
  }>;
  summary: {
    total_data: number;
    total_panen: number;
    rata_rata_panen: number;
  };
};

const sectionLabels: Record<string, string> = {
  preview: "Preview Laporan",
  rekap: "Rekap Panen",
  pdf: "Export PDF",
  excel: "Export Excel",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function LaporanPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("preview");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  const params = useMemo<ReportParams>(
    () => ({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [dateFrom, dateTo],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = preview?.items ?? [];

    if (!query) return items;

    return items.filter((item) =>
      [item.partner_farmer.name, item.crop_type, item.location, item.partner_farmer.region ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [preview, search]);

  const cropRecap = useMemo(() => {
    const recap = new Map<string, number>();

    filteredItems.forEach((item) => {
      recap.set(item.crop_type, (recap.get(item.crop_type) ?? 0) + Number(item.harvest_amount));
    });

    return Array.from(recap.entries())
      .map(([crop, total]) => ({ crop, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredItems]);

  const locationRecap = useMemo(() => {
    const recap = new Map<string, number>();

    filteredItems.forEach((item) => {
      recap.set(item.location, (recap.get(item.location) ?? 0) + Number(item.harvest_amount));
    });

    return Array.from(recap.entries())
      .map(([location, total]) => ({ location, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredItems]);

  const stats = useMemo(() => {
    const summary = preview?.summary;

    return [
      { label: "Total Data", value: formatNumber(summary?.total_data ?? 0), icon: FileText, className: "bg-emerald-50 text-emerald-700" },
      { label: "Total Panen", value: `${formatNumber(summary?.total_panen ?? 0)} Ton`, icon: Wheat, className: "bg-blue-50 text-blue-700" },
      { label: "Rata-rata Panen", value: `${formatNumber(summary?.rata_rata_panen ?? 0)} Ton`, icon: BarChart3, className: "bg-amber-50 text-amber-700" },
      { label: "Komoditas", value: `${cropRecap.length} Jenis`, icon: MapPin, className: "bg-rose-50 text-rose-700" },
    ];
  }, [cropRecap.length, preview]);

  const loadPreview = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getReportPreview(params);
      const payload = response.data as { items: unknown; summary: PreviewData["summary"] };
      const normalizedItems = Array.isArray(payload.items)
        ? payload.items
        : (payload.items as { data?: PreviewData["items"] })?.data ?? [];

      setPreview({
        items: normalizedItems as PreviewData["items"],
        summary: payload.summary,
      });
    } catch (error: unknown) {
      setPreview(null);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/laporan";
        return;
      }

      toast.error(message ?? "Preview laporan belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const section = url.searchParams.get("section");
    if (section && sectionLabels[section]) {
      setActiveSection(section);
    }
  }, []);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  async function handleExport(type: "pdf" | "excel") {
    setIsExporting(type);

    try {
      if (type === "pdf") {
        await downloadReportPdf(params);
        toast.success("Laporan PDF berhasil diunduh");
      } else {
        await downloadReportExcel(params);
        toast.success("Laporan Excel berhasil diunduh");
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? `Laporan ${type.toUpperCase()} belum bisa diunduh`);
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <FileText className="h-3.5 w-3.5" />
            {sectionLabels[activeSection] ?? "Laporan & Export"}
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Laporan & Export</h1>
          <p className="text-sm text-[#66766e]">Filter tanggal, preview data panen, rekap komoditas, dan export PDF/Excel.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="accent" onClick={() => handleExport("pdf")} disabled={Boolean(isExporting)} className="gap-2">
            {isExporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Export PDF
          </Button>
          <Button type="button" variant="outline" onClick={() => handleExport("excel")} disabled={Boolean(isExporting)} className="gap-2">
            {isExporting === "excel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-emerald-700" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mitra, komoditas, lokasi..." className="pl-9" />
          </div>
          <Button type="button" variant="outline" onClick={loadPreview} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-[#5f6e67]">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#1b2a22]">{isLoading ? "..." : item.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${item.className}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm xl:col-span-2">
          <CardHeader className="gap-3 pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4 text-emerald-700" />
                Preview Laporan
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Data panen yang akan masuk ke file PDF/Excel sesuai filter tanggal.</p>
            </div>
            <Badge variant="success">{filteredItems.length} Baris</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mitra</TableHead>
                      <TableHead>Jenis Tanaman</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Lokasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-[#17231d]">{item.partner_farmer.name}</div>
                          <div className="text-xs text-muted-foreground">{item.partner_farmer.region ?? "Wilayah belum diisi"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{item.crop_type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatNumber(Number(item.harvest_amount))} Ton</TableCell>
                        <TableCell>{formatDate(item.harvested_at)}</TableCell>
                        <TableCell>{item.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
                <FileText className="mb-3 h-10 w-10 text-emerald-600" />
                <h3 className="font-semibold text-[#17231d]">Tidak ada data laporan</h3>
                <p className="mt-1 text-sm text-muted-foreground">Ubah filter tanggal atau kata kunci untuk melihat data.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rekap Komoditas</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Total panen per jenis tanaman.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-9 w-full" />)
              ) : cropRecap.length > 0 ? (
                cropRecap.slice(0, 6).map((item) => (
                  <div key={item.crop} className="flex items-center justify-between rounded-xl bg-[#f8fbf9] px-3 py-2 text-sm">
                    <span className="font-medium text-[#17231d]">{item.crop}</span>
                    <span className="font-semibold text-emerald-700">{formatNumber(item.total)} Ton</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada rekap komoditas.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rekap Lokasi</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Total panen per wilayah/lokasi.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-9 w-full" />)
              ) : locationRecap.length > 0 ? (
                locationRecap.slice(0, 6).map((item) => (
                  <div key={item.location} className="flex items-center justify-between rounded-xl bg-[#f8fbf9] px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-[#17231d]">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      {item.location}
                    </span>
                    <span className="font-semibold text-emerald-700">{formatNumber(item.total)} Ton</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada rekap lokasi.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Isi Dropdown Export</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-[#52645a]">
              <p><span className="font-semibold text-[#17231d]">Preview Laporan:</span> melihat data sebelum unduh.</p>
              <p><span className="font-semibold text-[#17231d]">Rekap Panen:</span> ringkasan komoditas dan lokasi.</p>
              <p><span className="font-semibold text-[#17231d]">Export PDF:</span> unduh laporan siap cetak.</p>
              <p><span className="font-semibold text-[#17231d]">Export Excel:</span> unduh data untuk olah lanjut.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
