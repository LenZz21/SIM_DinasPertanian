"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaArrowUpFromBracket,
  FaCalendarCheck,
  FaCalendarDays,
  FaCaretUp,
  FaChartLine,
  FaCow,
  FaImages,
  FaJar,
  FaMapLocationDot,
  FaNewspaper,
  FaTriangleExclamation,
  FaUsers,
  FaWheatAwn,
} from "react-icons/fa6";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { getDashboard } from "@/lib/api/dashboard";
import { getNotifications } from "@/lib/api/notifications";
import { getPublicNews } from "@/lib/api/public";
import type { DashboardPayload, News, SystemNotification } from "@/lib/types/api";

const months = [
  { short: "Jan", label: "Januari", value: 0 },
  { short: "Feb", label: "Februari", value: 1 },
  { short: "Mar", label: "Maret", value: 2 },
  { short: "Apr", label: "April", value: 3 },
  { short: "Mei", label: "Mei", value: 4 },
  { short: "Jun", label: "Juni", value: 5 },
  { short: "Jul", label: "Juli", value: 6 },
  { short: "Agu", label: "Agustus", value: 7 },
  { short: "Sep", label: "September", value: 8 },
  { short: "Okt", label: "Oktober", value: 9 },
  { short: "Nov", label: "November", value: 10 },
  { short: "Des", label: "Desember", value: 11 },
];

const currentYear = new Date().getFullYear();
const availableYears = Array.from(new Set([2024, 2025, 2026, currentYear])).sort((a, b) => a - b);

const kpis = [
  { icon: FaWheatAwn, iconClass: "text-emerald-600", boxClass: "bg-emerald-50", title: "Total Hasil Panen", value: "12.458", unit: "Ton", trend: "24.5%" },
  { icon: FaUsers, iconClass: "text-teal-600", boxClass: "bg-teal-50", title: "Jumlah Petani", value: "2.845", unit: "Orang", trend: "12.7%" },
  { icon: FaMapLocationDot, iconClass: "text-amber-600", boxClass: "bg-amber-50", title: "Luas Lahan Aktif", value: "3.620", unit: "Ha", trend: "8.3%" },
  { icon: FaCow, iconClass: "text-blue-600", boxClass: "bg-blue-50", title: "Data Ternak", value: "1.248", unit: "Ekor", trend: "15.2%" },
  { icon: FaJar, iconClass: "text-purple-600", boxClass: "bg-purple-50", title: "Stok Pupuk", value: "8.750", unit: "Kg", trend: "10.1%" },
  { icon: FaNewspaper, iconClass: "text-rose-600", boxClass: "bg-rose-50", title: "Laporan Dibuat", value: "156", unit: "Dokumen", trend: "18.3%" },
];

const emptyKpis = kpis.map((item) => ({
  ...item,
  value: "0",
  rawValue: 0,
  trend: "0%",
}));

const productionData = [
  { month: "Jan", monthIndex: 0, hasil: 210, target: 400 },
  { month: "Feb", monthIndex: 1, hasil: 320, target: 400 },
  { month: "Mar", monthIndex: 2, hasil: 250, target: 450 },
  { month: "Apr", monthIndex: 3, hasil: 480, target: 500 },
  { month: "Mei", monthIndex: 4, hasil: 750, target: 650 },
  { month: "Jun", monthIndex: 5, hasil: 680, target: 650 },
  { month: "Jul", monthIndex: 6, hasil: 620, target: 700 },
  { month: "Agu", monthIndex: 7, hasil: 780, target: 700 },
  { month: "Sep", monthIndex: 8, hasil: 890, target: 800 },
  { month: "Okt", monthIndex: 9, hasil: 750, target: 800 },
  { month: "Nov", monthIndex: 10, hasil: 820, target: 850 },
  { month: "Des", monthIndex: 11, hasil: 800, target: 850 },
];

const emptyProductionData = months.map((month) => ({
  month: month.short,
  monthIndex: month.value,
  hasil: 0,
  target: 0,
}));

const pieData = [
  { name: "Padi", value: 35, color: "#10b981" },
  { name: "Jagung", value: 25, color: "#3b82f6" },
  { name: "Sayuran", value: 20, color: "#f59e0b" },
  { name: "Buah", value: 12, color: "#fb923c" },
  { name: "Lainnya", value: 8, color: "#cbd5e1" },
];

