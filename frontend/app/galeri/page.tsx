import { GalleryHorizontalEnd } from "lucide-react";
import { PublicGallerySection } from "@/components/gallery/public-gallery-section";
import { PublicShell } from "@/components/layout/public-shell";

export default function GalleryPage() {
  return (
    <PublicShell navVariant="overlay">
      <main className="bg-[#edf5f8]">
        <section
          className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-cover bg-center px-4 text-center text-white md:min-h-[470px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(9,24,15,0.36),rgba(9,24,15,0.66)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&auto=format&fit=crop&q=85')",
          }}
        >
          <div className="relative">
            <h1 className="font-[var(--font-sora)] text-4xl font-black md:text-6xl">Galeri Pertanian</h1>
            <p className="mt-4 text-sm font-medium text-white/85 md:text-base">Dokumentasi kegiatan lapangan, panen, penyuluhan, dan layanan pertanian daerah.</p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <GalleryHorizontalEnd className="h-4 w-4 text-[#25576a]" />
              <span className="text-[#0f7d3b]">Galeri Digital</span>
            </div>
          </div>
        </section>

        <PublicGallerySection />
      </main>
    </PublicShell>
  );
}
