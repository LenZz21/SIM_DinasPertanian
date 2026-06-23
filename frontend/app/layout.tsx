import type { Metadata } from "next";
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${sora.variable} ${kalam.variable} min-h-screen font-[var(--font-plus-jakarta)]`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
