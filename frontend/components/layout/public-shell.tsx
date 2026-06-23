import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export function PublicShell({ children, navVariant = "default" }: { children: React.ReactNode; navVariant?: "default" | "overlay" }) {
  return (
    <div className="min-h-screen">
      <PublicNavbar variant={navVariant} />
      {children}
      <PublicFooter />
    </div>
  );
}
