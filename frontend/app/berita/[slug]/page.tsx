import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Eye, Home, ImageIcon, Newspaper, Search } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { NewsShareButtons } from "@/components/news/news-share-buttons";
import { NewsViewCounter } from "@/components/news/news-view-counter";
import type { ApiResponse, News } from "@/lib/types/api";

async function getNews(slug: string): Promise<News | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${apiUrl}/public/news/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;

    const payload = (await res.json()) as ApiResponse<News>;
    return payload.data;
  } catch {
    return null;
  }
}

async function getPopularNews(currentSlug: string): Promise<News[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${apiUrl}/public/news`, { cache: "no-store" });
    if (!res.ok) return [];

    const payload = (await res.json()) as ApiResponse<News[] | { data: News[] }>;
    const items = Array.isArray(payload.data) ? payload.data : payload.data.data;

    return [...items]
      .filter((item) => item.slug !== currentSlug)
      .sort((a, b) => new Date(b.published_at ?? b.created_at ?? 0).getTime() - new Date(a.published_at ?? a.created_at ?? 0).getTime())
      .slice(0, 5);
  } catch {
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getViews(item: News) {
  return item.views_count ?? 0;
}

function cleanPlainText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_~]/g, "");
}

function getPlainParagraphs(content: string) {
  const plainText = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n/g, "\n")
    .trim();

  return plainText
    .split(/\n{2,}/)
    .map((paragraph) => cleanPlainText(paragraph).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, popularNews] = await Promise.all([getNews(slug), getPopularNews(slug)]);

  if (!data) notFound();

  const paragraphs = getPlainParagraphs(data.content);
  const publishedDate = formatDate(data.published_at ?? data.created_at);
  const viewCount = data.views_count ?? 0;

  return (
    <PublicShell navVariant="overlay">
      <main className="bg-[#edf5f8] text-[#17231d]">
        <section
          className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center text-white md:min-h-[470px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(22,78,43,0.18),rgba(22,78,43,0.42)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&auto=format&fit=crop&q=85')",
          }}
        >
          <div className="relative mx-auto max-w-4xl">
            <h1 className="font-[var(--font-sora)] text-4xl font-black md:text-6xl">Berita</h1>
            <p className="mt-4 text-sm font-medium text-white/85 md:text-base">Informasi Cepat, Aktual, dan Inspiratif</p>
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Home className="h-4 w-4 text-white" />
              <ChevronRight className="h-4 w-4 text-white/60" />
              <Link href="/berita" className="text-white/90 transition hover:text-white">
                Berita
              </Link>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <span className="max-w-[260px] truncate text-[#25576a] md:max-w-lg">{data.title}</span>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,780px)_360px] lg:items-start">
            <article data-news-no-hover>
              <h2 className="font-[var(--font-sora)] text-3xl font-black leading-tight text-[#17231d] md:text-4xl">{data.title}</h2>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#66766e]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#25576a]" />
                  {publishedDate}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#25576a]" />
                  <NewsViewCounter slug={data.slug} initialViews={viewCount} />
                </span>
                <span className="inline-flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-[#25576a]" />
                  {data.category ?? "Berita"}
                </span>
              </div>

              <div className="mt-7 overflow-hidden rounded-xl border border-[#d9edf3] bg-white shadow-sm">
                {data.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.image_url} alt={data.title} className="h-auto w-full object-cover" />
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center bg-[#d9edf3] text-[#25576a]">
                    <ImageIcon className="h-12 w-12" />
                    <p className="mt-3 text-sm font-semibold">Gambar belum tersedia</p>
                  </div>
                )}
              </div>

              <div className="mt-6 border-y border-[#d9edf3] py-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#66766e]">
                  <span>Bagikan:</span>
                  <NewsShareButtons title={data.title} />
                </div>
              </div>

              <div className="mt-6 space-y-5 text-sm leading-8 text-[#4b5b52] md:text-[15px]">
                {paragraphs.length ? (
                  paragraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>)
                ) : (
                  <p>Konten berita belum tersedia.</p>
                )}
              </div>

              <div className="mt-12 border-t border-[#d9edf3] pt-8">
                <Link href="/berita" className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#66766e] shadow-sm transition hover:bg-[#25576a] hover:text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf7ef] text-[#0f7d3b] transition group-hover:bg-white/20 group-hover:text-white">&lt;</span>
                  Kembali ke Berita
                </Link>
              </div>
            </article>

            <aside className="space-y-8 lg:sticky lg:top-28">
              <div>
                <h2 className="font-[var(--font-sora)] text-xl font-bold text-[#17231d]">
                  Pencarian{" "}
                  <span className="text-[24px] font-light text-[#25576a]" style={{ fontFamily: "var(--font-kalam)" }}>
                    Berita
                  </span>
                </h2>
                <div className="relative mt-4">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9b93]" />
                  <input
                    type="search"
                    className="h-12 w-full rounded-md border border-[#d9edf3] bg-white pl-11 pr-4 text-sm text-[#17231d] shadow-sm outline-none transition placeholder:text-[#8b9b93] focus:border-[#0f7d3b]"
                    placeholder="Ketik dan tekan enter"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#d9edf3] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#25576a]">Kategori</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Berita", "Pengumuman", "Penyuluhan", "Program"].map((item) => (
                    <Link key={item} href="/berita" className="rounded-md border border-[#d9edf3] px-3 py-2 text-xs font-bold text-[#66766e] transition hover:border-[#0f7d3b] hover:text-[#0f7d3b]">
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-[var(--font-sora)] text-xl font-bold text-[#17231d]">
                  Berita{" "}
                  <span className="text-[24px] font-light text-[#25576a]" style={{ fontFamily: "var(--font-kalam)" }}>
                    Populer
                  </span>
                </h2>
                <div className="mt-5 space-y-5">
                  {popularNews.length ? (
                    popularNews.map((item) => (
                      <Link key={item.id} href={`/berita/${item.slug}`} className="grid grid-cols-[120px_1fr] gap-5">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt={item.title} className="h-24 w-full rounded-md object-cover shadow-sm" />
                        ) : (
                          <div className="flex h-24 w-full items-center justify-center rounded-md bg-[#d9edf3] text-[#25576a] shadow-sm">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold leading-5 text-[#2c2d32]">{item.title}</p>
                          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#74747a]">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(item.published_at ?? item.created_at)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {getViews(item)}
                            </span>
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#d9edf3] bg-white p-5 text-sm text-[#66766e]">
                      Belum ada berita populer lainnya.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
