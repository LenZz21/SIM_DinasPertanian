"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Camera, ChevronLeft, ChevronRight } from "lucide-react";

const galleryFilters = ["Semua", "Tanaman Pangan", "Hortikultura", "Peternakan", "Penyuluhan"];

const galleryItems = [
  {
    title: "Panen Raya Padi Varietas Unggul",
    category: "Tanaman Pangan",
    date: "25 Mar 2024",
    location: "Sukwono Semeru",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Pelatihan Budidaya Hidroponik",
    category: "Penyuluhan",
    date: "25 Mar 2024",
    location: "Balai Penyuluhan",
    image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Pembinaan Petani Buah Naga",
    category: "Hortikultura",
    date: "25 Mar 2024",
    location: "Kalisat",
    image: "https://images.unsplash.com/photo-1524593166156-312f362cada0?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Panen Buah Naga Kalisat",
    category: "Hortikultura",
    date: "25 Mar 2024",
    location: "Perkebunan Rakyat",
    image: "https://images.unsplash.com/photo-1524593166156-312f362cada0?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Rapat Koordinasi Kelompok Tani",
    category: "Penyuluhan",
    date: "25 Mar 2024",
    location: "Kantor Dinas",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Pendampingan Pertanian Modern",
    category: "Tanaman Pangan",
    date: "25 Mar 2024",
    location: "Lahan Percontohan",
    image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Traktor Baru untuk Kelompok Tani",
    category: "Tanaman Pangan",
    date: "25 Mar 2024",
    location: "Area Persawahan",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Monitoring Sayuran Organik",
    category: "Hortikultura",
    date: "25 Mar 2024",
    location: "Kebun Binaan",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&auto=format&fit=crop&q=80",
  },
  {
    title: "Pemeriksaan Kesehatan Ternak",
    category: "Peternakan",
    date: "25 Mar 2024",
    location: "Sentra Peternakan",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=900&auto=format&fit=crop&q=80",
  },
];

export function PublicGallerySection() {
  const [activeFilter, setActiveFilter] = useState("Semua");

  const visibleItems = useMemo(() => {
    if (activeFilter === "Semua") return galleryItems;
    return galleryItems.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="galeri" className="relative -mt-10 rounded-t-[2.5rem] bg-[#f2eee6] px-4 pb-16 pt-10 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#ff432f]">Arsip Dokumentasi</p>
          <h2 className="font-[var(--font-sora)] text-2xl font-black text-[#25332c]">Galeri Kegiatan</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Pilih kategori untuk melihat dokumentasi kegiatan panen, penyuluhan, hortikultura, peternakan, dan pendampingan lapangan.
          </p>
          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-[#f5b21b]" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div id="galeri-kegiatan">
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-2">
                {galleryFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveFilter(item)}
                    className={`rounded-md px-4 py-2 text-xs font-black uppercase transition ${
                      activeFilter === item
                        ? "bg-[#bf612d] text-white shadow-[0_8px_18px_rgba(191,97,45,0.25)]"
                        : "bg-[#f3eadc] text-[#241d15] hover:bg-[#ead9bf]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between gap-4">
              <h3 className="font-[var(--font-sora)] text-xl font-black uppercase text-[#17130f] md:text-2xl">Dokumentasi Populer</h3>
              <div className="hidden items-center gap-2 sm:flex">
                <button type="button" aria-label="Galeri sebelumnya" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c7ad] text-[#a66a33] transition hover:bg-[#f3eadc]">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Galeri berikutnya" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c7ad] text-[#a66a33] transition hover:bg-[#f3eadc]">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleItems.map((item) => (
                <article key={item.title} className="group">
                  <Link href="/informasi-pertanian" className="block">
                    <div
                      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cover bg-center shadow-sm"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-75 transition group-hover:opacity-45" />
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase text-[#315a34]">
                        <Camera className="h-3 w-3" />
                        {item.category}
                      </div>
                    </div>
                    <h4 className="mt-3 line-clamp-2 min-h-[44px] font-[var(--font-sora)] text-sm font-black leading-snug text-[#17130f] transition group-hover:text-[#bf612d]">
                      {item.title}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#5e6759]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {item.date}
                      </span>
                      <span>{item.location}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
