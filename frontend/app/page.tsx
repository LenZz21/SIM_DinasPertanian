import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  GalleryHorizontalEnd,
  Leaf,
  MapPinned,
  Megaphone,
  Newspaper,
  Search,
  ShieldCheck,
  Sprout,
  Tractor,
  Users,
  Wheat,
} from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

const headlineNews = [
  {
    title: "Dinas Pertanian Perkuat Pendataan Mitra Petani dan Produksi Daerah",
    excerpt: "Pemutakhiran data dilakukan untuk memastikan program bantuan, penyuluhan, dan monitoring produksi berjalan tepat sasaran.",
    category: "Informasi",
  },
  {
    title: "Penyuluhan Teknologi Tanam Padi Modern Dibuka untuk Kelompok Tani",
    excerpt: "Petugas lapangan menghadirkan materi efisiensi air, pemupukan berimbang, dan pencatatan hasil panen digital.",
    category: "Penyuluhan",
  },
  {
    title: "Monitoring Stok Pupuk Wilayah Prioritas Diperbarui Minggu Ini",
    excerpt: "Gudang dan kios distribusi diminta memperbarui laporan stok untuk menjaga ketersediaan pupuk bagi petani.",
    category: "Pupuk",
  },
  {
    title: "Galeri Panen Raya dan Kegiatan Lapangan Telah Dipublikasikan",
    excerpt: "Dokumentasi lapangan tersedia sebagai arsip kegiatan dinas dan informasi publik untuk masyarakat.",
    category: "Galeri",
  },
  {
    title: "Laporan Produksi Bulanan Siap Diekspor PDF dan Excel",
    excerpt: "Admin dapat mengunduh rekap panen berdasarkan periode, komoditas, dan wilayah pantau.",
    category: "Laporan",
  },
];

const smartServices = [
  { title: "Data Mitra", description: "Profil petani dan kelompok tani", icon: Users },
  { title: "Hasil Panen", description: "Input dan monitoring produksi", icon: Wheat },
  { title: "Luas Lahan", description: "Wilayah dan lahan aktif", icon: MapPinned },
  { title: "Data Pupuk", description: "Stok subsidi dan non subsidi", icon: Sprout },
  { title: "Penyuluhan", description: "Jadwal dan materi petani", icon: Megaphone },
  { title: "Laporan", description: "Export PDF dan Excel", icon: FileSpreadsheet },
  { title: "Berita", description: "Publikasi informasi dinas", icon: Newspaper },
  { title: "Galeri", description: "Dokumentasi kegiatan", icon: GalleryHorizontalEnd },
];

const categories = [
  { title: "Produksi", icon: Wheat },
  { title: "Ketahanan Pangan", icon: ShieldCheck },
  { title: "Perkebunan", icon: Leaf },
  { title: "Peternakan", icon: Tractor },
  { title: "Penyuluhan", icon: Megaphone },
  { title: "Data Petani", icon: Users },
  { title: "Pupuk", icon: Sprout },
  { title: "Pengumuman", icon: BellRing },
  { title: "Peta Wilayah", icon: MapPinned },
  { title: "Berita", icon: Newspaper },
  { title: "Agenda", icon: CalendarDays },
  { title: "Dokumen", icon: ClipboardList },
];

