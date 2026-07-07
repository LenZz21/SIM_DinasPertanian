"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Camera, ChevronLeft, ChevronRight, ImageIcon, Loader2, Minus, Plus, X } from "lucide-react";
import { getPublicGalleryItems } from "@/lib/api/public";
import type { GalleryAlbum, GalleryItem } from "@/lib/types/api";

function formatDate(value?: string | null) {
  if (!value) return "Tanggal belum diisi";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function PublicGallerySection() {
  const [items, setItems] = useState<GalleryAlbum[]>([]);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef({ active: false, x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    setIsLoading(true);

    getPublicGalleryItems({ per_page: 60 })
      .then((response) => setItems(response.data))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const galleryFilters = useMemo(() => {
    const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ["Semua", ...categories];
  }, [items]);

  const visibleItems = useMemo(() => {
    if (activeFilter === "Semua") return items;
    return items.filter((item) => item.category === activeFilter);
  }, [activeFilter, items]);

  const currentPhoto = lightboxIndex !== null ? selectedAlbum?.photos[lightboxIndex] : null;

  function closeLightbox() {
    setLightboxIndex(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function movePhoto(direction: 1 | -1) {
    if (!selectedAlbum?.photos.length || lightboxIndex === null) return;

    const total = selectedAlbum.photos.length;
    setLightboxIndex((lightboxIndex + direction + total) % total);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLImageElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      active: true,
      x: event.clientX,
      y: event.clientY,
      startX: offset.x,
      startY: offset.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLImageElement>) {
    if (!dragState.current.active) return;

    setOffset({
      x: dragState.current.startX + event.clientX - dragState.current.x,
      y: dragState.current.startY + event.clientY - dragState.current.y,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLImageElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragState.current.active = false;
  }

  return (
    <section id="galeri" className="relative -mt-10 rounded-t-[2.5rem] bg-[#edf5f8] px-4 pb-20 pt-12 md:px-6">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-[#0f7d3b]">Arsip Dokumentasi</p>
          <h2 className="font-[var(--font-sora)] text-3xl font-black text-[#25332c] md:text-4xl">Galeri Kegiatan</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-500">
            Dokumentasi kegiatan yang diunggah dari dashboard admin galeri.
          </p>
          <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#9fd0dc]" />
        </div>

        <div className="min-h-[720px] rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          {isLoading ? (
            <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500">
              <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#25576a]" />
              Memuat galeri...
            </div>
          ) : items.length > 0 ? (
            <div id="galeri-kegiatan">
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {galleryFilters.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActiveFilter(item)}
                      className={`rounded-lg px-5 py-3 text-sm font-black uppercase transition ${
                        activeFilter === item
                          ? "bg-[#0f7d3b] text-white shadow-sm"
                          : "bg-[#edf5f8] text-[#241d15] hover:bg-[#d9edf3]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-14">
                <h3 className="font-[var(--font-sora)] text-2xl font-black uppercase text-[#17130f] md:text-3xl">Dokumentasi Terbaru</h3>
              </div>

              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <article key={item.id} className="group">
                    <button
                      type="button"
                      onClick={() => setSelectedAlbum(item)}
                      className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 text-left shadow-sm"
                    >
                      {item.cover_url ? (
                        <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#9ad8b3,#7ec5a0,#4ba973)] text-white">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-75 transition group-hover:opacity-45" />
                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase text-[#315a34]">
                        <Camera className="h-3.5 w-3.5" />
                        {item.category}
                      </div>
                      <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-1.5 text-sm font-bold text-white">
                        {item.photos_count} foto
                      </div>
                    </button>
                    <h4 className="mt-4 line-clamp-2 min-h-[56px] font-[var(--font-sora)] text-lg font-black leading-snug text-[#17130f]">
                      {item.title}
                    </h4>
                    {item.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.description}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-[#5e6759]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(item.taken_at ?? item.created_at)}
                      </span>
                      <span>{item.uploaded_by ?? "Admin"}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center">
              <ImageIcon className="mb-3 h-10 w-10 text-[#25576a]" />
              <h3 className="font-[var(--font-sora)] text-lg font-black text-[#17130f]">Belum ada dokumentasi galeri</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Foto yang ditambahkan dari halaman admin Galeri akan tampil otomatis di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedAlbum && lightboxIndex === null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#25576a]">{selectedAlbum.category}</p>
                <h3 className="mt-2 font-[var(--font-sora)] text-2xl font-black text-[#17130f]">{selectedAlbum.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedAlbum.photos_count} foto dalam album</p>
              </div>
              <button type="button" onClick={() => setSelectedAlbum(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedAlbum.description ? <p className="mt-4 text-sm leading-6 text-slate-600">{selectedAlbum.description}</p> : null}

            {selectedAlbum.photos.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedAlbum.photos.map((photo: GalleryItem, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {photo.image_url ? (
                      <img src={photo.image_url} alt={photo.title} className="h-52 w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-[linear-gradient(145deg,#9ad8b3,#7ec5a0,#4ba973)] text-white">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                Album ini belum memiliki foto.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {selectedAlbum && currentPhoto ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/75 p-4 backdrop-blur-md">
          <button type="button" onClick={closeLightbox} className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white">
            <X className="h-5 w-5" />
          </button>

          <div className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 p-1 shadow-sm">
            <button type="button" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-16 text-center text-sm font-bold text-slate-800">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button type="button" onClick={() => movePhoto(-1)} className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button type="button" onClick={() => movePhoto(1)} className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white">
            <ChevronRight className="h-6 w-6" />
          </button>

          <img
            src={currentPhoto.image_url ?? ""}
            alt={currentPhoto.title}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="max-h-[82vh] max-w-[88vw] cursor-grab select-none object-contain active:cursor-grabbing"
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: dragState.current.active ? "none" : "transform 150ms ease",
            }}
          />

          <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white">
            {(lightboxIndex ?? 0) + 1} / {selectedAlbum.photos.length}
          </div>
        </div>
      ) : null}
    </section>
  );
}
