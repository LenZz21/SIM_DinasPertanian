import type { Metadata } from "next";
import Script from "next/script";
import { Kalam, Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
});

export const metadata: Metadata = {
  title: "Sistem Informasi Manajemen Dinas Pertanian",
  description: "Platform modern smart farming untuk Dinas Pertanian",
  icons: {
    icon: "/images/logo-sangihe.png",
    shortcut: "/images/logo-sangihe.png",
    apple: "/images/logo-sangihe.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${sora.variable} ${kalam.variable} min-h-screen font-[var(--font-plus-jakarta)]`}>
        <Script
          id="reset-scroll-on-refresh"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ("scrollRestoration" in history) {
                history.scrollRestoration = "manual";
              }

              window.addEventListener("beforeunload", function () {
                window.scrollTo(0, 0);
              });
            `,
          }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
