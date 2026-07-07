"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ImageIcon } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { getPublicAgenda } from "@/lib/api/public";
import type { AgendaEvent } from "@/lib/types/api";

function formatDateTime(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);
  const dateText = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Makassar",
  })
    .format(date)
    .replace(".", ":");

  return `${dateText} • ${timeText} WITA`;
}

function displayStatus(status: AgendaEvent["status"]) {
  if (status === "Terjadwal") return "Mendatang";
  return status;
}

function statusClass(status: AgendaEvent["status"]) {
  if (status === "Selesai") return "bg-rose-600 text-white";
  if (status === "Berlangsung") return "bg-[#0f7d3b] text-white";
  if (status === "Dibatalkan") return "bg-slate-700 text-white";
  return "bg-blue-600 text-white";
}

function isUpcoming(item: AgendaEvent) {
  return item.status === "Terjadwal" || item.status === "Berlangsung" || new Date(item.starts_at).getTime() >= Date.now();
}

export default function AgendaPublikPage() {
  const [items, setItems] = useState<AgendaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicAgenda({ per_page: 50 })
      .then((response) => setItems(response.data))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    const locationCount = new Set(items.map((item) => item.location).filter(Boolean)).size;
    return {
      total: items.length,
      upcoming: items.filter(isUpcoming).length,
      locations: locationCount,
    };
  }, [items]);

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
          <div className="relative">
            <h1 className="font-[var(--font-sora)] text-4xl font-black md:text-6xl">Agenda Dinas</h1>
            <p className="mt-4 text-sm font-medium text-white/85 md:text-base">
              Informasi jadwal kegiatan dinas yang sedang berjalan dan akan datang.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <CalendarDays className="h-4 w-4 text-[#25576a]" />
              <span className="text-[#0f7d3b]">Agenda</span>
            </div>
          </div>
        </section>

        <section className="relative -mt-10 rounded-t-[2.5rem] bg-[#eef4f8] px-4 pb-20 pt-10 md:px-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-64 top-12 hidden h-[760px] w-[760px] rounded-full bg-[#8bd3a5]/24 blur-3xl lg:block" />
            <div className="absolute -right-72 top-44 hidden h-[760px] w-[760px] rounded-full bg-[#cfe7ee]/80 blur-3xl lg:block" />
          </div>

          <div className="relative mx-auto max-w-[1480px]">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#607288]">Total Agenda</p>
                <p className="mt-3 text-4xl font-black text-blue-600">{stats.total}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#607288]">Agenda Mendatang</p>
                <p className="mt-3 text-4xl font-black text-[#0f7d3b]">{stats.upcoming}</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#607288]">Titik Lokasi</p>
                <p className="mt-3 text-4xl font-black text-indigo-600">{stats.locations}</p>
              </div>
            </div>

            <div className="py-12 text-center">
              <h2 className="font-[var(--font-sora)] text-3xl font-black text-[#17231d] md:text-5xl">Daftar Agenda</h2>
              <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-blue-600" />
            </div>

            {isLoading ? (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="h-56 animate-pulse bg-slate-200" />
                    <div className="space-y-4 p-6">
                      <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                      <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#0f8274]">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white">
                          <ImageIcon className="h-10 w-10" />
                          <p className="mt-3 text-sm font-bold">{item.category}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-black ${statusClass(item.status)}`}>
                        {displayStatus(item.status)}
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-black text-blue-600">{formatDateTime(item.starts_at)}</p>
                      <h3 className="mt-3 line-clamp-2 font-[var(--font-sora)] text-xl font-black leading-snug text-[#111827]">{item.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#52637a]">
                        {item.summary || "Informasi detail agenda akan diperbarui oleh admin dinas."}
                      </p>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <p className="line-clamp-1 text-sm font-medium text-[#607288]">{item.location}</p>
                        <Button asChild variant="outline" size="sm" className="rounded-full border-[#0f7d3b] px-5 text-[#0f7d3b] hover:bg-[#eaf7ef] hover:text-[#0b6d32]">
                          <Link href={`/agenda/${item.slug}`}>Detail</Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#bde0e9] bg-white text-center shadow-sm">
                <CalendarDays className="mb-4 h-12 w-12 text-[#25576a]" />
                <h3 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d]">Belum ada agenda</h3>
                <p className="mt-2 text-sm text-[#66766e]">Agenda akan tampil setelah ditambahkan dari dashboard admin.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
