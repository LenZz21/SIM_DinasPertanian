import { PublicFooter } from "@/components/layout/public-footer";
import { PublicPageAnimations } from "@/components/layout/public-page-animations";
import { PublicNavbar } from "@/components/layout/public-navbar";

export function PublicShell({ children, navVariant = "default" }: { children: React.ReactNode; navVariant?: "default" | "overlay" }) {
  return (
    <div data-public-page className="min-h-screen">
      <PublicPageAnimations />
      <PublicNavbar variant={navVariant} />
      {children}
      <PublicFooter />
    </div>
  );
}
