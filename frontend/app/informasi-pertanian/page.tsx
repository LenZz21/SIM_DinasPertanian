"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, FileDown, Leaf, MapPinned, Sprout, Users, Wheat } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { getPublicStats } from "@/lib/api/public";

const cropComposition = [
  { name: "Padi", value: 35, color: "#10b981" },
  { name: "Jagung", value: 25, color: "#3b82f6" },
  { name: "Sayuran", value: 20, color: "#f59e0b" },
  { name: "Buah", value: 12, color: "#fb923c" },
  { name: "Lainnya", value: 8, color: "#cbd5e1" },
];

const regionData = [
  { name: "Gowa", total: 12492 },
  { name: "Takalar", total: 28656 },
  { name: "Makassar", total: 42927 },
  { name: "Maros", total: 54877 },
  { name: "Jeneponto", total: 58654 },
];

const fertilizerData = [
  { name: "Urea", total: 3520 },
  { name: "NPK", total: 2740 },
  { name: "Organik", total: 2490 },
  { name: "ZA", total: 1180 },
];

const extensionData = [
  { name: "Jan", sesi: 18 },
  { name: "Feb", sesi: 22 },
  { name: "Mar", sesi: 28 },
  { name: "Apr", sesi: 24 },
  { name: "Mei", sesi: 32 },
];

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const fallbackMonthly = [
  { month: 1, total: 9800 },
  { month: 2, total: 5200 },
  { month: 3, total: 24200 },
  { month: 4, total: 15600 },
  { month: 5, total: 10900 },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function ExportButtons() {
  return (
    <div className="flex items-center gap-2">
      {["PNG", "CSV"].map((type) => (
        <button
          key={type}
          type="button"
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 transition hover:border-[#ff432f] hover:text-[#ff432f]"
        >
          {type}
        </button>
      ))}
    </div>
  );
}

function InfographicPanel({ title, description, children, compact = false }: { title: string; description?: string; children: ReactNode; compact?: boolean }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-sora)] text-base font-black text-[#25332c]">{title}</h2>
          {description ? <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">{description}</p> : null}
          <div className="mt-3 h-1 w-10 rounded-full bg-[#f5b21b]" />
        </div>
        <ExportButtons />
      </div>
      <div className={compact ? "min-h-[230px]" : "h-[330px]"}>{children}</div>
    </section>
  );
}

export default function InformasiPertanianPage() {
  const [monthly, setMonthly] = useState<Array<{ month: number; total: number }>>([]);
  const [stats, setStats] = useState({ total_mitra: 0, total_panen: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    getPublicStats()
      .then((res) => {
        setMonthly(res.data.monthly?.length ? res.data.monthly : fallbackMonthly);
        setStats({
          total_mitra: res.data.total_mitra ?? 0,
          total_panen: res.data.total_panen ?? 0,
        });
      })
      .catch(() => {
        setMonthly(fallbackMonthly);
        setStats({ total_mitra: 12840, total_panen: 64490 });
      });
  }, []);

  const chartData = useMemo(
    () =>
      (monthly.length ? monthly : fallbackMonthly).map((item) => ({
        ...item,
        label: monthLabels[item.month - 1] ?? `Bulan ${item.month}`,
      })),
    [monthly],
  );

  const topProduction = useMemo(() => Math.max(...chartData.map((item) => item.total), 0), [chartData]);

  const statCards = [
    { label: "Total Produksi", value: formatNumber(stats.total_panen || 64490), unit: "Ton", icon: Wheat, color: "text-blue-600" },
    { label: "Mitra Petani", value: formatNumber(stats.total_mitra || 12840), unit: "Orang", icon: Users, color: "text-emerald-600" },
    { label: "Komoditas", value: "5", unit: "Jenis", icon: Sprout, color: "text-amber-600" },
    { label: "Puncak Produksi", value: formatNumber(topProduction), unit: "Ton", icon: BarChart3, color: "text-violet-600" },
    { label: "Wilayah Pantau", value: "5", unit: "Daerah", icon: MapPinned, color: "text-rose-600" },
  ];

  const keyInsights = [
    { title: "Komoditas Dominan", value: "Padi 35%", icon: Leaf, tone: "bg-emerald-50 text-emerald-700" },
    { title: "Wilayah Tertinggi", value: "Jeneponto", icon: MapPinned, tone: "bg-blue-50 text-blue-700" },
    { title: "Stok Prioritas", value: "Urea 3.520 Kg", icon: Sprout, tone: "bg-amber-50 text-amber-700" },
    { title: "Laporan Valid", value: "128 Dokumen", icon: FileDown, tone: "bg-rose-50 text-rose-700" },
  ];

  return (
    <PublicShell navVariant="overlay">
      <main className="bg-[#eef4f8]">
        <section
          className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center text-white md:min-h-[470px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(5,19,38,0.36),rgba(5,19,38,0.62)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&auto=format&fit=crop&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_38%)]" />
          <div className="relative">
            <h1 className="font-[var(--font-sora)] text-4xl font-black md:text-6xl">Infografis Pertanian</h1>
            <p className="mt-4 text-sm font-medium text-white/85 md:text-base">Statistik produksi, komoditas, dan layanan pertanian yang terintegrasi dan transparan.</p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <BarChart3 className="h-4 w-4 text-[#ff432f]" />
              <span className="text-[#ff6b5c]">Infografis</span>
            </div>
          </div>
        </section>

        <section className="relative -mt-10 rounded-t-[2.5rem] bg-[#eef4f8] px-4 pb-14 pt-8 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#ff432f]">Ringkasan Data Utama</p>
              <h2 className="font-[var(--font-sora)] text-2xl font-black text-[#25332c]">Statistik Umum</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Data yang ditampilkan difokuskan pada produksi, mitra, komoditas, wilayah pantau, stok pupuk, dan aktivitas penyuluhan.
              </p>
              <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-[#f5b21b]" />
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {statCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#ffb3aa] hover:shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{item.label}</span>
                      <span className="rounded-2xl bg-slate-50 p-2 transition group-hover:bg-[#fff2ef]">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </span>
                    </div>
                    <p className={`font-[var(--font-sora)] text-2xl font-black ${item.color}`}>{item.value}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{item.unit}</p>
                  </div>
                );
              })}
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-4">
              {keyInsights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-2xl border border-white bg-white/70 p-4 shadow-sm">
                    <div className={`mb-3 inline-flex rounded-xl p-2 ${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{item.title}</p>
                    <p className="mt-1 font-[var(--font-sora)] text-lg font-black text-[#25332c]">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-5">
              <InfographicPanel title="Tren Produksi Bulanan" description="Memantau pergerakan hasil panen bulanan untuk melihat puncak produksi dan periode penurunan.">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="productionInfoGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#edf2f7" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#8a9aa8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a9aa8", fontSize: 12 }} tickFormatter={(value) => formatNumber(Number(value))} />
                      <Tooltip formatter={(value) => [`${formatNumber(Number(value))} Ton`, "Produksi"]} />
                      <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fill="url(#productionInfoGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full animate-pulse rounded-lg bg-slate-100" />
                )}
              </InfographicPanel>

              <InfographicPanel title="Komposisi Komoditas" description="Persentase komoditas utama yang paling banyak tercatat.">
                  {mounted ? (
                    <div className="grid h-full items-center gap-4 md:grid-cols-[220px_1fr]">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={cropComposition} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                            {cropComposition.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, "Persentase"]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-3">
                        {cropComposition.map((item) => (
                          <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="font-black text-[#25332c]">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full animate-pulse rounded-lg bg-slate-100" />
                  )}
              </InfographicPanel>

              <InfographicPanel title="Produksi Per Wilayah" description="Peringkat wilayah pantau berdasarkan total produksi tercatat.">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={regionData} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#edf2f7" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8a9aa8", fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a9aa8", fontSize: 12 }} tickFormatter={(value) => formatNumber(Number(value))} />
                        <Tooltip formatter={(value) => [`${formatNumber(Number(value))} Ton`, "Produksi"]} />
                        <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full animate-pulse rounded-lg bg-slate-100" />
                  )}
              </InfographicPanel>

              <InfographicPanel title="Stok Pupuk Prioritas" description="Ringkasan stok pupuk yang perlu dipantau oleh admin gudang.">
                <div className="flex h-full flex-col justify-center gap-5">
                  {fertilizerData.map((item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#25332c]">
                        <span>{item.name}</span>
                        <span>{formatNumber(item.total)} Kg</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-[#f5b21b]" style={{ width: `${Math.min(100, (item.total / 3600) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </InfographicPanel>

              <InfographicPanel title="Aktivitas Penyuluhan" description="Jumlah sesi penyuluhan berjalan sebagai indikator layanan lapangan.">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={extensionData} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#edf2f7" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8a9aa8", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a9aa8", fontSize: 12 }} />
                      <Tooltip formatter={(value) => [`${value} Sesi`, "Penyuluhan"]} />
                      <Bar dataKey="sesi" radius={[10, 10, 0, 0]} fill="#ff432f" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full animate-pulse rounded-lg bg-slate-100" />
                )}
              </InfographicPanel>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
