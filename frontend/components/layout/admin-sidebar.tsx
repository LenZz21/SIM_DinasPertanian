"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBell,
  FaChartLine,
  FaChalkboardUser,
  FaChevronDown,
  FaCow,
  FaFileInvoiceDollar,
  FaGear,
  FaImage,
  FaJar,
  FaLeaf,
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
  { href: "/admin/penyuluhan", label: "Penyuluhan", icon: FaChalkboardUser },
  { href: "/admin/berita", label: "Berita", icon: FaNewspaper },
  { href: "/admin/galeri", label: "Galeri", icon: FaImage },
  { href: "/admin/struktur-pegawai", label: "Struktur Pegawai", icon: FaSitemap },
  {
    href: "/admin/laporan",
    label: "Laporan & Export",
    icon: FaFileInvoiceDollar,
    children: [
      { href: "/admin/laporan?section=preview", label: "Preview Laporan" },
      { href: "/admin/laporan?section=rekap", label: "Rekap Panen" },
      { href: "/admin/laporan?section=pdf", label: "Export PDF" },
      { href: "/admin/laporan?section=excel", label: "Export Excel" },
    ],
  },
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

function SidebarLink({ item, active }: { item: MenuItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
        active
          ? "bg-emerald-800/60 text-white font-medium"
          : "text-slate-300 hover:bg-emerald-900/40 hover:text-white",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-emerald-300" : "text-slate-300")} />
      <span className="truncate">{item.label}</span>
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
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition",
          active ? "bg-emerald-800/60 font-medium text-white" : "text-slate-300 hover:bg-emerald-900/40 hover:text-white",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-emerald-300" : "text-slate-300")} />
        <span className="truncate">{item.label}</span>
        <FaChevronDown className={cn("ml-auto h-3 w-3 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen ? (
        <div className="ml-6 mt-1 space-y-1 border-l border-emerald-800/70 pl-3">
          <Link
            href={item.href}
            className="block rounded-md px-3 py-2 text-xs text-slate-300 transition hover:bg-emerald-900/40 hover:text-white"
          >
            Semua Laporan
          </Link>
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block rounded-md px-3 py-2 text-xs text-slate-300 transition hover:bg-emerald-900/40 hover:text-white"
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 shrink-0 flex-col bg-[#0a2e1d] text-slate-300 md:flex">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-emerald-900/50 p-5">
          <div className="rounded-xl bg-emerald-500 p-2 text-white">
            <FaLeaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="leading-tight font-bold tracking-wide text-white">SIM PERTANIAN</h1>
            <p className="text-[10px] text-emerald-400">Dinas Pertanian Daerah</p>
          </div>
        </div>

        <div className="px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-500">Menu Utama</p>
          <nav className="space-y-1">
            {primaryMenus.map((item) => (
              <SidebarGroup key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </nav>
        </div>

        <div className="border-t border-emerald-900/50 px-3 py-2">
          <p className="mb-2 mt-2 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-500">Pengaturan</p>
          <nav className="space-y-1">
            {settingsMenus.map((item) => (
              <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-emerald-900/50 bg-[#072215] p-4">
        <div className="flex items-center gap-3">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
            alt="Admin"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border-2 border-emerald-500 object-cover"
          />
          <div>
            <h4 className="text-xs font-semibold text-white">Administrator</h4>
            <p className="text-[10px] text-slate-400">Admin Dinas</p>
          </div>
        </div>
        <Link href="/admin/pengaturan/akun" className="text-xs text-slate-400">
          <FaChevronDown className="cursor-pointer" />
        </Link>
      </div>
    </aside>
  );
}
