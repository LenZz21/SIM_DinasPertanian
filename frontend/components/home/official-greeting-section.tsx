"use client";

import { ImageIcon, Leaf } from "lucide-react";
import type { OfficialGreeting } from "@/lib/types/api";

type OfficialGreetingSectionProps = {
  greeting: OfficialGreeting;
  photoUrl?: string | null;
  paragraphs: string[];
};

export function OfficialGreetingSection({ greeting, photoUrl, paragraphs }: OfficialGreetingSectionProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-6">
      <div className="mx-auto grid min-h-[550px] w-full max-w-7xl grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
        <div className="flex min-h-[430px] flex-col justify-end md:col-span-5 md:min-h-[550px]">
          <div className="flex min-h-[340px] items-end justify-center md:min-h-[390px]">
            {photoUrl ? (
              <img src={photoUrl} alt={`Foto ${greeting.name}`} className="h-full max-h-[420px] object-contain transition duration-500 hover:-translate-y-1 lg:max-h-[450px]" />
            ) : (
              <div className="home-hover-lift flex h-[360px] w-full max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-white text-center text-emerald-700">
                <ImageIcon className="mb-3 h-10 w-10" />
                <p className="text-sm font-semibold">Foto pejabat belum diunggah</p>
                <p className="mt-1 max-w-56 text-xs text-emerald-600/80">Kelola konten dari halaman Profil Dinas.</p>
              </div>
            )}
          </div>

          <div className="home-hover-lift -mt-1 rounded-2xl bg-white p-4 text-center shadow-lg">
            <h4 className="text-sm font-bold text-gray-800 md:text-base">{greeting.name}</h4>
            <p className="mt-1 text-sm font-semibold text-gray-500">{greeting.position}</p>
          </div>
        </div>

        <div className="relative p-0 md:col-span-7">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Leaf className="h-4 w-4" />
              <span>Selayang Pandang</span>
            </div>

            <h2 className="mb-6 inline-block border-b-2 border-emerald-600 pb-2 text-2xl font-bold text-slate-800 md:text-3xl">
              Sambutan Kepala Dinas
            </h2>

            <div className="my-6 space-y-4 text-sm font-medium leading-relaxed text-gray-700 md:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
