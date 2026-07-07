"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Leaf, PenLine, Quote } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { getPublicDepartmentProfile, getPublicGreeting } from "@/lib/api/public";
import type { DepartmentProfile, OfficialGreeting } from "@/lib/types/api";

const fallbackGreetingPhoto =
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=1100&auto=format&fit=crop&q=80";

const fallbackGreeting: OfficialGreeting = {
  id: 0,
  name: "Drs. Nama Kepala Dinas",
  position: "Kepala Dinas Pertanian",
  institution: "Kabupaten Kepulauan Sangihe",
  photo_url: null,
  detail_url: "/profil/sambutan-kepala-dinas",
  paragraphs: [
    "Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas dedikasi dan kerja keras seluruh insan pertanian dalam membangun layanan yang lebih terbuka, responsif, dan berdampak.",
    "Dinas Pertanian berkomitmen untuk terus mendorong kemajuan sektor pertanian melalui pelayanan publik yang prima, inovasi teknologi, serta penguatan kolaborasi bersama petani dan pemangku kepentingan.",
    "Bersama, kita wujudkan pertanian yang maju, mandiri, modern, dan berkelanjutan demi kesejahteraan petani serta ketahanan pangan daerah.",
  ],
  is_active: true,
  updated_at: null,
};

const fallbackDepartmentProfile: DepartmentProfile = {
  id: 0,
  overview: fallbackGreeting.paragraphs.join("\n"),
  vision: "Terwujudnya pertanian daerah yang maju, mandiri, modern, berdaya saing, dan berkelanjutan.",
  missions: [],
  is_active: true,
  updated_at: null,
};

function toParagraphs(value?: string | null, fallback: string[] = []) {
  const paragraphs = value
    ?.split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return paragraphs?.length ? paragraphs : fallback;
}

export default function SambutanKepalaDinasPage() {
  const [greeting, setGreeting] = useState<OfficialGreeting>(fallbackGreeting);
  const [departmentProfile, setDepartmentProfile] = useState<DepartmentProfile>(fallbackDepartmentProfile);

  useEffect(() => {
    getPublicGreeting()
      .then((response) => {
        if (response.data) {
          setGreeting(response.data);
        }
      })
      .catch(() => setGreeting(fallbackGreeting));

    getPublicDepartmentProfile()
      .then((response) => {
        if (response.data) {
          setDepartmentProfile(response.data);
        }
      })
      .catch(() => setDepartmentProfile(fallbackDepartmentProfile));
  }, []);

  const photoUrl = greeting.photo_url || fallbackGreetingPhoto;
  const paragraphs = toParagraphs(departmentProfile.overview, greeting.paragraphs?.length ? greeting.paragraphs : fallbackGreeting.paragraphs);

  return (
    <PublicShell>
      <main className="bg-[#f7fbf8]">
        <section className="px-4 py-14 md:px-6">
          <div className="mx-auto max-w-7xl">
            <Button asChild variant="outline" className="mb-8 rounded-full border-emerald-200 bg-white text-[#0f6b3b] hover:bg-emerald-50">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </Button>

            <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_24px_80px_rgba(15,83,53,0.12)]">
              <div className="grid lg:grid-cols-[0.9fr_1.25fr]">
                <div className="relative min-h-[520px] overflow-hidden bg-gradient-to-br from-[#f5fbf4] via-[#e8f5e5] to-[#d2eac8] p-8">
                  <div className="absolute -bottom-20 -left-16 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />
                  <div className="absolute left-10 top-28 h-72 w-72 rounded-full border border-dashed border-emerald-300/70" />
                  <div
                    className="absolute inset-x-10 bottom-0 top-14 rounded-t-[12rem] bg-cover bg-center shadow-[inset_0_-80px_120px_rgba(13,76,42,0.20)]"
                    style={{
                      backgroundImage: `linear-gradient(180deg,rgba(255,255,255,0.05),rgba(220,245,211,0.28)),url('${photoUrl}')`,
                    }}
                    aria-label={greeting.name}
                  />
                  <div className="absolute bottom-10 left-1/2 z-10 w-[min(82%,430px)] -translate-x-1/2 rounded-3xl bg-white/95 p-5 shadow-[0_20px_60px_rgba(15,83,53,0.18)] backdrop-blur">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f7a43] to-[#0a4f2d] text-white shadow-lg">
                        <Leaf className="h-9 w-9" />
                      </div>
                      <div>
                        <h1 className="font-[var(--font-sora)] text-lg font-black text-[#0c4a2c]">{greeting.name}</h1>
                        <p className="mt-1 text-sm leading-6 text-[#4c6256]">{greeting.position}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative px-8 py-12 md:px-14 lg:px-16 lg:py-16">
                  <div className="mb-7 flex items-center gap-3 text-[#23834b]">
                    <Leaf className="h-5 w-5" />
                    <span className="font-[var(--font-sora)] text-xl font-bold">Selayang Pandang</span>
                  </div>
                  <div className="mb-6 h-1 w-20 rounded-full bg-[#23834b]" />
                  <h2 className="font-[var(--font-sora)] text-3xl font-black leading-tight text-[#0c3f26] md:text-5xl">
                    Sambutan Kepala Dinas
                  </h2>

                  <div className="mt-10 border-l-4 border-emerald-200 pl-8">
                    <Quote className="mb-3 h-10 w-10 fill-[#4f9b62] text-[#4f9b62]" />
                    <div className="max-w-3xl space-y-5 text-base leading-8 text-[#1f2937] md:text-lg">
                      {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-4">
                    <PenLine className="h-12 w-12 text-[#4f9b62]" />
                    <div>
                      <p className="font-[var(--font-sora)] font-black text-[#0c4a2c]">{greeting.name}</p>
                      <p className="mt-1 text-sm leading-6 text-[#5f7168]">{greeting.position}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
