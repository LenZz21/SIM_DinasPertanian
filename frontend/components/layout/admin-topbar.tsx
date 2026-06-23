"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  FaBars,
  FaBell,
  FaCircleCheck,
  FaCommentDots,
  FaMagnifyingGlass,
  FaMoon,
  FaRightFromBracket,
  FaSun,
} from "react-icons/fa6";
import { logout } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { toast } from "sonner";

const SEARCH_TARGETS: Array<{ href: string; keywords: string[] }> = [
  { href: "/admin/mitra", keywords: ["mitra", "petani", "partner"] },
  { href: "/admin/hasil", keywords: ["hasil", "panen", "produksi"] },
  { href: "/admin/luas-lahan", keywords: ["lahan", "wilayah", "area"] },
  { href: "/admin/data-ternak", keywords: ["ternak", "sapi", "hewan"] },
  { href: "/admin/data-pupuk", keywords: ["pupuk", "urea", "stok"] },
  { href: "/admin/penyuluhan", keywords: ["penyuluhan", "jadwal"] },
  { href: "/admin/laporan", keywords: ["laporan", "export", "excel", "pdf"] },
  { href: "/admin/monitoring", keywords: ["monitoring", "grafik", "statistik"] },
  { href: "/admin/notifikasi", keywords: ["notifikasi", "alert"] },
  { href: "/admin/pengguna", keywords: ["pengguna", "user", "akun"] },
  { href: "/admin/berita", keywords: ["berita", "informasi"] },
  { href: "/admin/galeri", keywords: ["galeri", "foto", "gambar"] },
];

function resolveSearchRoute(query: string) {
  const q = query.toLowerCase();
  const exact = SEARCH_TARGETS.find((target) => target.keywords.some((keyword) => q.includes(keyword)));
  return exact?.href ?? "/admin/pencarian";
}

export function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggleTheme, notifications, markNotificationRead } = useUIStore();

  const [searchText, setSearchText] = useState("");
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(event.target as Node)) {
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenNotif(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore expired token
    } finally {
      clearAuth();
      router.push("/login");
      toast.success("Logout berhasil");
    }
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const query = searchText.trim();

    if (!query) {
      toast.info("Masukkan kata kunci pencarian");
      return;
    }

    const target = resolveSearchRoute(query);
    router.push(`${target}?q=${encodeURIComponent(query)}`);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(theme === "dark" ? "Mode terang aktif" : "Mode gelap aktif");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 shrink-0 border-b border-slate-200 bg-white/95 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:left-64">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="text-slate-600 dark:text-slate-300 md:hidden"
            type="button"
            aria-label="Dashboard"
            onClick={() => router.push("/admin")}
          >
            <FaBars className="text-lg" />
          </button>
          <div className="hidden flex-col sm:flex">
            <span className="text-xs text-slate-400 dark:text-slate-500">Selamat Datang,</span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-100">
              {user?.name ?? "Administrator"}
              <FaCircleCheck className="text-xs text-emerald-500" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <form onSubmit={handleSearchSubmit} className="relative hidden w-64 md:block">
            <input
              type="text"
              placeholder="Cari data, laporan, petani, dll..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-full border border-transparent bg-slate-100 py-2 pl-4 pr-10 text-xs text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-600"
            />
            <button type="submit" className="absolute right-3.5 top-2.5 text-xs text-slate-400 dark:text-slate-400" aria-label="Cari">
              <FaMagnifyingGlass />
            </button>
          </form>

          <div className="flex items-center gap-4 text-base text-slate-500 dark:text-slate-300">
            <div className="relative" ref={notifRef}>
              <button type="button" className="relative cursor-pointer" onClick={() => setOpenNotif((prev) => !prev)} aria-label="Notifikasi">
                <FaBell />
                {unreadCount > 0 ? <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500" /> : null}
              </button>

              {openNotif ? (
                <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">Notifikasi</p>
                    <button
                      type="button"
                      className="text-xs font-medium text-emerald-600 hover:underline"
                      onClick={() => router.push("/admin/notifikasi")}
                    >
                      Lihat semua
                    </button>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {notifications.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(item.id);
                          router.push(item.href);
                        }}
                        className="w-full rounded-lg border border-slate-100 p-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-100">{item.title}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{item.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="relative cursor-pointer"
              onClick={() => router.push("/admin/berita")}
              aria-label="Pesan"
            >
              <FaCommentDots />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500" />
            </button>

            <button type="button" className="cursor-pointer" onClick={handleToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            <button
              type="button"
              className="flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-slate-700"
              onClick={() => router.push("/admin/pengaturan/akun")}
            >
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
                alt="Avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden leading-tight lg:block">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-100">{user?.name ?? "Administrator"}</p>
                <p className="text-[10px] text-slate-400">{user?.roles?.[0] ?? "Admin Dinas"}</p>
              </div>
            </button>

            <button type="button" onClick={handleLogout} className="cursor-pointer text-slate-500 dark:text-slate-300" aria-label="Logout">
              <FaRightFromBracket />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
