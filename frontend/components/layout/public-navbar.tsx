"use client";

import Link from "next/link";
import { Leaf, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/informasi-pertanian", label: "Informasi Pertanian" },
  { href: "/berita", label: "Berita" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

export function PublicNavbar({ variant = "default" }: { variant?: "default" | "overlay" }) {
  const isOverlay = variant === "overlay";
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isOverlay) return;

    const handleScroll = () => setIsScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOverlay]);

  const useTransparentOverlay = isOverlay && !isScrolled;
  const isSolid = !isOverlay || isScrolled;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={cn(
        "z-40 transition-all duration-300",
        isOverlay
          ? "fixed inset-x-0 top-4 px-3 md:px-6"
          : "sticky top-0 border-b border-emerald-900/10 bg-white/95 px-3 text-[#122018] shadow-sm backdrop-blur-xl md:px-6",
      )}
    >
      <div
        className={cn(
          "public-navbar-reveal mx-auto w-full max-w-7xl transition-all duration-300",
          isOverlay ? "rounded-2xl border" : "border-x border-transparent",
          isOverlay && isScrolled ? "border-emerald-900/10 bg-white text-[#17231d] shadow-lg shadow-emerald-950/10" : "",
          useTransparentOverlay ? "border-transparent bg-transparent text-white shadow-none" : "",
        )}
      >
        <div className="public-navbar-content flex h-[76px] items-center justify-between px-4 md:h-[84px] md:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsMobileOpen(false)}>
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors md:h-14 md:w-14",
                isOverlay && isScrolled ? "bg-[#fff0ed] text-[#ff432f]" : "",
                useTransparentOverlay ? "bg-transparent text-white" : "",
                !isOverlay ? "bg-emerald-50 text-emerald-700" : "",
              )}
            >
              <Leaf className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className={cn("truncate font-[var(--font-sora)] text-base font-black leading-tight md:text-lg", useTransparentOverlay ? "text-white" : "text-[#122018]")}>
                SIM Dinas Pertanian
              </p>
              <p className={cn("truncate text-[11px] leading-tight md:text-xs", useTransparentOverlay ? "text-white/75" : "text-[#66766e]")}>Smart Farming Platform</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full bg-transparent lg:flex">
            {links.map((item) => {
              const active = isActive(item.href);

              return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2.5 text-sm font-bold transition md:text-base",
                  useTransparentOverlay ? "text-white/85 hover:text-white" : "",
                  isSolid ? "text-[#66766e] hover:bg-emerald-50 hover:text-emerald-700" : "",
                  active && useTransparentOverlay ? "text-white" : "",
                  active && isSolid ? "bg-emerald-50 text-emerald-700" : "",
                )}
              >
                {item.label}
              </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className={cn(
                "hidden h-12 rounded-full px-7 text-base font-bold lg:inline-flex",
                isSolid ? "bg-emerald-700 text-white hover:bg-emerald-800" : "",
                useTransparentOverlay ? "bg-transparent text-white shadow-none hover:bg-white/10" : "",
              )}
            >
              <Link href="/login">Login Admin</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen((open) => !open)}
              aria-expanded={isMobileOpen}
              aria-label="Buka menu navigasi"
              className={cn(
                "h-11 w-11 rounded-full p-0 lg:hidden",
                isSolid ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "",
                useTransparentOverlay ? "bg-transparent text-white hover:bg-white/10" : "",
              )}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileOpen ? (
          <div
            className={cn(
              "mx-3 mb-3 rounded-2xl border p-3 shadow-lg lg:hidden",
              useTransparentOverlay ? "border-white/15 bg-black/25" : "border-emerald-900/10 bg-white",
            )}
          >
            <nav className="grid gap-1">
              {links.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-bold transition",
                      useTransparentOverlay ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-[#66766e] hover:bg-emerald-50 hover:text-emerald-700",
                      active && useTransparentOverlay ? "text-white" : "",
                      active && !useTransparentOverlay ? "bg-emerald-50 text-emerald-700" : "",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "mt-2 rounded-xl px-4 py-3 text-center text-sm font-black transition",
                  useTransparentOverlay ? "bg-white/10 text-white hover:bg-white/20" : "bg-emerald-700 text-white hover:bg-emerald-800",
                )}
              >
                Login Admin
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
