"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBell,
  FaCalendarDays,
  FaChartLine,
  FaChevronDown,
  FaCow,
  FaFileInvoiceDollar,
  FaGear,
  FaImage,
  FaJar,
  FaLock,
  FaMapLocationDot,
  FaNewspaper,
  FaSitemap,
  FaSliders,
  FaTableColumns,
  FaUserGear,
  FaUsers,
  FaWheatAwn,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";

type MenuItem = {
  href: string;
  label: string;
  icon: IconType;
  children?: Array<{
    href: string;
    label: string;
  }>;
};

const primaryMenus: MenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: FaTableColumns },
  { href: "/admin/mitra", label: "Data Mitra / Petani", icon: FaUsers },
  { href: "/admin/hasil", label: "Hasil Pertanian", icon: FaWheatAwn },
  { href: "/admin/luas-lahan", label: "Luas Lahan", icon: FaMapLocationDot },
  { href: "/admin/data-ternak", label: "Data Ternak", icon: FaCow },
  { href: "/admin/data-pupuk", label: "Data Pupuk", icon: FaJar },
  { href: "/admin/agenda", label: "Agenda", icon: FaCalendarDays },
  { href: "/admin/berita", label: "Berita", icon: FaNewspaper },
  { href: "/admin/galeri", label: "Galeri", icon: FaImage },
  { href: "/admin/profil-dinas", label: "Profil Dinas", icon: FaSitemap },
  { href: "/admin/struktur-pegawai", label: "Struktur Pegawai", icon: FaUsers },
  { href: "/admin/laporan", label: "Laporan & Export", icon: FaFileInvoiceDollar },
  { href: "/admin/monitoring", label: "Monitoring Produksi", icon: FaChartLine },
  { href: "/admin/notifikasi", label: "Notifikasi", icon: FaBell },
  { href: "/admin/pengguna", label: "Pengguna", icon: FaUserGear },
];

const settingsMenus: MenuItem[] = [
  { href: "/admin/pengaturan/akun", label: "Pengaturan Akun", icon: FaSliders },
  { href: "/admin/pengaturan/password", label: "Ganti Password", icon: FaLock },
  { href: "/admin/pengaturan/sistem", label: "Pengaturan Sistem", icon: FaGear },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const activeSidebarItemClass =
  "admin-sidebar-active-in -mr-5 rounded-l-full rounded-r-none pr-8 font-semibold text-[#25576a] before:pointer-events-none before:absolute before:right-0 before:-top-8 before:z-0 before:h-8 before:w-8 before:rounded-full before:bg-transparent before:shadow-[22px_22px_0_8px_#edf5f8] after:pointer-events-none after:absolute after:right-0 after:-bottom-8 after:z-0 after:h-8 after:w-8 after:rounded-full after:bg-transparent after:shadow-[22px_-22px_0_8px_#edf5f8]";

function SidebarLink({ item, active }: { item: MenuItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative isolate flex items-center gap-3 px-3 py-2.5 text-sm transition",
        active ? activeSidebarItemClass : "text-[#d9edf3] hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon className={cn("relative z-10 h-4 w-4 shrink-0", active ? "text-[#25576a]" : "text-[#d9edf3]")} />
      <span className="relative z-10 truncate">{item.label}</span>
      {item.children ? <FaChevronDown className="ml-auto h-3 w-3" /> : null}
    </Link>
  );
}

function SidebarGroup({ item, active }: { item: MenuItem; active: boolean }) {
  const [isOpen, setIsOpen] = useState(active);
  const Icon = item.icon;

  useEffect(() => {
    if (active) setIsOpen(true);
  }, [active]);

  if (!item.children) {
    return <SidebarLink item={item} active={active} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative isolate flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition",
          active ? activeSidebarItemClass : "rounded-full text-[#d9edf3] hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon className={cn("relative z-10 h-4 w-4 shrink-0", active ? "text-[#25576a]" : "text-[#d9edf3]")} />
        <span className="relative z-10 truncate">{item.label}</span>
        <FaChevronDown className={cn("relative z-10 ml-auto h-3 w-3 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen ? (
        <div className="ml-6 mt-1 space-y-1 border-l border-white/20 pl-3">
          <Link
            href={item.href}
            className="block rounded-full px-3 py-2 text-xs text-[#d9edf3] transition hover:bg-white/10 hover:text-white"
          >
            Semua Laporan
          </Link>
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block rounded-full px-3 py-2 text-xs text-[#d9edf3] transition hover:bg-white/10 hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 shrink-0 flex-col bg-[#25576a] text-[#d9edf3] md:flex">
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <Image
              src="/images/logo-sangihe.png"
              alt="Logo Kabupaten Kepulauan Sangihe"
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="leading-tight font-bold tracking-wide text-white">DINAS PERTANIAN</h1>
            <p className="text-[10px] text-[#bde0e9]">Kab. Kepulauan Sangihe</p>
          </div>
        </div>

        <div className="px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#9fd0dc]">Menu Utama</p>
          <nav className="space-y-3 pr-1">
            {primaryMenus.map((item) => (
              <SidebarGroup key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 px-3 py-2">
          <p className="mb-2 mt-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#9fd0dc]">Pengaturan</p>
          <nav className="space-y-3 pr-1">
            {settingsMenus.map((item) => (
              <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-[#1f4c5d] p-4">
        <div className="flex items-center gap-3">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
            alt="Admin"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border-2 border-white/70 object-cover"
          />
          <div>
            <h4 className="text-xs font-semibold text-white">Administrator</h4>
            <p className="text-[10px] text-[#bde0e9]">Admin Dinas</p>
          </div>
        </div>
        <Link href="/admin/pengaturan/akun" className="text-xs text-[#d9edf3]">
          <FaChevronDown className="cursor-pointer" />
        </Link>
      </div>
    </aside>
  );
}
