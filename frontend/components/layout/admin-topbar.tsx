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
  { href: "/admin/agenda", keywords: ["agenda", "jadwal", "kegiatan"] },
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
  const visibleNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

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
    <header className="fixed left-0 right-0 top-0 z-50 h-[76px] shrink-0 border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/90 md:left-64 md:px-6">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:hidden"
            type="button"
            aria-label="Dashboard"
            onClick={() => router.push("/admin")}
          >
            <FaBars className="text-lg" />
          </button>
          <div className="hidden flex-col sm:flex">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Selamat Datang,</span>
            <span className="flex items-center gap-1.5 font-[var(--font-sora)] text-base font-bold text-slate-700 dark:text-slate-100">
              {user?.name ?? "Administrator"}
              <FaCircleCheck className="text-xs text-emerald-500" />
            </span>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <form onSubmit={handleSearchSubmit} className="relative hidden w-[280px] lg:block xl:w-[360px]">
            <input
              type="text"
              placeholder="Cari data, laporan, petani, dll..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-slate-50/90 py-2 pl-5 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-200 focus:bg-white focus:shadow-[0_12px_30px_rgba(15,125,59,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-800"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-2 text-sm text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Cari">
              <FaMagnifyingGlass />
            </button>
          </form>

          <div className="flex items-center gap-2 text-base text-slate-500 dark:text-slate-300 md:gap-3">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-transparent transition hover:border-slate-200 hover:bg-slate-50 hover:text-emerald-700 dark:hover:border-slate-800 dark:hover:bg-slate-900"
                onClick={() => setOpenNotif((prev) => !prev)}
                aria-label="Notifikasi"
              >
                <FaBell />
                {unreadCount > 0 ? (
                  <span className="absolute right-2.5 top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>

              {openNotif ? (
                <div className="absolute right-0 z-50 mt-4 w-[22rem] max-w-[calc(100vw-32px)] rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-[var(--font-sora)] text-sm font-bold text-slate-800 dark:text-slate-100">Notifikasi</p>
                      <p className="text-xs text-slate-400">{unreadCount} belum dibaca</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      onClick={() => router.push("/admin/notifikasi")}
                    >
                      Lihat semua
                    </button>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {visibleNotifications.length ? (
                      visibleNotifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(item.id);
                            router.push(item.href);
                          }}
                          className="flex w-full items-start gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-emerald-100 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.read ? "bg-slate-300" : "bg-emerald-500"}`} />
                          <span>
                            <span className="block text-xs font-semibold leading-5 text-slate-700 dark:text-slate-100">{item.title}</span>
                            <span className="mt-1 block text-[10px] text-slate-400">{item.time}</span>
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-800">Belum ada notifikasi baru</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-transparent transition hover:border-slate-200 hover:bg-slate-50 hover:text-emerald-700 dark:hover:border-slate-800 dark:hover:bg-slate-900"
              onClick={() => router.push("/admin/berita")}
              aria-label="Pesan"
            >
              <FaCommentDots />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
            </button>

            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-transparent transition hover:border-slate-200 hover:bg-slate-50 hover:text-emerald-700 dark:hover:border-slate-800 dark:hover:bg-slate-900"
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>

            <button
              type="button"
              className="ml-1 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              onClick={() => router.push("/admin/pengaturan/akun")}
            >
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
                alt="Avatar"
                width={32}
                height={32}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-100"
              />
              <div className="hidden leading-tight lg:block">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{user?.name ?? "Administrator"}</p>
                <p className="text-[11px] text-slate-400">{user?.roles?.[0] ?? "Admin Dinas"}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/30"
              aria-label="Logout"
            >
              <FaRightFromBracket />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
