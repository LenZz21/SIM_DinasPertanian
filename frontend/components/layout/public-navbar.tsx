"use client";

import Link from "next/link";
import { Leaf, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/informasi-pertanian", label: "Informasi Pertanian" },
  { href: "/berita", label: "Berita" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
];

export function PublicNavbar({ variant = "default" }: { variant?: "default" | "overlay" }) {
  const isOverlay = variant === "overlay";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isOverlay) return;

    const handleScroll = () => setIsScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOverlay]);

  const useTransparentOverlay = isOverlay && !isScrolled;

  return (
    <header
      className={cn(
        "z-40 transition-all duration-300",
        isOverlay
          ? "fixed inset-x-0 top-4 px-3 md:px-6"
          : "sticky top-0 border-b border-emerald-900/10 bg-white/85 text-[#122018] backdrop-blur-xl",
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
            <div
              className={cn(
                "rounded-2xl p-3.5 transition-colors",
                isOverlay && isScrolled ? "bg-[#fff0ed] text-[#ff432f]" : "",
                useTransparentOverlay ? "bg-white/15 text-white" : "",
                !isOverlay ? "bg-emerald-50 text-emerald-700" : "",
              )}
            >
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className={cn("font-[var(--font-sora)] text-base font-bold", useTransparentOverlay ? "text-white" : "text-[#122018]")}>SIM Dinas Pertanian</p>
              <p className={cn("text-[11px]", useTransparentOverlay ? "text-white/75" : "text-[#66766e]")}>Smart Farming Platform</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-semibold transition",
                  useTransparentOverlay ? "text-white/85 hover:text-white" : "",
                  isOverlay && isScrolled ? "text-[#66766e] hover:text-[#ff432f]" : "",
                  !isOverlay ? "text-[#66766e] hover:text-emerald-700" : "",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className={cn(
                "hidden h-11 rounded-full px-7 text-base md:inline-flex",
                isOverlay && isScrolled ? "bg-[#ff432f] text-white hover:bg-[#e73322]" : "",
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
                isOverlay && isScrolled ? "border-[#ffddd7] bg-white text-[#ff432f] hover:bg-[#fff0ed]" : "",
                useTransparentOverlay ? "border-white/30 bg-white/10 text-white hover:bg-white/20" : "",
                !isOverlay ? "border-emerald-200" : "",
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
