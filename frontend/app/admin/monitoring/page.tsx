"use client";

import { Activity, BarChart3, CalendarDays, Leaf, Loader2, MapPinned, RefreshCw, TrendingUp, Wheat } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard } from "@/lib/api/dashboard";
import type { DashboardPayload } from "@/lib/types/api";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#fb923c", "#8b5cf6", "#64748b"];
const years = [2024, 2025, 2026];

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

function formatActivityDate(value?: string | null) {
  if (!value) return "Baru saja";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MonitoringPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  const monthlyData = useMemo(() => {
    const byMonth = new Map((data?.statistics.monthly ?? []).map((item) => [item.month, item.total]));

    return monthLabels.map((label, index) => ({
      month: label,
      total: Number(byMonth.get(index + 1) ?? 0),
    }));
  }, [data]);

  const cropData = useMemo(
    () =>
      (data?.statistics.crop_distribution ?? []).map((item, index) => ({
        ...item,
        color: chartColors[index % chartColors.length],
      })),
    [data],
  );

  const maxRegionTotal = useMemo(
    () => Math.max(...(data?.statistics.region_heatmap ?? []).map((item) => Number(item.total)), 1),
    [data],
  );

  const stats = useMemo(() => {
    const totalHarvest = data?.totals.total_hasil_panen ?? 0;
    const currentMonth = data?.totals.hasil_panen_bulan_ini ?? 0;
    const topCrop = cropData[0]?.crop_type ?? "-";
    const topRegion = data?.statistics.region_heatmap[0]?.region ?? "-";

    return [
      { label: "Total Produksi", value: `${formatNumber(totalHarvest)} Ton`, icon: Wheat, className: "bg-emerald-50 text-emerald-700" },
      { label: "Bulan Ini", value: `${formatNumber(currentMonth)} Ton`, icon: CalendarDays, className: "bg-blue-50 text-blue-700" },
      { label: "Komoditas Utama", value: topCrop, icon: Leaf, className: "bg-amber-50 text-amber-700" },
      { label: "Wilayah Teratas", value: topRegion, icon: MapPinned, className: "bg-rose-50 text-rose-700" },
    ];
  }, [cropData, data]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getDashboard(selectedYear);
      setData(response.data);
    } catch (error: unknown) {
      setData(null);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/monitoring";
        return;
      }

      toast.error(message ?? "Data monitoring belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Activity className="h-3.5 w-3.5" />
            Analytics Produksi Pertanian
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Monitoring Produksi</h1>
          <p className="text-sm text-[#66766e]">Dashboard analytics interaktif, distribusi komoditas, dan heatmap wilayah pertanian.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                Tahun {year}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={loadData} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

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
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Produksi Bulanan</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Akumulasi hasil panen per bulan pada tahun {selectedYear}.</p>
              </div>
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Realtime
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[360px] w-full rounded-xl" />
            ) : (
              <div className="h-[360px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ left: 6, right: 16, top: 12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="monitoringHarvest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e7eee9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64756d", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64756d", fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${formatNumber(Number(value))} Ton`, "Produksi"]}
                      contentStyle={{ borderRadius: 12, borderColor: "#dce9e2" }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fill="url(#monitoringHarvest)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pie Komoditas</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Distribusi hasil panen berdasarkan jenis tanaman.</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[360px] w-full rounded-xl" />
            ) : cropData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[250px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={cropData} dataKey="total" nameKey="crop_type" innerRadius={58} outerRadius={92} paddingAngle={3}>
                        {cropData.map((item) => (
                          <Cell key={item.crop_type} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${formatNumber(Number(value))} Ton`, "Total"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-2">
                  {cropData.map((item) => (
                    <div key={item.crop_type} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-[#52645a]">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.crop_type}
                      </span>
                      <span className="font-semibold text-[#17231d]">{formatNumber(Number(item.total))} Ton</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
                <Leaf className="mb-3 h-10 w-10 text-emerald-600" />
                <p className="font-semibold text-[#17231d]">Belum ada data komoditas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Heatmap Wilayah Pertanian</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Peringkat wilayah berdasarkan total produksi panen.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)
            ) : data?.statistics.region_heatmap.length ? (
              data.statistics.region_heatmap.map((item, index) => {
                const total = Number(item.total);
                const percentage = Math.max(6, Math.round((total / maxRegionTotal) * 100));

                return (
                  <div key={item.region} className="space-y-1.5">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium text-[#17231d]">
                        {index + 1}. {item.region}
                      </span>
                      <span className="font-semibold text-[#17231d]">{formatNumber(total)} Ton</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#edf4ef]">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
                <MapPinned className="mb-3 h-10 w-10 text-emerald-600" />
                <p className="font-semibold text-[#17231d]">Belum ada data wilayah</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Aktivitas Produksi</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Log terbaru dari modul panen dan data pertanian.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)
            ) : data?.latest_activities.length ? (
              data.latest_activities.slice(0, 6).map((item) => (
                <div key={item.id} className="rounded-xl border border-[#e5ece8] bg-[#f8fbf9] p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-emerald-50 p-2 text-emerald-700">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#17231d]">{item.user}</p>
                      <p className="mt-0.5 text-xs text-[#52645a]">{item.description ?? item.action}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatActivityDate(item.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
                <Activity className="mb-3 h-10 w-10 text-emerald-600" />
                <p className="font-semibold text-[#17231d]">Belum ada aktivitas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
