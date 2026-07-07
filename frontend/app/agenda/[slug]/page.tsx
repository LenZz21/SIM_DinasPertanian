import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Clock3, Home, ImageIcon, MapPin } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import type { AgendaEvent, ApiResponse } from "@/lib/types/api";

async function getAgenda(slug: string): Promise<AgendaEvent | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${apiUrl}/public/agenda/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;

    const payload = (await res.json()) as ApiResponse<AgendaEvent>;
    return payload.data;
  } catch {
    return null;
  }
}

async function getOtherAgenda(currentSlug: string): Promise<AgendaEvent[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${apiUrl}/public/agenda?per_page=6`, { cache: "no-store" });
    if (!res.ok) return [];

    const payload = (await res.json()) as ApiResponse<AgendaEvent[] | { data: AgendaEvent[] }>;
    const items = Array.isArray(payload.data) ? payload.data : payload.data.data;

    return items.filter((item) => item.slug !== currentSlug).slice(0, 3);
  } catch {
    return [];
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);
  const dateText = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
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

  return `${dateText}, ${timeText} WITA`;
}

function formatHeroDate(value?: string | null) {
  if (!value) return "tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

function displayStatus(status: AgendaEvent["status"]) {
  if (status === "Terjadwal") return "Mendatang";
  return status;
}

function statusClass(status: AgendaEvent["status"]) {
  if (status === "Selesai") return "bg-rose-600 text-white";
  if (status === "Berlangsung") return "bg-[#0f7d3b] text-white";
  if (status === "Dibatalkan") return "bg-slate-700 text-white";
  return "bg-indigo-600 text-white";
}

function getParagraphs(value?: string | null) {
  if (!value) return [];

  return value
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function AgendaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [agenda, otherAgenda] = await Promise.all([getAgenda(slug), getOtherAgenda(slug)]);

  if (!agenda) notFound();

  const paragraphs = getParagraphs(agenda.summary);
  const heroImage =
    agenda.image_url || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&auto=format&fit=crop&q=80";

  return (
    <PublicShell navVariant="overlay">
      <main className="bg-[#eef4f8] text-[#17231d]">
        <section
          className="relative flex min-h-[430px] items-end overflow-hidden bg-cover bg-center px-4 pb-24 text-white md:min-h-[520px] md:px-6"
          style={{
            backgroundImage: `linear-gradient(180deg,rgba(17,24,39,0.58),rgba(17,24,39,0.84)),url("${heroImage}")`,
          }}
        >
          <div className="relative mx-auto w-full max-w-6xl">
            <div className={`inline-flex rounded-full px-4 py-1.5 text-xs font-black ${statusClass(agenda.status)}`}>
              {displayStatus(agenda.status)}
            </div>
            <h1 className="mt-6 max-w-5xl font-[var(--font-sora)] text-4xl font-black leading-tight md:text-6xl">
              {agenda.title}
            </h1>
            <p className="mt-5 text-base font-semibold text-white/85 md:text-lg">
              Agenda resmi Dinas Pertanian pada {formatHeroDate(agenda.starts_at)}.
            </p>
            <div className="mt-7 inline-flex flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Home className="h-4 w-4 text-white" />
              <ChevronRight className="h-4 w-4 text-white/60" />
              <Link href="/agenda" className="text-white/90 transition hover:text-white">
                Agenda
              </Link>
              <ChevronRight className="h-4 w-4 text-white/60" />
              <span className="max-w-[260px] truncate text-white md:max-w-lg">{agenda.title}</span>
            </div>
          </div>
        </section>

        <section className="relative -mt-10 rounded-t-[2.5rem] bg-[#eef4f8] px-4 pb-20 pt-12 md:px-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-64 top-12 hidden h-[760px] w-[760px] rounded-full bg-[#8bd3a5]/18 blur-3xl lg:block" />
            <div className="absolute -right-72 top-72 hidden h-[760px] w-[760px] rounded-full bg-[#cfe7ee]/70 blur-3xl lg:block" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <article className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
                <h2 className="font-[var(--font-sora)] text-3xl font-black text-[#17231d] md:text-4xl">Deskripsi Agenda</h2>
                <div className="mt-4 h-1.5 w-24 rounded-full bg-[#0f7d3b]" />

                <div className="mt-7 space-y-5 text-base font-medium leading-8 text-[#607288]">
                  {paragraphs.length ? (
                    paragraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>)
                  ) : (
                    <p>Deskripsi agenda belum ditambahkan.</p>
                  )}
                </div>
              </article>

              <aside className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="font-[var(--font-sora)] text-xl font-black text-[#17231d]">Informasi Agenda</h2>
                  <div className="mt-6 space-y-5 text-sm">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8390a3]">Tanggal Mulai</p>
                      <p className="mt-1 font-bold text-[#34443c]">{formatDateTime(agenda.starts_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8390a3]">Tanggal Selesai</p>
                      <p className="mt-1 font-bold text-[#34443c]">{formatDateTime(agenda.ends_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8390a3]">Lokasi</p>
                      <p className="mt-1 font-bold text-[#34443c]">{agenda.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#8390a3]">Status</p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-black ${statusClass(agenda.status)}`}>
                        {displayStatus(agenda.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="font-[var(--font-sora)] text-xl font-black text-[#17231d]">Navigasi</h2>
                  <div className="mt-5 space-y-3">
                    <Link href="/agenda" className="flex h-11 items-center justify-center rounded-full border border-[#0f7d3b] text-sm font-black text-[#0f7d3b] transition hover:bg-[#eaf7ef]">
                      Kembali ke Agenda
                    </Link>
                    <Link href="/" className="flex h-11 items-center justify-center rounded-full border border-[#d9edf3] text-sm font-black text-[#607288] transition hover:bg-[#f7fbf8]">
                      Ke Beranda
                    </Link>
                  </div>
                </div>
              </aside>
            </div>

            {otherAgenda.length ? (
              <section className="mt-16">
                <div className="text-center">
                  <h2 className="font-[var(--font-sora)] text-3xl font-black text-[#17231d] md:text-4xl">Agenda Lainnya</h2>
                  <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-[#0f7d3b]" />
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {otherAgenda.map((item) => (
                    <Link key={item.id} href={`/agenda/${item.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex h-44 items-center justify-center overflow-hidden bg-[#0f8274] text-white">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                          <ImageIcon className="h-10 w-10" />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-black text-[#0f7d3b]">{formatDateTime(item.starts_at)}</p>
                        <h3 className="mt-3 line-clamp-2 font-[var(--font-sora)] text-base font-black leading-snug text-[#17231d] group-hover:text-[#0f7d3b]">
                          {item.title}
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#607288]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {displayStatus(item.status)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