const agendaItems = [
  {
    day: "16",
    month: "JUN",
    title: "Penyuluhan Teknologi Tanam Padi Modern",
    location: "Balai Penyuluhan Gowa",
    time: "09.00 WITA",
    endTime: "12.00 WITA",
    summary: "Kegiatan penyuluhan lapangan untuk meningkatkan efisiensi air, pemupukan berimbang, dan pencatatan hasil panen digital.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&auto=format&fit=crop&q=80",
  },
  {
    day: "20",
    month: "JUN",
    title: "Verifikasi Data Mitra dan Luas Lahan",
    location: "Kecamatan Maros",
    time: "10.00 WITA",
    endTime: "15.00 WITA",
    summary: "Tim pendataan melakukan validasi profil mitra, luas lahan aktif, dan komoditas utama di wilayah pantau.",
    image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=900&auto=format&fit=crop&q=80",
  },
  {
    day: "24",
    month: "JUN",
    title: "Evaluasi Distribusi Pupuk Bersubsidi",
    location: "Gudang Tahuna",
    time: "13.30 WITA",
    endTime: "16.00 WITA",
    summary: "Koordinasi stok dan penyaluran pupuk untuk menjaga ketersediaan di kios prioritas dan kelompok tani terdaftar.",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=900&auto=format&fit=crop&q=80",
  },
  {
    day: "27",
    month: "JUN",
    title: "Monitoring Produksi Jagung Musim Tanam II",
    location: "Takalar",
    time: "08.30 WITA",
    endTime: "11.30 WITA",
    summary: "Pemantauan produksi jagung dilakukan bersama petugas lapangan untuk memperbarui data panen dan kendala wilayah.",
    image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=900&auto=format&fit=crop&q=80",
  },
  {
    day: "30",
    month: "JUN",
    title: "Rapat Rekap Laporan Produksi Bulanan",
    location: "Kantor Dinas",
    time: "14.00 WITA",
    endTime: "16.30 WITA",
    summary: "Rapat internal untuk menyusun rekap produksi, laporan wilayah, dan kebutuhan ekspor data bulan berjalan.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=80",
  },
];

const partnerLabels = ["PIP", "Kementan", "BPS", "Pemda", "Bulog"];

function MediaPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0f8274] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.18))]" />
      <div className="relative flex h-full min-h-24 items-center justify-center p-5 text-center text-xs font-bold text-white/80">{label}</div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <h2 className="font-[var(--font-sora)] text-2xl font-black text-[#17231d] md:text-3xl">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-[#ff432f]" />
      <p className="mt-4 text-sm leading-7 text-[#66766e]">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <PublicShell navVariant="overlay">
      <main className="bg-[#fbf8f7]">
        <section
          className="relative flex min-h-[100svh] items-center overflow-hidden bg-cover bg-center px-4 pb-20 pt-28 text-white md:px-6"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(30,11,8,0.52),rgba(30,11,8,0.35) 44%,rgba(30,11,8,0.82)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&auto=format&fit=crop&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,67,47,0.40),transparent_32%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,#fbf8f7_88%)]" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center text-center">
            <p className="text-sm font-medium text-white/90">Selamat Datang di Website Resmi</p>
            <h1 className="mt-2 font-[var(--font-sora)] text-4xl font-black uppercase leading-tight tracking-tight md:text-7xl">
              Dinas Pertanian Daerah
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85">
              Portal informasi layanan pertanian, data produksi, berita, agenda, dan dokumentasi kegiatan lapangan.
            </p>

            <form className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-2xl">
              <Search className="ml-4 h-5 w-5 text-slate-400" />
              <input
                type="search"
                placeholder="Cari informasi pertanian, berita, layanan..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-slate-700 outline-none"
              />
              <Button type="submit" className="rounded-full bg-[#ff432f] px-6 hover:bg-[#e73322]">
                Cari
              </Button>
            </form>

            <div className="mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-3">
              {[
                { label: "Mitra Petani", value: "12.840+", icon: Users },
                { label: "Produksi Tercatat", value: "64.490 Ton", icon: Wheat },
                { label: "Laporan Dibuat", value: "156", icon: FileSpreadsheet },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-3xl border border-white/15 bg-white/15 p-5 shadow-2xl backdrop-blur-md">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff432f] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-black">{item.value}</p>
                    <p className="text-xs text-white/75">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative bg-white px-4 pb-16 pt-32 md:px-6">
          <div className="pointer-events-none absolute bottom-28 left-0 hidden h-[860px] w-[860px] -translate-x-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,67,47,0.3)_0%,rgba(255,186,169,0.34)_46%,rgba(255,255,255,0)_76%)] blur-2xl lg:block" />
          <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[410px_1fr] lg:pb-32">
          <aside className="self-start lg:sticky lg:top-32">
            <p className="mb-6 px-1 text-[46px] font-light leading-none tracking-normal text-[#ff432f]" style={{ fontFamily: "var(--font-kalam)" }}>
              Sorotan Berita
            </p>
            <div className="h-[620px] rounded-[2rem] bg-white p-6 shadow-[0_18px_45px_rgba(255,67,47,0.12)]">
              <div className="h-full space-y-0 overflow-y-auto pr-2">
              {headlineNews.concat(headlineNews.slice(0, 2)).map((item, index) => (
                <Link key={`${item.title}-${index}`} href="/berita" className="group flex gap-4 border-b border-dashed border-[#2b2467]/30 py-4 last:border-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#37147d] text-white shadow-md">
                    <Newspaper className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-[#24136b]">Artikel</p>
                      <span className="shrink-0 text-[11px] font-medium text-[#24136b]">14-06-2026</span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[#2f2f37] transition group-hover:text-[#ff432f]">{item.title}</p>
                  </div>
                </Link>
              ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            {headlineNews.slice(0, 4).map((item, index) => (
              <article key={item.title} className="grid min-h-[360px] overflow-hidden rounded-[1.75rem] bg-[#f4eeee] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[300px_1fr]">
                <Link href="/berita" className="block">
                  <MediaPlaceholder label={item.category} className="h-80 rounded-none shadow-none md:h-full" />
                </Link>
                <div className="flex min-h-[360px] flex-col justify-between p-8">
                  <div>
                    <Link href="/berita">
                      <h2 className="font-[var(--font-sora)] text-2xl font-bold leading-snug text-[#2c2d32] transition hover:text-[#ff432f]">
                        {item.title}
                      </h2>
                    </Link>
                    <div className="my-5 h-px bg-slate-300/70" />
                    <p className="line-clamp-4 text-base leading-8 text-[#4b4b52]">{item.excerpt}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#74747a]">
                    <span>Jumat, 14 Juni 2026</span>
                    <span className="h-4 w-px bg-slate-300" />
                    <span>{32 + index * 5} kali dilihat</span>
                    <span className="rounded-md border border-[#ffd4ce] bg-white px-3 py-1 text-xs font-semibold text-[#ff432f]">Berita</span>
                  </div>
                </div>
              </article>
            ))}

            <div className="flex justify-end">
              <Button asChild className="rounded-full bg-[#ff432f] hover:bg-[#e73322]">
                <Link href="/berita">
                  Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          </div>
        </section>

        <section id="layanan" className="bg-white px-4 py-14 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-4">
              {smartServices.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} href="/informasi-pertanian" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#ff432f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-[#17231d]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#66766e]">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#ff432f] px-4 py-24 text-white md:px-6">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/75">Layanan Digital Pertanian</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-[var(--font-sora)] text-3xl font-black md:text-5xl">
              Data petani, panen, pupuk, penyuluhan, berita, dan laporan dalam satu portal.
            </h2>
          </div>
        </section>

        <section className="bg-[#f7f3f2] px-4 py-16 md:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHeading title="Kategori Layanan" description="Akses cepat ke modul informasi publik dan layanan operasional pertanian." />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.title} href="/informasi-pertanian" className="rounded-2xl bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ed] text-[#ff432f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-[#17231d]">{item.title}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative bg-white px-4 py-24 md:px-6">
          <div className="pointer-events-none absolute bottom-4 left-0 hidden h-[760px] w-[760px] -translate-x-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,67,47,0.25)_0%,rgba(255,190,176,0.28)_48%,rgba(255,255,255,0)_76%)] blur-2xl lg:block" />
          <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[410px_1fr]">
            <aside className="relative self-start lg:sticky lg:top-32">
              <p className="text-[42px] font-light leading-none tracking-normal text-[#ff432f] md:text-[48px]" style={{ fontFamily: "var(--font-kalam)" }}>
                Agenda Pertanian
              </p>
              <h2 className="mt-6 max-w-sm font-[var(--font-sora)] text-4xl font-bold leading-tight text-[#2c2d32] md:text-5xl">
                Informasi Agenda Terkini Dinas Pertanian
              </h2>
              <p className="mt-6 max-w-md text-base leading-8 text-[#4b4b52]">
                Temukan jadwal penyuluhan, monitoring produksi, verifikasi data mitra, dan kegiatan pertanian daerah. Mari ikut berpartisipasi!
              </p>
              <Button asChild className="mt-7 rounded-lg bg-[#ff432f] px-6 py-6 text-base hover:bg-[#e73322]">
                <Link href="/informasi-pertanian">
                  Lihat semua agenda
                </Link>
              </Button>
              <svg className="mt-8 hidden h-44 w-56 text-[#ff432f] md:block" viewBox="0 0 230 180" fill="none" aria-hidden="true">
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
              {agendaItems.map((item) => (
                <article
                  key={item.title}
                  className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#ffb7ad] hover:shadow-xl lg:grid-cols-[420px_1fr]"
                >
                  <div className="relative min-h-[345px] lg:min-h-[355px]">
                    <div className="absolute left-0 top-0 z-10 flex items-start gap-4">
                      <span className="mt-1 h-3.5 w-3.5 rounded-full bg-[#ff432f]" />
                      <span className="text-[88px] font-black leading-[0.9] text-[#ff432f]">/</span>
                      <div className="rounded-md border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
                        <p className="text-3xl font-light italic leading-none text-[#ff432f]" style={{ fontFamily: "var(--font-kalam)" }}>
                          {item.day}
                        </p>
                        <p className="mt-1 text-xs font-light italic text-[#ff432f]" style={{ fontFamily: "var(--font-kalam)" }}>
                          {item.month.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-0 left-0 right-0 top-28 overflow-hidden rounded-md bg-cover bg-center shadow-sm"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10" />
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f8274] shadow-sm">
                        Agenda Pertanian
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-[300px] flex-col justify-center px-4 py-7 lg:px-8">
                    <div>
                      <Link href="/informasi-pertanian">
                        <h3 className="font-[var(--font-sora)] text-2xl font-medium uppercase leading-snug text-[#17202a] transition hover:text-[#ff432f] md:text-3xl">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="my-5 flex items-center gap-2">
                        <span className="h-1 w-16 rounded-full bg-[#ffd8d2]" />
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="space-y-3 text-base text-[#1f2937]">
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#ff432f]">📌</span>
                          <span className="font-medium text-[#ff432f]">{item.location}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#ff432f]">⏰</span>
                          <span>
                            <span className="font-semibold">Mulai:</span> Jumat, {item.day} {item.month[0] + item.month.slice(1).toLowerCase()} 2026 {item.time}
                          </span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="mt-0.5 text-[#ff432f]">⏰</span>
                          <span>
                            <span className="font-semibold">Berakhir:</span> Jumat, {item.day} {item.month[0] + item.month.slice(1).toLowerCase()} 2026 {item.endTime}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#fff0ed] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#ff432f]">Agenda</span>
                      <p className="line-clamp-1 text-sm text-[#66766e]">{item.summary}</p>
                    </div>
                  </div>
                </article>
              ))}

              <div className="flex justify-end">
                <Button asChild className="rounded-full bg-[#ff432f] hover:bg-[#e73322]">
                  <Link href="/informasi-pertanian">
                    Lihat Semua Agenda <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-10 md:px-6">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-5">
            {partnerLabels.map((item) => (
              <div key={item} className="flex h-14 items-center justify-center rounded-xl border border-slate-100 bg-white text-sm font-black text-slate-400 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 md:px-6">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#111827] p-5 shadow-2xl">
            <div className="flex flex-col gap-5 rounded-[1.5rem] bg-[#ff432f] p-6 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">Dashboard Admin</p>
                <h2 className="mt-2 font-[var(--font-sora)] text-2xl font-black">Kelola data pertanian dari sistem internal.</h2>
                <p className="mt-2 text-sm text-white/80">Masuk untuk mengelola mitra, panen, pupuk, laporan, berita, agenda, dan galeri.</p>
              </div>
              <Button asChild className="rounded-full bg-white text-[#ff432f] hover:bg-white/90">
                <Link href="/login">
                  Login Admin <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
