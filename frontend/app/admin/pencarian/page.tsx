import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEARCH_INDEX = [
  { href: "/admin", title: "Dashboard", keywords: ["dashboard", "ringkasan", "statistik"] },
  { href: "/admin/mitra", title: "Data Mitra / Petani", keywords: ["mitra", "petani", "partner"] },
  { href: "/admin/hasil", title: "Hasil Pertanian", keywords: ["hasil", "panen", "produksi"] },
  { href: "/admin/luas-lahan", title: "Luas Lahan", keywords: ["lahan", "wilayah", "area"] },
  { href: "/admin/data-ternak", title: "Data Ternak", keywords: ["ternak", "sapi", "hewan"] },
  { href: "/admin/data-pupuk", title: "Data Pupuk", keywords: ["pupuk", "urea", "stok"] },
  { href: "/admin/penyuluhan", title: "Penyuluhan", keywords: ["penyuluhan", "jadwal"] },
  { href: "/admin/laporan", title: "Laporan & Export", keywords: ["laporan", "excel", "pdf", "export"] },
  { href: "/admin/monitoring", title: "Monitoring Produksi", keywords: ["monitoring", "grafik", "chart"] },
  { href: "/admin/notifikasi", title: "Notifikasi", keywords: ["notifikasi", "alert"] },
  { href: "/admin/pengguna", title: "Manajemen Pengguna", keywords: ["pengguna", "akun", "user"] },
  { href: "/admin/berita", title: "Berita", keywords: ["berita", "informasi"] },
  { href: "/admin/galeri", title: "Galeri", keywords: ["galeri", "foto", "gambar"] },
];

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const query = (params?.q ?? "").trim().toLowerCase();

  const results = !query
    ? SEARCH_INDEX
    : SEARCH_INDEX.filter((item) => {
        const haystack = `${item.title} ${item.keywords.join(" ")}`.toLowerCase();
        return haystack.includes(query);
      });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d] dark:text-slate-100">Hasil Pencarian</h1>
        <p className="text-sm text-[#66766e] dark:text-slate-400">
          Kata kunci: <span className="font-semibold">{query || "semua modul"}</span>
        </p>
      </div>

      <Card className="border-[#deebe2] bg-white dark:border-slate-700 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#17231d] dark:text-slate-100">
            <Search className="h-4 w-4 text-[#0f7d3b]" />
            {results.length} Modul Ditemukan
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {results.map((item) => (
            <Link
              key={item.href}
              href={query ? `${item.href}?q=${encodeURIComponent(query)}` : item.href}
              className="rounded-lg border border-[#dce9e2] bg-[#fbfdfc] px-4 py-3 text-sm font-medium text-[#1c2a24] transition hover:bg-[#f1f7f3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {item.title}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