const fallbackNotifications = [
  {
    icon: FaArrowUpFromBracket,
    iconWrap: "bg-emerald-50 text-emerald-600",
    title: "Data hasil panen padi berhasil ditambahkan",
    time: "10 menit yang lalu",
    href: "/admin/hasil",
  },
  {
    icon: FaTriangleExclamation,
    iconWrap: "bg-amber-50 text-amber-600",
    title: "Stok pupuk Urea menipis sisa 150 Kg di Gudang Tahuna",
    time: "30 menit yang lalu",
    href: "/admin/data-pupuk",
  },
  {
    icon: FaCalendarCheck,
    iconWrap: "bg-blue-50 text-blue-600",
    title: "Agenda baru Teknologi Tanam Padi Modern",
    time: "2 jam yang lalu",
    href: "/admin/agenda",
  },
  {
    icon: FaChartLine,
    iconWrap: "bg-purple-50 text-purple-600",
    title: "Hasil panen menurun -12% dibanding bulan lalu",
    time: "3 jam yang lalu",
    href: "/admin/monitoring",
  },
];

const quickMenus = [
  { href: "/admin/mitra", title: "Data Mitra", icon: FaUsers, iconClass: "bg-emerald-100 text-emerald-700" },
  { href: "/admin/hasil", title: "Hasil Tani", icon: FaWheatAwn, iconClass: "bg-amber-100 text-amber-700" },
  { href: "/admin/luas-lahan", title: "Luas Lahan", icon: FaMapLocationDot, iconClass: "bg-teal-100 text-teal-700" },
  { href: "/admin/data-ternak", title: "Data Ternak", icon: FaCow, iconClass: "bg-blue-100 text-blue-700" },
  { href: "/admin/data-pupuk", title: "Data Pupuk", icon: FaJar, iconClass: "bg-purple-100 text-purple-700" },
  { href: "/admin/agenda", title: "Agenda", icon: FaCalendarDays, iconClass: "bg-sky-100 text-sky-700" },
  { href: "/admin/berita", title: "Berita", icon: FaNewspaper, iconClass: "bg-rose-100 text-rose-700" },
  { href: "/admin/galeri", title: "Galeri", icon: FaImages, iconClass: "bg-indigo-100 text-indigo-700" },
];

const announcementFallbackImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=70";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function AnimatedNumber({ value, duration = 900 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = Number.isFinite(value) ? value : 0;
    const startTime = performance.now();
    let frameId = 0;

    function animate(currentTime: number) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (endValue - startValue) * easedProgress;

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [duration, value]);

  return <>{formatCompactNumber(displayValue)}</>;
}

function formatRelativeTime(value?: string | null) {
  if (!value) return "Baru saja";

  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;

  const days = Math.floor(hours / 24);
  return `${days} hari yang lalu`;
}

function notificationIcon(type: SystemNotification["type"]) {
  if (type === "success") return { icon: FaArrowUpFromBracket, iconWrap: "bg-emerald-50 text-emerald-600" };
  if (type === "warning") return { icon: FaTriangleExclamation, iconWrap: "bg-amber-50 text-amber-600" };
  if (type === "error") return { icon: FaChartLine, iconWrap: "bg-purple-50 text-purple-600" };
  return { icon: FaCalendarCheck, iconWrap: "bg-blue-50 text-blue-600" };
}

