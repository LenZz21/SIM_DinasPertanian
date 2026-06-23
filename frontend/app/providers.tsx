"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useUIStore } from "@/lib/stores/ui-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const initUI = useUIStore((state) => state.initUI);

  useEffect(() => {
    initUI();
  }, [initUI]);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
