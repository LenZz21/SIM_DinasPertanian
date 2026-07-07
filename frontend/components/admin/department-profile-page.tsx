"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ClipboardList, Flag, ImageIcon, ListChecks, Loader2, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDepartmentProfile, updateDepartmentProfile } from "@/lib/api/department-profile";
import type { DepartmentProfile } from "@/lib/types/api";

const fallbackProfile: DepartmentProfile = {
  id: 0,
  overview:
    "Dinas Pertanian Daerah berperan sebagai penyelenggara urusan pemerintahan bidang pertanian melalui pelayanan data, pendampingan petani, penguatan produksi, serta kolaborasi lintas sektor untuk meningkatkan kesejahteraan masyarakat tani.",
  vision: "Terwujudnya pertanian daerah yang maju, mandiri, modern, berdaya saing, dan berkelanjutan.",
  missions: [
    "Meningkatkan kualitas pelayanan publik dan tata kelola data pertanian yang akurat, terbuka, dan mudah diakses.",
    "Memperkuat kapasitas petani, kelompok tani, dan pelaku usaha pertanian melalui penyuluhan dan pendampingan berkelanjutan.",
    "Mendorong peningkatan produksi, produktivitas, dan nilai tambah komoditas pertanian unggulan daerah.",
  ],
  main_duty:
    "Membantu Bupati melaksanakan urusan Pemerintahan di bidang pertanian yang menjadi kewenangan Daerah dan Tugas Pembantuan yang diberikan kepada kabupaten di bidang Pertanian.",
  functions: [
    "Perumusan kebijakan teknis di bidang Pertanian;",
    "Pelaksanaan kebijakan di bidang Pertanian;",
    "Pelaksanaan evaluasi dan pelaporan di bidang Tanaman Pangan, Peternakan, Perkebunan dan Penyuluhan;",
    "Pelaksanaan administrasi dinas di bidang pertanian; dan",
    "Pelaksanaan fungsi lain yang diberikan oleh atasan terkait dengan tugas dan fungsinya.",
  ],
  hero_image_url: null,
  hero_image_urls: [null, null, null],
  active_hero_image_index: 1,
  is_active: true,
  updated_at: null,
};

