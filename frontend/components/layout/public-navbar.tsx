"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/informasi-pertanian", label: "Informasi Pertanian" },
  { href: "/berita", label: "Berita" },
  { href: "/profil", label: "Profil Dinas" },
  { href: "/galeri", label: "Galeri" },
  { href: "/agenda", label: "Agenda" },
];

export function PublicNavbar({ variant = "default" }: { variant?: "default" | "overlay" }) {
  const isOverlay = variant === "overlay";
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isOverlay) return;

    const handleScroll = () => setIsScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOverlay]);

  const useTransparentOverlay = isOverlay && !isScrolled;
  const isActiveLink = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        "z-40 transition-all duration-300",
        isOverlay
          ? "fixed inset-x-0 top-4 px-3 md:px-6"
          : "sticky top-0 border-b border-[#d9edf3] bg-white/85 text-[#122018] backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "public-navbar-reveal mx-auto h-20 w-full max-w-[calc(100vw-48px)] transition-all duration-300 md:max-w-[calc(100vw-96px)]",
          isOverlay ? "h-20 rounded-2xl" : "",
          isOverlay && isScrolled ? "bg-white text-[#17231d]" : "",
          useTransparentOverlay ? "bg-transparent text-white shadow-none" : "",
        )}
      >
        <div className="public-navbar-content mx-auto flex h-full w-full max-w-7xl items-center justify-between px-5 md:px-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center">
              <img src="/images/logo-sangihe.png" alt="Logo Kabupaten Kepulauan Sangihe" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className={cn("font-[var(--font-sora)] text-sm font-bold leading-tight md:text-base", useTransparentOverlay ? "text-white" : "text-[#122018]")}>
                Dinas Pertanian
              </p>
              <p className={cn("text-[10px] leading-tight md:text-[11px]", useTransparentOverlay ? "text-white/75" : "text-[#66766e]")}>
                Kab. Kepulauan Sangihe
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((item) => {
              const isActive = isActiveLink(item.href);
              const showUnderline = (hoveredHref === item.href) || (isActive && item.href !== "/" && !hoveredHref);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                  className={cn(
                    "relative pb-2 text-base font-semibold transition after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:origin-left after:rounded-full after:bg-[#0f7d3b] after:transition-transform after:duration-300 hover:after:scale-x-100",
                    showUnderline ? "after:scale-x-100" : "after:scale-x-0",
                    useTransparentOverlay ? "text-white/85 hover:text-white" : "",
                    isOverlay && isScrolled ? "text-[#66766e] hover:text-[#0f7d3b]" : "",
                    !isOverlay ? "text-[#66766e] hover:text-[#0f7d3b]" : "",
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
                "hidden h-11 rounded-full px-7 text-base md:inline-flex",
                isOverlay && isScrolled ? "bg-[#0f7d3b] text-white hover:bg-[#0b6b32]" : "",
                useTransparentOverlay ? "bg-white/15 text-white hover:bg-white/25" : "",
              )}
            >
              <Link href="/login">Login Admin</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full px-3 md:hidden",
                isOverlay && isScrolled ? "border-[#bfe8cc] bg-white text-[#0f7d3b] hover:bg-[#edf5f8]" : "",
                useTransparentOverlay ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "",
                !isOverlay ? "border-[#bde0e9]" : "",
              )}
            >
              <Link href="/login" aria-label="Login Admin">
                <Menu className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