function getInitials(name?: string | null) {
  const words = (name ?? "Sistem").trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getActivityHref(action?: string | null) {
  const normalizedAction = (action ?? "").toLowerCase();

  if (normalizedAction.includes("mitra") || normalizedAction.includes("petani")) return "/admin/mitra";
  if (normalizedAction.includes("hasil") || normalizedAction.includes("panen")) return "/admin/hasil";
  if (normalizedAction.includes("lahan")) return "/admin/luas-lahan";
  if (normalizedAction.includes("ternak")) return "/admin/data-ternak";
  if (normalizedAction.includes("pupuk") || normalizedAction.includes("stok")) return "/admin/data-pupuk";
  if (normalizedAction.includes("agenda") || normalizedAction.includes("penyuluhan") || normalizedAction.includes("jadwal")) return "/admin/agenda";
  if (normalizedAction.includes("berita") || normalizedAction.includes("publikasi")) return "/admin/berita";
  if (normalizedAction.includes("galeri") || normalizedAction.includes("foto")) return "/admin/galeri";
  if (normalizedAction.includes("user") || normalizedAction.includes("pengguna")) return "/admin/pengguna";

  return "/admin/monitoring";
}

function stripHtml(value?: string | null) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getNewsSummary(news?: News | null) {
  const text = stripHtml(news?.excerpt || news?.content);
  if (!text) return "Belum ada ringkasan publikasi. Lengkapi konten berita agar pengumuman tampil informatif.";
  return text.length > 118 ? `${text.slice(0, 118).trim()}...` : text;
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateRange, setDateRange] = useState({ startMonth: 0, endMonth: 4 });
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [dashboardNotifications, setDashboardNotifications] = useState<SystemNotification[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState<News | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const dynamicProductionData = useMemo(() => {
    const monthly = dashboardData?.statistics.monthly ?? [];
    const hasApiData = monthly.some((item) => Number(item.total) > 0);

    if (!dashboardData) return emptyProductionData;
    if (!hasApiData) return emptyProductionData;

    const monthlyMap = new Map(monthly.map((item) => [item.month, Number(item.total)]));

    return months.map((month, index) => {
      const hasil = Number(monthlyMap.get(index + 1) ?? 0);

      return {
        month: month.short,
        monthIndex: month.value,
        hasil,
        target: Math.max(hasil, Math.round(hasil * 1.12)),
      };
    });
  }, [dashboardData]);

  const selectedProductionData = useMemo(
    () => dynamicProductionData.filter((item) => item.monthIndex >= dateRange.startMonth && item.monthIndex <= dateRange.endMonth),
    [dateRange, dynamicProductionData],
  );

  const dynamicPieData = useMemo(() => {
    const distribution = dashboardData?.statistics.crop_distribution ?? [];
    const total = distribution.reduce((sum, item) => sum + Number(item.total), 0);

    if (!dashboardData) return [];
    if (!total) return [];

    return distribution.slice(0, 5).map((item, index) => ({
      name: item.crop_type,
      value: Math.round((Number(item.total) / total) * 100),
      color: pieData[index]?.color ?? "#cbd5e1",
    }));
  }, [dashboardData]);

  const dynamicKpis = useMemo(() => {
    const totals = dashboardData?.totals;

    if (!totals) return emptyKpis;

    return [
      {
        ...kpis[0],
        rawValue: totals.total_hasil_panen,
        value: formatCompactNumber(totals.total_hasil_panen),
      },
      {
        ...kpis[1],
        rawValue: totals.total_mitra,
        value: formatCompactNumber(totals.total_mitra),
      },
      {
        ...kpis[2],
        rawValue: totals.total_luas_lahan_aktif ?? 0,
        value: formatCompactNumber(totals.total_luas_lahan_aktif ?? 0),
      },
      {
        ...kpis[3],
        rawValue: totals.total_ternak ?? 0,
        value: formatCompactNumber(totals.total_ternak ?? 0),
      },
      {
        ...kpis[4],
        rawValue: totals.total_stok_pupuk ?? 0,
        value: formatCompactNumber(totals.total_stok_pupuk ?? 0),
      },
      {
        ...kpis[5],
        rawValue: totals.total_laporan ?? 0,
        value: formatCompactNumber(totals.total_laporan ?? 0),
      },
    ];
  }, [dashboardData]);

  const latestNotifications = useMemo(
    () =>
      dashboardNotifications.slice(0, 4).map((item) => {
      const meta = item.meta ?? {};
      const config = notificationIcon(item.type);

      return {
        ...config,
        title: item.title,
        time: formatRelativeTime(item.created_at),
        href: typeof meta.href === "string" ? meta.href : "/admin/notifikasi",
      };
      }),
    [dashboardNotifications],
  );

  const latestActivities = useMemo(() => {
    const apiActivities = dashboardData?.latest_activities ?? [];

    if (!apiActivities.length) return [];

    return apiActivities.slice(0, 3).map((item) => ({
      name: item.user || "Sistem",
      action: item.description || item.action || "Aktivitas sistem diperbarui",
      time: formatRelativeTime(item.created_at),
      href: getActivityHref(`${item.action} ${item.description}`),
      initials: getInitials(item.user),
    }));
  }, [dashboardData]);

  const periodLabel = useMemo(() => {
    const startMonth = months[dateRange.startMonth].label;
    const endMonth = months[dateRange.endMonth].label;

    if (dateRange.startMonth === dateRange.endMonth) {
      return `${startMonth} ${selectedYear}`;
    }

    return `${startMonth} ${selectedYear} - ${endMonth} ${selectedYear}`;
  }, [dateRange, selectedYear]);

  const compactPeriodLabel = useMemo(() => {
    const startMonth = months[dateRange.startMonth].label;
    const endMonth = months[dateRange.endMonth].label;

    if (dateRange.startMonth === dateRange.endMonth) {
      return `${startMonth} ${selectedYear}`;
    }

    return `${startMonth} - ${endMonth} ${selectedYear}`;
  }, [dateRange, selectedYear]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const [dashboardResponse, notificationResponse] = await Promise.all([
        getDashboard(selectedYear),
        getNotifications({ per_page: 4, status: "Belum Dibaca" }),
      ]);

      setDashboardData(dashboardResponse.data);
      setDashboardNotifications(notificationResponse.data.items);

      try {
        const newsResponse = await getPublicNews();
        setLatestAnnouncement(newsResponse.data[0] ?? null);
      } catch {
        setLatestAnnouncement(null);
      }
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin";
        return;
      }

      toast.error(message ?? "Data dashboard belum bisa dimuat");
    }
  }, [selectedYear]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function updateStartMonth(value: number) {
    setDateRange((currentRange) => ({
      startMonth: value,
      endMonth: Math.max(value, currentRange.endMonth),
    }));
  }

  function updateEndMonth(value: number) {
    setDateRange((currentRange) => ({
      startMonth: Math.min(currentRange.startMonth, value),
      endMonth: value,
    }));
  }

  return (
    <div className="space-y-6 text-xs text-slate-800 lg:text-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-xs text-slate-400">Sistem Informasi Manajemen Dinas Pertanian | Monitoring dan pelaporan data pertanian secara real-time</p>
        </div>
        <div ref={calendarRef} className="relative self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
            className="flex items-center gap-2 rounded-lg bg-[#0a2e1d] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#0f3b27]"
            aria-expanded={isCalendarOpen}
            aria-haspopup="dialog"
          >
            <FaCalendarDays />
            {periodLabel}
          </button>

          {isCalendarOpen ? (
            <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-100 bg-white p-4 text-slate-700 shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Filter Periode</p>
                  <p className="text-[10px] text-slate-400">{compactPeriodLabel}</p>
                </div>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 focus:border-emerald-500 focus:outline-none"
                  aria-label="Pilih tahun"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-[10px] font-semibold uppercase text-slate-400">
                  Bulan Awal
                  <select
                    value={dateRange.startMonth}
                    onChange={(event) => updateStartMonth(Number(event.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium normal-case text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 text-[10px] font-semibold uppercase text-slate-400">
                  Bulan Akhir
                  <select
                    value={dateRange.endMonth}
                    onChange={(event) => updateEndMonth(Number(event.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium normal-case text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {months.map((month) => {
                  const isSelected = month.value >= dateRange.startMonth && month.value <= dateRange.endMonth;

                  return (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => {
                        if (month.value < dateRange.startMonth) {
                          updateStartMonth(month.value);
                        } else {
                          updateEndMonth(month.value);
                        }
                      }}
                      className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                        isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {month.short}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setDateRange({ startMonth: 0, endMonth: 11 })}
                  className="rounded-md px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  Setahun
                </button>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="rounded-md bg-[#0a2e1d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f3b27]"
                >
                  Terapkan
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {dynamicKpis.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className={`rounded-lg p-2 ${item.boxClass}`}>
                  <Icon className={`h-4 w-4 ${item.iconClass}`} />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{item.title}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  <AnimatedNumber value={item.rawValue} />
                </h3>
                <p className="text-[10px] text-slate-400">{item.unit}</p>
                <span className="mt-1 block text-[10px] font-medium text-emerald-500">
                  <FaCaretUp className="mr-0.5 inline" />
                  {item.trend} <span className="text-slate-400">dari periode lalu</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Grafik Produksi Pertanian</h4>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="rounded-md border-0 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 focus:ring-1 focus:ring-slate-300"
              aria-label="Pilih tahun grafik"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  Tahun {year}
                </option>
              ))}
            </select>
          </div>
          <div className="relative h-64">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedProductionData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="hasil" name="Hasil Panen (Ton)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} />
                  <Line type="monotone" dataKey="target" name="Target (Ton)" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3">
          <div>
            <h4 className="mb-1 font-bold text-slate-800">Distribusi Hasil Panen</h4>
            <p className="mb-4 text-[10px] text-slate-400">Periode: {compactPeriodLabel}</p>
          </div>
          <div className="relative flex h-44 items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dynamicPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} stroke="#ffffff" strokeWidth={2}>
                    {dynamicPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            <div className="absolute text-center">
              <p className="text-[10px] font-medium uppercase text-slate-400">Total</p>
              <p className="text-base font-bold leading-tight text-slate-800">
                <AnimatedNumber value={dashboardData?.totals.total_hasil_panen ?? 0} />
              </p>
              <p className="text-[9px] text-slate-400">Ton</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            {dynamicPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>
                  {item.name} <b className="text-slate-700">{item.value}%</b>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Notifikasi Terbaru</h4>
            <Link href="/admin/notifikasi" className="text-xs font-semibold text-emerald-600 hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="flex-1 space-y-3.5 overflow-y-auto">
            {latestNotifications.length ? (
              latestNotifications.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="flex gap-3 rounded-lg p-1 hover:bg-slate-50">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconWrap}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-tight text-slate-700">{item.title}</p>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                </Link>
              );
              })
            ) : (
              <div className="flex h-full min-h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                <p className="text-xs text-slate-400">Tidak ada notifikasi belum dibaca.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-6">
          <h4 className="mb-4 font-bold text-slate-800">Menu Cepat</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickMenus.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full text-sm transition group-hover:scale-105 ${item.iconClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-center text-[10px] font-medium leading-tight text-slate-600">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Aktivitas Terbaru</h4>
            <Link href="/admin/monitoring" className="text-xs font-semibold text-emerald-600 hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="flex-1 space-y-3.5 overflow-y-auto">
            {latestActivities.length ? (
              latestActivities.map((item, index) => (
                <Link key={`${item.name}-${item.action}-${item.time}-${index}`} href={item.href} className="flex items-start gap-2.5 rounded-lg p-1 transition hover:bg-slate-50">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700">
                    {item.initials}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-xs font-semibold text-slate-700">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.action}</p>
                    <span className="mt-0.5 block text-[10px] text-slate-400">{item.time}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex h-full min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
                <p className="text-xs text-slate-400">Belum ada aktivitas terbaru dari sistem.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3">
          <h4 className="mb-3 font-bold text-slate-800">Informasi & Pengumuman</h4>
          {latestAnnouncement ? (
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-100">
              <Image
                src={latestAnnouncement.image_url || announcementFallbackImage}
                alt={latestAnnouncement.title}
                width={400}
                height={180}
                className="h-24 w-full object-cover"
              />
              <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600">Publikasi</span>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(latestAnnouncement.published_at ?? latestAnnouncement.created_at)}</span>
                  </div>
                  <h5 className="line-clamp-2 font-bold leading-snug text-slate-800">{latestAnnouncement.title}</h5>
                  <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">{getNewsSummary(latestAnnouncement)}</p>
                </div>
                <Link href={`/berita/${latestAnnouncement.slug}`} className="flex w-full items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">
                  Buka Berita <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
              <FaNewspaper className="mb-2 h-6 w-6 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Belum ada pengumuman publik.</p>
              <p className="mt-1 text-[10px] text-slate-400">Publikasikan berita agar informasi terbaru tampil di dashboard.</p>
              <Link href="/admin/berita" className="mt-3 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">
                Kelola Berita
              </Link>
            </div>
          )}
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-1 border-t border-slate-200/60 pt-4 text-[10px] text-slate-400 sm:flex-row">
        <p>© 2024 Dinas Pertanian Daerah. All rights reserved.</p>
        <p className="font-medium text-slate-500">SIM Pertanian v1.0.0</p>
      </footer>
    </div>
  );
}

