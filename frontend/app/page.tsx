"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  GraduationCap,
  Grid2X2,
  ImageIcon,
  Leaf,
  Mountain,
  Newspaper,
  Sprout,
  Users,
} from "lucide-react";
import { OfficialGreetingSection } from "@/components/home/official-greeting-section";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { getPublicAgenda, getPublicDepartmentProfile, getPublicEmployees, getPublicGalleryItems, getPublicGreeting, getPublicNews } from "@/lib/api/public";
import type { AgendaEvent, DepartmentProfile, EmployeeRecord, GalleryAlbum, News, OfficialGreeting } from "@/lib/types/api";

type AgendaCardItem = {
  slug: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
  endTime: string;
  summary: string;
  image?: string | null;
};

type HomeGalleryItem = {
  id: number | string;
  title: string;
  category: string;
  image?: string | null;
  date?: string | null;
  featured?: boolean;
};

type HomeNewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string | null;
  date?: string | null;
  views: number;
};

type HomeOrganizationItem = {
  id: number;
  name: string;
  position: string;
  photo?: string | null;
};

const fallbackGreeting: OfficialGreeting = {
  id: 0,
  name: "Drs. Nama Kepala Dinas",
  position: "Kepala Dinas Pertanian",
  institution: "Kabupaten Kepulauan Sangihe",
  photo_url: null,
  detail_url: "/profil/sambutan-kepala-dinas",
  paragraphs: [
    "Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas dedikasi dan kerja keras seluruh insan pertanian dalam membangun layanan yang lebih terbuka, responsif, dan berdampak.",
    "Dinas Pertanian berkomitmen untuk terus mendorong kemajuan sektor pertanian melalui pelayanan publik yang prima, inovasi teknologi, serta penguatan kolaborasi bersama petani dan pemangku kepentingan.",
    "Bersama, kita wujudkan pertanian yang maju, mandiri, modern, dan berkelanjutan demi kesejahteraan petani serta ketahanan pangan daerah.",
  ],
  is_active: true,
  updated_at: null,
};

const fallbackDepartmentProfile: DepartmentProfile = {
  id: 0,
  overview:
    "Dinas Pertanian Daerah berperan sebagai penyelenggara urusan pemerintahan bidang pertanian melalui pelayanan data, pendampingan petani, penguatan produksi, serta kolaborasi lintas sektor untuk meningkatkan kesejahteraan masyarakat tani.",
  vision: "Terwujudnya pertanian daerah yang maju, mandiri, modern, berdaya saing, dan berkelanjutan.",
  missions: [
    "Meningkatkan kualitas pelayanan publik dan tata kelola data pertanian yang akurat, terbuka, dan mudah diakses.",
    "Memperkuat kapasitas petani, kelompok tani, dan pelaku usaha pertanian melalui penyuluhan dan pendampingan berkelanjutan.",
    "Mendorong peningkatan produksi, produktivitas, dan nilai tambah komoditas pertanian unggulan daerah.",
    "Mengembangkan inovasi, teknologi, dan kemitraan untuk mendukung ketahanan pangan serta kesejahteraan petani.",
  ],
  hero_image_url: null,
  is_active: true,
  updated_at: null,
};

const defaultHeroImageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&auto=format&fit=crop&q=80";

function MediaPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f8274] ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.18))]" />
      <div className="relative flex h-full min-h-24 items-center justify-center p-5 text-center text-xs font-bold text-white/80">{label}</div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <h2 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d] md:text-3xl">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-[#0f7d3b]" />
      <p className="mt-4 text-sm leading-7 text-[#66766e]">{description}</p>
    </div>
  );
}

function toParagraphs(value?: string | null, fallback: string[] = []) {
  const paragraphs = value
    ?.split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return paragraphs?.length ? paragraphs : fallback;
}

function formatAgendaTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  })
    .format(new Date(value))
    .replace(".", ":");
}

function toAgendaCardItem(item: AgendaEvent): AgendaCardItem {
  const startsAt = new Date(item.starts_at);
  const month = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Makassar" }).format(startsAt);

  return {
    slug: item.slug,
    day: new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: "Asia/Makassar" }).format(startsAt),
    month: month.toUpperCase(),
    title: item.title,
    location: item.location,
    time: `${formatAgendaTime(item.starts_at)} WITA`,
    endTime: item.ends_at ? `${formatAgendaTime(item.ends_at)} WITA` : "-",
    summary: item.summary || "Informasi agenda kegiatan Dinas Pertanian.",
    image: item.image_url,
  };
}

function formatGalleryDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toHomeGalleryItem(item: GalleryAlbum): HomeGalleryItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    image: item.cover_url || item.photos?.[0]?.image_url,
    date: item.taken_at ?? item.created_at,
  };
}

function plainText(value?: string | null, length = 150) {
  const text = (value ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function getNewsTime(item: News) {
  return new Date(item.updated_at ?? item.created_at ?? item.published_at ?? 0).getTime();
}

function toHomeNewsItem(item: News): HomeNewsItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: plainText(item.excerpt || item.content),
    category: item.category ?? "Berita",
    image: item.image_url,
    date: item.published_at ?? item.created_at,
    views: item.views_count ?? 0,
  };
}

function toHomeOrganizationItem(item: EmployeeRecord): HomeOrganizationItem {
  return {
    id: item.id,
    name: item.name,
    position: item.position,
    photo: item.photo_url,
  };
}

function formatHomeNewsDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function galleryCategoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("panen")) return Sprout;
  if (normalized.includes("wilayah") || normalized.includes("potensi")) return Mountain;
  if (normalized.includes("penyuluhan")) return GraduationCap;
  if (normalized.includes("unggulan")) return Leaf;
  if (normalized.includes("kegiatan")) return Users;
  return Grid2X2;
}

export default function HomePage() {
  const [greeting, setGreeting] = useState<OfficialGreeting>(fallbackGreeting);
  const [departmentProfile, setDepartmentProfile] = useState<DepartmentProfile>(fallbackDepartmentProfile);
  const [newsItems, setNewsItems] = useState<HomeNewsItem[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaCardItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<HomeGalleryItem[]>([]);
  const [organizationItems, setOrganizationItems] = useState<HomeOrganizationItem[]>([]);

  const loadHomeNews = useCallback(async () => {
    const response = await getPublicNews({ per_page: 12 }, { cache: false });
    return response.data
      .filter((item) => item.is_published)
      .sort((first, second) => getNewsTime(second) - getNewsTime(first))
      .slice(0, 6)
      .map(toHomeNewsItem);
  }, []);

  useEffect(() => {
    let isMounted = true;

    getPublicGreeting()
      .then((response) => {
        if (isMounted && response.data) setGreeting(response.data);
      })
      .catch(() => {
        if (isMounted) setGreeting(fallbackGreeting);
      });

    getPublicDepartmentProfile()
      .then((response) => {
        if (isMounted && response.data) setDepartmentProfile(response.data);
      })
      .catch(() => {
        if (isMounted) setDepartmentProfile(fallbackDepartmentProfile);
      });

    getPublicAgenda({ per_page: 5 })
      .then((response) => {
        if (isMounted) setAgendaItems(response.data.map(toAgendaCardItem));
      })
      .catch(() => {
        if (isMounted) setAgendaItems([]);
      });

    getPublicGalleryItems({ per_page: 8 })
      .then((response) => {
        if (isMounted) setGalleryItems(response.data.map(toHomeGalleryItem));
      })
      .catch(() => {
        if (isMounted) setGalleryItems([]);
      });

    loadHomeNews()
      .then((items) => {
        if (isMounted) setNewsItems(items);
      })
      .catch(() => {
        if (isMounted) setNewsItems([]);
      });

    getPublicEmployees({ per_page: 30 })
      .then((response) => {
        if (!isMounted) return;

        setOrganizationItems(
          response.data
            .filter((item) => item.structure_key)
            .slice(0, 4)
            .map(toHomeOrganizationItem),
        );
      })
      .catch(() => {
        if (isMounted) setOrganizationItems([]);
      });

    return () => {
      isMounted = false;
    };
  }, [loadHomeNews]);

  useEffect(() => {
    let isMounted = true;

    const refreshNews = () => {
      if (document.visibilityState !== "visible") return;

      loadHomeNews()
        .then((items) => {
          if (isMounted) setNewsItems(items);
        })
        .catch(() => {
          if (isMounted) setNewsItems([]);
        });
    };

    window.addEventListener("focus", refreshNews);
    document.addEventListener("visibilitychange", refreshNews);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", refreshNews);
      document.removeEventListener("visibilitychange", refreshNews);
    };
  }, [loadHomeNews]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-page]");
    if (!root) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(
        "section:not(.home-hero) > .mx-auto, section:not(.home-hero) aside, section:not(.home-hero) article, [data-home-reveal]",
      ),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      },
    );

    targets.forEach((target, index) => {
      target.classList.add("home-reveal");
      target.style.transitionDelay = `${Math.min((index % 6) * 70, 350)}ms`;
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [agendaItems.length, galleryItems.length, newsItems.length, organizationItems.length]);

  const greetingPhoto = greeting.photo_url;
  const greetingParagraphs = toParagraphs(departmentProfile.overview, greeting.paragraphs?.length ? greeting.paragraphs : fallbackGreeting.paragraphs);
  const heroImageUrl = departmentProfile.hero_image_url || defaultHeroImageUrl;
  const galleryPreviewItems = galleryItems.slice(0, 5);
  const featuredGalleryItem = galleryPreviewItems[0];
  const secondaryGalleryItems = galleryPreviewItems.slice(1, 5);

  return (
    <PublicShell navVariant="overlay">
      <main data-home-page className="bg-[#edf5f8]">
        <section
          className="home-hero relative flex min-h-[100svh] items-center overflow-hidden bg-cover bg-center px-4 pb-20 pt-28 text-white md:px-6"
          style={{
            backgroundImage: `linear-gradient(180deg,rgba(30,11,8,0.52),rgba(30,11,8,0.35) 44%,rgba(30,11,8,0.82)),url("${heroImageUrl}")`,
          }}
        >
          <div className="home-hero-fog absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,#edf5f8_88%)]" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center text-center">
            <p className="home-hero-kicker text-base font-bold text-white/90 md:text-lg">Selamat Datang di Website Resmi</p>
            <h1 className="home-hero-title mt-2 max-w-6xl font-[var(--font-sora)] text-4xl font-black uppercase leading-tight tracking-normal sm:text-5xl md:text-6xl lg:text-[76px]">
              Dinas <span className="home-hero-title-accent text-[#8bd3a5]">Pertanian</span> Daerah
              <br className="hidden md:block" />
              Kabupaten Kepulauan
              <br className="hidden md:block" />
              Sangihe
            </h1>
            <p className="home-hero-subtitle mt-5 max-w-4xl text-base font-medium leading-8 text-white/90 md:text-xl md:leading-9">
              Portal informasi layanan pertanian, data produksi, berita, agenda, dan dokumentasi kegiatan lapangan.
            </p>
          </div>
        </section>

          <OfficialGreetingSection
            greeting={greeting}
            photoUrl={greetingPhoto}
            paragraphs={greetingParagraphs}
          />

        <section id="informasi-pertanian" className="bg-white px-4 py-18 md:px-6 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f7d3b]">Informasi Pertanian</p>
              <h2 className="mt-4 max-w-xl font-[var(--font-sora)] text-3xl font-black leading-tight text-[#17231d] md:text-5xl">
                Pusat informasi layanan dan potensi pertanian daerah.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#66766e]">
                Akses ringkasan data pertanian, agenda kegiatan, publikasi berita, dan dokumentasi lapangan Dinas Pertanian Kabupaten Kepulauan Sangihe.
              </p>
              <Button asChild className="mt-7 rounded-full bg-[#0f7d3b] px-6 py-6 text-base font-bold hover:bg-[#0b6b32]">
                <Link href="/informasi-pertanian">
                  Lihat Informasi <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Data Produksi",
                  description: "Ringkasan hasil panen dan perkembangan komoditas pertanian.",
                  icon: Sprout,
                },
                {
                  title: "Luas Lahan",
                  description: "Informasi wilayah tanam, lahan aktif, dan potensi pengembangan.",
                  icon: Mountain,
                },
                {
                  title: "Pupuk dan Sarana",
                  description: "Pemantauan kebutuhan dan distribusi sarana pendukung pertanian.",
                  icon: Leaf,
                },
                {
                  title: "Agenda Dinas",
                  description: "Jadwal kegiatan, pendampingan, dan program lapangan terbaru.",
                  icon: CalendarDays,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-2xl border border-[#d8e8df] bg-[#f7fbf8] p-6 shadow-sm">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f4ea] text-[#0f7d3b]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-[var(--font-sora)] text-lg font-black text-[#17231d]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#66766e]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative bg-[#f7fbf8] px-4 pb-16 pt-32 md:px-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-64 top-8 hidden h-[780px] w-[780px] rounded-full bg-[#8bd3a5]/24 blur-3xl lg:block" />
            <div className="absolute -right-72 top-72 hidden h-[760px] w-[760px] rounded-full bg-[#cfe7ee]/80 blur-3xl lg:block" />
            <div className="absolute -left-72 bottom-12 hidden h-[760px] w-[760px] rounded-full bg-[#d7f0de]/70 blur-3xl lg:block" />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[410px_1fr] lg:pb-32">
          <aside className="self-start lg:sticky lg:top-32">
            <p className="mb-6 px-1 text-[46px] font-light leading-none tracking-normal text-[#0f7d3b]" style={{ fontFamily: "var(--font-kalam)" }}>
              Sorotan Berita
            </p>
            <div className="h-[620px] rounded-[2rem] border border-[#bde0e9] bg-white p-6 shadow-[0_18px_42px_rgba(37,87,106,0.12)]">
              <div className="h-full space-y-0 overflow-y-auto pr-2">
              {newsItems.length ? (
                newsItems.concat(newsItems.slice(0, 2)).map((item, index) => (
                  <Link key={`${item.id}-${item.slug}-${index}`} href={`/berita/${item.slug}`} className="flex gap-4 border-b border-dashed border-[#9fd0dc]/30 py-4 last:border-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f7d3b] text-white shadow-md">
                      <Newspaper className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[#25576a]">Artikel</p>
                        <span className="shrink-0 text-[11px] font-medium text-[#25576a]">{formatGalleryDate(item.date)}</span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-[#2f2f37]">{item.title}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Newspaper className="mb-3 h-10 w-10 text-[#25576a]" />
                  <p className="font-[var(--font-sora)] text-lg font-black text-[#17231d]">Belum ada berita</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#66766e]">Berita akan tampil setelah ditambahkan dari dashboard admin.</p>
                </div>
              )}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            {newsItems.length ? (
              newsItems.slice(0, 4).map((item) => (
                <article key={item.id} data-news-no-hover className="grid min-h-[360px] overflow-hidden rounded-[1.75rem] bg-[#edf5f8] shadow-sm md:grid-cols-[300px_1fr]">
                  <Link href={`/berita/${item.slug}`} className="block">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="h-80 w-full object-cover md:h-full" />
                    ) : (
                      <MediaPlaceholder label={item.category} className="h-80 rounded-none shadow-none md:h-full" />
                    )}
                  </Link>
                  <div className="flex min-h-[360px] flex-col justify-between p-8">
                    <div>
                      <Link href={`/berita/${item.slug}`}>
                        <h2 className="font-[var(--font-sora)] text-2xl font-bold leading-snug text-[#2c2d32]">
                          {item.title}
                        </h2>
                      </Link>
                      <div className="my-5 h-px bg-slate-300/70" />
                      <p className="line-clamp-4 text-base leading-8 text-[#4b4b52]">{item.excerpt || "Belum ada ringkasan berita."}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#74747a]">
                      <span>{formatHomeNewsDate(item.date)}</span>
                      <span className="h-4 w-px bg-slate-300" />
                      <span>{item.views} kali dilihat</span>
                      <span className="rounded-md border border-[#bfe8cc] bg-white px-3 py-1 text-xs font-semibold text-[#0f7d3b]">{item.category}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.75rem] bg-[#edf5f8] text-center shadow-sm">
                <Newspaper className="mb-4 h-12 w-12 text-[#25576a]" />
                <h2 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d]">Belum ada berita</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#66766e]">Berita akan tampil setelah database terhubung dan data ditambahkan dari dashboard admin.</p>
              </div>
            )}

            {newsItems.length ? (
              <div className="flex justify-end">
                <Button asChild className="rounded-full bg-[#0f7d3b] hover:bg-[#0b6b32]">
                  <Link href="/berita">
                    Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
          </div>
        </section>

        <section className="bg-[#f5f7fb] px-4 py-16 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d] md:text-3xl">Struktur Organisasi</h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#0f7d3b]" />
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#66766e]">
                Struktur organisasi Dinas Pertanian tersusun berdasarkan data dari dashboard admin.
              </p>
            </div>

            {organizationItems.length ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {organizationItems.map((item) => (
                  <article key={item.id} className="rounded-2xl bg-white p-4 text-center shadow-[0_14px_36px_rgba(37,87,106,0.12)]">
                    <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-[#0f8274] text-center text-sm font-bold text-white/80">
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>Profil Dinas</span>
                      )}
                    </div>
                    <h3 className="mt-4 font-[var(--font-sora)] text-sm font-black leading-snug text-[#17231d]">{item.name}</h3>
                    <p className="mt-1 text-xs font-medium leading-5 text-[#66766e]">{item.position}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-[#cfe2d8] bg-white px-6 py-10 text-center">
                <Users className="mx-auto h-10 w-10 text-[#0f7d3b]" />
                <h3 className="mt-4 font-[var(--font-sora)] text-lg font-black text-[#17231d]">Struktur organisasi belum tersedia</h3>
                <p className="mt-2 text-sm leading-6 text-[#66766e]">Data akan tampil setelah struktur organisasi diisi dari dashboard admin.</p>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline" className="rounded-full border-[#0f7d3b] px-6 font-bold text-[#0f7d3b] hover:bg-[#eaf7ef]">
                <Link href="/profil">Lihat Profil Dinas</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="relative bg-[#f7fbf8] px-4 py-24 md:px-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-64 top-10 hidden h-[780px] w-[780px] rounded-full bg-[#8bd3a5]/24 blur-3xl lg:block" />
            <div className="absolute -right-72 top-60 hidden h-[760px] w-[760px] rounded-full bg-[#cfe7ee]/80 blur-3xl lg:block" />
            <div className="absolute -left-72 bottom-10 hidden h-[760px] w-[760px] rounded-full bg-[#d7f0de]/70 blur-3xl lg:block" />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[410px_1fr]">
            <aside className="relative self-start lg:sticky lg:top-32">
              <p className="text-[42px] font-light leading-none tracking-normal text-[#0f7d3b] md:text-[48px]" style={{ fontFamily: "var(--font-kalam)" }}>
                Agenda Pertanian
              </p>
              <h2 className="mt-6 max-w-sm font-[var(--font-sora)] text-4xl font-bold leading-tight text-[#2c2d32] md:text-5xl">
                Informasi Agenda Terkini Dinas Pertanian
              </h2>
              <p className="mt-6 max-w-md text-base leading-8 text-[#4b4b52]">
                Temukan agenda kegiatan, monitoring produksi, verifikasi data mitra, dan program pertanian daerah. Mari ikut berpartisipasi!
              </p>
              <Button asChild className="mt-7 rounded-lg bg-[#0f7d3b] px-6 py-6 text-base hover:bg-[#0b6b32]">
                <Link href="/informasi-pertanian">
                  Lihat semua agenda
                </Link>
              </Button>
              <svg className="mt-8 hidden h-44 w-56 text-[#0f7d3b] md:block" viewBox="0 0 230 180" fill="none" aria-hidden="true">
                <path
                  d="M31 8C-2 57 46 96 89 67C129 40 146 87 112 121C83 150 122 168 202 164"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path d="M184 143L207 164L181 176" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </aside>

            <div className="space-y-8">
              {agendaItems.length ? (
                agendaItems.map((item) => (
                <article
                  key={item.title}
                  className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#8bd3a5] hover:shadow-sm lg:grid-cols-[420px_1fr]"
                >
                  <div className="relative min-h-[345px] lg:min-h-[355px]">
                    <div className="absolute left-0 top-0 z-10 flex items-start gap-4">
                      <span className="mt-1 h-3.5 w-3.5 rounded-full bg-[#0f7d3b]" />
                      <span className="text-[88px] font-black leading-[0.9] text-[#0f7d3b]">/</span>
                      <div className="rounded-md border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
                        <p className="text-3xl font-light italic leading-none text-[#0f7d3b]" style={{ fontFamily: "var(--font-kalam)" }}>
                          {item.day}
                        </p>
                        <p className="mt-1 text-xs font-light italic text-[#0f7d3b]" style={{ fontFamily: "var(--font-kalam)" }}>
                          {item.month.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 top-28 overflow-hidden rounded-md bg-[#edf5f8] shadow-sm">
                      {item.image ? (
                        <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#25576a]">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10" />
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f8274] shadow-sm">
                        Agenda Pertanian
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-[300px] flex-col justify-center px-4 py-7 lg:px-8">
                    <div>
                      <Link href={`/agenda/${item.slug}`}>
                        <h3 className="font-[var(--font-sora)] text-2xl font-medium uppercase leading-snug text-[#17202a] transition hover:text-[#0f7d3b] md:text-3xl">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="my-5 flex items-center gap-2">
                        <span className="h-1 w-16 rounded-full bg-[#bde0e9]" />
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="space-y-3 text-base text-[#1f2937]">
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#0f7d3b]">📌</span>
                          <span className="font-medium text-[#0f7d3b]">{item.location}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#0f7d3b]">⏰</span>
                          <span>
                            <span className="font-semibold">Mulai:</span> Jumat, {item.day} {item.month[0] + item.month.slice(1).toLowerCase()} 2026 {item.time}
                          </span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#0f7d3b]">⏰</span>
                          <span>
                            <span className="font-semibold">Berakhir:</span> Jumat, {item.day} {item.month[0] + item.month.slice(1).toLowerCase()} 2026 {item.endTime}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#eaf7ef] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#0f7d3b]">Agenda</span>
                      <p className="line-clamp-1 text-sm text-[#66766e]">{item.summary}</p>
                    </div>
                  </div>
                </article>
                ))
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#bde0e9] bg-white text-center shadow-sm">
                  <CalendarDays className="mb-4 h-12 w-12 text-[#25576a]" />
                  <h3 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d]">Belum ada agenda</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#66766e]">Agenda akan tampil setelah database terhubung dan data ditambahkan dari dashboard admin.</p>
                </div>
              )}

              {agendaItems.length ? (
                <div className="flex justify-end">
                  <Button asChild className="rounded-full bg-[#0f7d3b] hover:bg-[#0b6b32]">
                    <Link href="/agenda">
                      Lihat Semua Agenda <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section id="galeri" className="relative overflow-hidden bg-white px-4 py-20 md:px-6">
          <div className="relative mx-auto max-w-[1480px]">
            <div className="text-center">
              <h2 className="font-[var(--font-sora)] text-3xl font-black leading-tight text-[#17231d] md:text-4xl">
                Galeri Pertanian
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#0f7d3b]" />
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#66766e]">
                Dokumentasi kegiatan, hasil panen, dan potensi pertanian di Kabupaten Kepulauan Sangihe.
              </p>
            </div>

            <div className="mt-10 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
              {featuredGalleryItem ? (
                <div className="grid gap-5 lg:grid-cols-[1.05fr_1.42fr]">
                  <article className="group relative min-h-[560px] overflow-hidden rounded-2xl bg-[#edf5f8] shadow-sm">
                    {featuredGalleryItem.image ? (
                      <img src={featuredGalleryItem.image} alt={featuredGalleryItem.title} className="h-full min-h-[560px] w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full min-h-[560px] items-center justify-center bg-[#d9edf3] text-[#25576a]">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent" />
                    <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[#0f7d3b] px-4 py-2 text-sm font-black text-white shadow-sm">
                      <Leaf className="h-4 w-4" />
                      {featuredGalleryItem.category}
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="font-[var(--font-sora)] text-2xl font-black leading-tight text-white md:text-3xl">{featuredGalleryItem.title}</h3>
                      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/90">
                        <CalendarDays className="h-4 w-4" />
                        {formatGalleryDate(featuredGalleryItem.date)}
                      </p>
                    </div>
                    <Link href="/galeri" className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#17231d] shadow-sm transition hover:bg-[#edf5f8]" aria-label="Buka galeri">
                      <Camera className="h-5 w-5" />
                    </Link>
                  </article>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {secondaryGalleryItems.map((item) => (
                      <article key={item.id} className="group relative min-h-[270px] overflow-hidden rounded-2xl bg-[#edf5f8] shadow-sm">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full min-h-[270px] w-full object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full min-h-[270px] items-center justify-center bg-[#d9edf3] text-[#25576a]">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/18 to-transparent" />
                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#25576a] shadow-sm">
                          {(() => {
                            const Icon = galleryCategoryIcon(item.category);
                            return <Icon className="h-3.5 w-3.5" />;
                          })()}
                          {item.category}
                        </div>
                        <div className="absolute bottom-5 left-5 right-16">
                          <h3 className="font-[var(--font-sora)] text-lg font-black leading-tight text-white md:text-xl">{item.title}</h3>
                          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/90">
                            <CalendarDays className="h-4 w-4" />
                            {formatGalleryDate(item.date)}
                          </p>
                        </div>
                        <Link href="/galeri" className="absolute bottom-5 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#17231d] shadow-sm transition hover:bg-[#edf5f8]" aria-label="Buka galeri">
                          <Camera className="h-4 w-4" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#bde0e9] bg-[#edf5f8]/40 text-center">
                  <ImageIcon className="mb-4 h-12 w-12 text-[#25576a]" />
                  <h3 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d]">Belum ada galeri</h3>
                  <p className="mt-2 text-sm text-slate-500">Tambahkan dokumentasi dari dashboard admin galeri.</p>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
    </PublicShell>
  );
}
