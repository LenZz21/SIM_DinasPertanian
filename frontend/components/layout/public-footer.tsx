import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Beranda" },
  { href: "/informasi-pertanian", label: "Informasi Pertanian" },
  { href: "/berita", label: "Berita" },
  { href: "/profil", label: "Profil Dinas" },
  { href: "/agenda", label: "Agenda" },
];

const services = ["Selayang Pandang", "Visi Dinas", "Misi Dinas", "Sambutan Kepala Dinas"];

export function PublicFooter() {
  return (
    <footer className="bg-[#1f4958] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="rounded-2xl bg-[#25576a] p-6 text-white shadow-sm md:flex md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Akses Dashboard</p>
            <h4 className="mt-2 font-[var(--font-sora)] text-xl font-black">Kelola layanan pertanian daerah secara digital.</h4>
          </div>
          <Link href="/login" className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold text-[#25576a] md:mt-0">
            Login Admin
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.25fr_0.75fr_0.75fr_1fr] md:px-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center">
              <img src="/images/logo-sangihe.png" alt="Logo Kabupaten Kepulauan Sangihe" className="h-full w-full object-contain" />
            </div>
            <div>
              <h4 className="font-[var(--font-sora)] text-base font-semibold text-white">Dinas Pertanian</h4>
              <p className="text-xs text-slate-400">Kabupaten Kepulauan Sangihe</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-slate-400">
            Sistem informasi untuk pengelolaan data mitra, hasil panen, penyuluhan, galeri, berita, dan laporan pertanian daerah.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white">Tautan Cepat</h5>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white">Profil Dinas</h5>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white">Kontak</h5>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9fd0dc]" />
              Jl. Pangan Nusantara No. 12
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#9fd0dc]" />
              dinas@pertanian.go.id
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#9fd0dc]" />
              (0411) 123-456
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-slate-400 md:px-6">
          <p>© 2026 Dinas Pertanian Kabupaten Kepulauan Sangihe. Semua hak dilindungi.</p>
          <Link href="#" className="hover:text-white">
            Kembali ke atas
          </Link>
        </div>
      </div>
    </footer>
  );
}
