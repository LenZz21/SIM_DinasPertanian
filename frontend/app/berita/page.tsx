"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Newspaper, Search } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicNews } from "@/lib/api/public";
import type { News } from "@/lib/types/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=900&auto=format&fit=crop&q=80",
];

const categories = ["Semua", "Berita", "Pengumuman"];
const pageSize = 5;

function formatDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value?: string | null) {
  if (!value) return "--";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getNewsImage(item: News, index: number) {
  return item.image_url || fallbackImages[index % fallbackImages.length];
}

function getSummary(item: News, length = 235) {
  const plainText = (item.excerpt || item.content).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return plainText.length > length ? `${plainText.slice(0, length)}...` : plainText;
}

function getCategory(item: News) {
  return item.title.toLowerCase().includes("pengumuman") ? "Pengumuman" : "Berita";
}

function getViews(item: News, index: number) {
  return (item.comments_count ?? 0) + 41 + index * 6;
}

export default function BeritaPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [items, setItems] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      getPublicNews(search)
        .then((res) => {
          setItems(res.data);
          setPage(1);
        })
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Semua") return items;
    return items.filter((item) => getCategory(item) === selectedCategory);
  }, [items, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

  const popularItems = useMemo(
    () => [...items].sort((a, b) => (b.comments_count ?? 0) - (a.comments_count ?? 0)).slice(0, 5),
    [items],
  );

  return (
    <PublicShell navVariant="overlay">
      <main className="bg-white">
        <section
          className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center text-white md:min-h-[470px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(5,19,38,0.36),rgba(5,19,38,0.62)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&auto=format&fit=crop&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_38%)]" />
          <div className="relative">
            <h1 className="font-[var(--font-sora)] text-4xl font-black md:text-6xl">Berita</h1>
            <p className="mt-4 text-sm font-medium text-white/85 md:text-base">Informasi Cepat, Aktual, dan Inspiratif</p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Newspaper className="h-4 w-4 text-[#ff432f]" />
              <span className="text-[#ff6b5c]">Berita</span>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-6 lg:py-12">
          <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[minmax(0,900px)_420px] lg:items-start lg:justify-center">
            <div>
              <p className="mb-6 text-sm font-semibold text-[#2c2d32]">
                <span className="font-black">{isLoading ? "..." : filteredItems.length}</span> Publikasi ditemukan
              </p>

              <div className="space-y-6">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid min-h-[330px] overflow-hidden rounded-xl bg-[#f7f0ef] md:grid-cols-[300px_1fr]">
                      <div className="h-80 animate-pulse bg-slate-200 md:h-auto" />
                      <div className="space-y-4 p-6">
                        <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
                        <div className="h-px bg-slate-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      </div>
                    </div>
                  ))
                ) : visibleItems.length ? (
                  visibleItems.map((item, index) => {
                    const absoluteIndex = (page - 1) * pageSize + index;

                    return (
                      <article key={item.id} className="grid min-h-[330px] overflow-hidden rounded-xl bg-[#f7f0ef] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[300px_1fr]">
                        <Link href={`/berita/${item.slug}`} className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getNewsImage(item, absoluteIndex)} alt={item.title} className="h-80 w-full object-cover md:h-full" />
                        </Link>
                        <div className="flex min-h-[330px] flex-col justify-between p-8">
                          <div>
                            <Link href={`/berita/${item.slug}`}>
                              <h2 className="font-[var(--font-sora)] text-2xl font-bold leading-snug text-[#2c2d32] transition hover:text-[#ff432f]">
                                {item.title}
                              </h2>
                            </Link>
                            <div className="my-5 h-px bg-slate-300/70" />
                            <p className="line-clamp-4 text-sm leading-7 text-[#4b4b52]">{getSummary(item)}</p>
                          </div>
                          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#74747a]">
                            <span>{formatDate(item.published_at ?? item.created_at)}</span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {getViews(item, absoluteIndex)} kali dilihat
                            </span>
                            <Badge variant="outline" className="border-[#ffd4ce] bg-white text-[#ff432f]">
                              {getCategory(item)}
                            </Badge>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-[#f7f0ef] text-center">
                    <Newspaper className="mb-4 h-12 w-12 text-[#ff432f]" />
                    <h2 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">Tidak ada berita ditemukan</h2>
                    <p className="mt-2 text-sm text-[#66766e]">Silakan gunakan kata kunci atau kategori lain.</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#2c2d32]">
                <button
                  type="button"
                  suppressHydrationWarning
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setPage(pageNumber)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md ${page === pageNumber ? "bg-[#ff432f] text-white" : "hover:bg-[#fff0ed]"}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                {totalPages > 5 ? <span>...</span> : null}
                {totalPages > 5 ? (
                  <button type="button" suppressHydrationWarning onClick={() => setPage(totalPages)} className="flex h-9 min-w-9 items-center justify-center rounded-md px-2 hover:bg-[#fff0ed]">
                    {totalPages}
                  </button>
                ) : null}
                <button
                  type="button"
                  suppressHydrationWarning
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-28">
              <div>
                <h2 className="font-[var(--font-sora)] text-xl font-bold text-[#2c2d32]">
                  Pencarian{" "}
                  <span className="text-[24px] font-light text-[#ff432f]" style={{ fontFamily: "var(--font-kalam)" }}>
                    Berita
                  </span>
                </h2>
                <div className="relative mt-4">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-14 rounded-md border-slate-200 bg-white pl-12 text-base shadow-sm"
                    placeholder="Ketik dan tekan enter"
                  />
                </div>
              </div>

              <div>
                <h2 className="font-[var(--font-sora)] text-xl font-bold text-[#2c2d32]">
                  Semua{" "}
                  <span className="text-[24px] font-light text-[#ff432f]" style={{ fontFamily: "var(--font-kalam)" }}>
                    Kategori
                  </span>
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "h-9 rounded-md bg-[#ff432f] px-4 text-xs hover:bg-[#e73322]"
                          : "h-9 rounded-md border-slate-200 bg-white px-4 text-xs text-[#2c2d32] hover:bg-[#fff0ed]"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-[var(--font-sora)] text-xl font-bold text-[#2c2d32]">
                  Berita{" "}
                  <span className="text-[24px] font-light text-[#ff432f]" style={{ fontFamily: "var(--font-kalam)" }}>
                    Populer
                  </span>
                </h2>
                <div className="mt-5 space-y-5">
                  {(popularItems.length ? popularItems : items.slice(0, 5)).map((item, index) => (
                    <Link key={item.id} href={`/berita/${item.slug}`} className="group grid grid-cols-[120px_1fr] gap-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getNewsImage(item, index)} alt={item.title} className="h-24 w-full rounded-md object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#2c2d32] transition group-hover:text-[#ff432f]">{item.title}</p>
                        <p className="mt-2 flex items-center gap-2 text-xs text-[#74747a]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatShortDate(item.published_at ?? item.created_at)}
                          <Eye className="ml-1 h-3.5 w-3.5" />
                          {getViews(item, index)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