const schema = z.object({
  overview: z.string().min(20, "Selayang pandang minimal 20 karakter"),
  vision: z.string().min(10, "Visi minimal 10 karakter"),
  missionsText: z.string().min(10, "Isi minimal satu misi"),
  mainDuty: z.string().min(20, "Tugas pokok minimal 20 karakter"),
  functionsText: z.string().min(10, "Isi minimal satu fungsi"),
  heroImage1: z.any().optional(),
  heroImage2: z.any().optional(),
  heroImage3: z.any().optional(),
  activeHeroImageIndex: z.number().min(1).max(3),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(profile: DepartmentProfile): FormValues {
  return {
    overview: profile.overview,
    vision: profile.vision,
    missionsText: profile.missions.join("\n"),
    mainDuty: profile.main_duty ?? fallbackProfile.main_duty ?? "",
    functionsText: (profile.functions?.length ? profile.functions : fallbackProfile.functions ?? []).join("\n"),
    heroImage1: undefined,
    heroImage2: undefined,
    heroImage3: undefined,
    activeHeroImageIndex: profile.active_hero_image_index ?? 1,
  };
}

function parseMissions(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFunctions(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function DepartmentProfilePage() {
  const [profile, setProfile] = useState<DepartmentProfile>(fallbackProfile);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(fallbackProfile),
  });

  const preview = watch();
  const previewMissions = useMemo(() => parseMissions(preview.missionsText || ""), [preview.missionsText]);
  const previewFunctions = useMemo(() => parseFunctions(preview.functionsText || ""), [preview.functionsText]);
  const activeHeroImageIndex = Number(preview.activeHeroImageIndex || profile.active_hero_image_index || 1);
  const heroImageUrls = useMemo(() => {
    const urls = profile.hero_image_urls?.length ? profile.hero_image_urls : [profile.hero_image_url ?? null, null, null];
    return [urls[0] ?? profile.hero_image_url ?? null, urls[1] ?? null, urls[2] ?? null];
  }, [profile.hero_image_url, profile.hero_image_urls]);
  const wallpaperSlots = [1, 2, 3] as const;

  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getDepartmentProfile();
      const nextProfile = response.data ?? fallbackProfile;
      setProfile(nextProfile);
      reset(toFormValues(nextProfile));
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Profil dinas belum bisa dimuat");
      reset(toFormValues(fallbackProfile));
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function onSubmit(values: FormValues) {
    const missions = parseMissions(values.missionsText);
    const functions = parseFunctions(values.functionsText);

    if (missions.length === 0) {
      toast.error("Isi minimal satu misi dinas");
      return;
    }

    if (functions.length === 0) {
      toast.error("Isi minimal satu fungsi dinas");
      return;
    }

    try {
      const response = await updateDepartmentProfile({
        overview: values.overview.trim(),
        vision: values.vision.trim(),
        missions,
        main_duty: values.mainDuty.trim(),
        functions,
        active_hero_image_index: values.activeHeroImageIndex,
        hero_image_1: values.heroImage1?.[0] as File | undefined,
        hero_image_2: values.heroImage2?.[0] as File | undefined,
        hero_image_3: values.heroImage3?.[0] as File | undefined,
      });

      setProfile(response.data);
      reset(toFormValues(response.data));
      toast.success("Profil dinas berhasil diperbarui");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Profil dinas belum bisa disimpan");
    }
  }

  const stats = [
    { label: "Selayang Pandang", value: `${preview.overview?.trim().length ?? 0} karakter`, icon: Sparkles, className: "bg-emerald-50 text-emerald-700" },
    { label: "Visi", value: `${preview.vision?.trim().length ?? 0} karakter`, icon: Flag, className: "bg-blue-50 text-blue-700" },
    { label: "Misi", value: `${previewMissions.length} poin`, icon: ListChecks, className: "bg-amber-50 text-amber-700" },
    { label: "Fungsi", value: `${previewFunctions.length} poin`, icon: ClipboardList, className: "bg-lime-50 text-lime-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Building2 className="h-3.5 w-3.5" />
            Profil Dinas
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Profil Dinas</h1>
          <p className="text-sm text-[#66766e]">Kelola selayang pandang, visi, misi, tugas pokok, dan fungsi yang tampil pada halaman Profil Dinas dan beranda website.</p>
        </div>
        <Button type="submit" form="department-profile-form" disabled={isSubmitting || isLoading} className="gap-2">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-[#5f6e67]">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#1b2a22]">{item.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${item.className}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Editor Konten Profil</CardTitle>
            <p className="text-xs text-muted-foreground">Tulis setiap poin misi dan fungsi pada baris baru agar tampil sebagai daftar di halaman Profil Dinas.</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-muted-foreground">
                <Loader2 className="mb-3 h-6 w-6 animate-spin" />
                Memuat profil dinas...
              </div>
            ) : (
              <form id="department-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label>Wallpaper Halaman Awal</Label>
                  <div className="grid gap-4 rounded-2xl border border-[#dce9e2] bg-[#f7fbf8] p-4 md:grid-cols-3">
                    {wallpaperSlots.map((slot) => {
                      const fieldName = `heroImage${slot}` as "heroImage1" | "heroImage2" | "heroImage3";
                      const imageUrl = heroImageUrls[slot - 1];
                      const isActive = activeHeroImageIndex === slot;

                      return (
                        <div key={slot} className={`rounded-2xl border bg-white p-3 ${isActive ? "border-emerald-500" : "border-[#dce9e2]"}`}>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[#17231d]">Wallpaper {slot}</p>
                            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-emerald-700">
                              <input type="radio" value={slot} {...register("activeHeroImageIndex", { valueAsNumber: true })} className="h-4 w-4 accent-emerald-700" />
                              Aktif
                            </label>
                          </div>
                          <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[#eef7f2] text-[#25576a]">
                            {imageUrl ? (
                              <img src={imageUrl} alt={`Wallpaper halaman awal ${slot}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="mx-auto mb-2 h-7 w-7" />
                                <p className="text-xs font-semibold">Belum ada gambar</p>
                              </div>
                            )}
                          </div>
                          <Input id={`heroImage${slot}`} type="file" accept="image/*" {...register(fieldName)} className="mt-3 h-11 rounded-xl bg-white text-sm" />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs leading-5 text-[#66766e]">
                    Upload gambar JPG/PNG maksimal 4 MB per slot. Wallpaper aktif tampil pertama, lalu semua wallpaper yang terisi berganti otomatis di beranda.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="overview">Selayang Pandang</Label>
                  <Textarea id="overview" {...register("overview")} rows={7} placeholder="Tulis gambaran singkat profil dinas..." />
                  {errors.overview ? <p className="text-xs text-rose-600">{errors.overview.message}</p> : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vision">Visi</Label>
                  <Textarea id="vision" {...register("vision")} rows={3} placeholder="Tulis visi dinas..." />
                  {errors.vision ? <p className="text-xs text-rose-600">{errors.vision.message}</p> : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="missionsText">Misi</Label>
                  <Textarea id="missionsText" {...register("missionsText")} rows={8} placeholder={"Contoh:\nMeningkatkan kualitas pelayanan pertanian.\nMemperkuat pendampingan kelompok tani."} />
                  {errors.missionsText ? <p className="text-xs text-rose-600">{errors.missionsText.message}</p> : null}
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-1.5">
                    <Label htmlFor="mainDuty">Tugas Pokok</Label>
                    <Textarea id="mainDuty" {...register("mainDuty")} rows={7} placeholder="Tulis tugas pokok dinas..." />
                    {errors.mainDuty ? <p className="text-xs text-rose-600">{errors.mainDuty.message}</p> : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="functionsText">Fungsi</Label>
                    <Textarea
                      id="functionsText"
                      {...register("functionsText")}
                      rows={7}
                      placeholder={"Contoh:\nPerumusan kebijakan teknis di bidang Pertanian;\nPelaksanaan kebijakan di bidang Pertanian;"}
                    />
                    {errors.functionsText ? <p className="text-xs text-rose-600">{errors.functionsText.message}</p> : null}
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
