"use client";

import { CheckCircle2, Clock3, Loader2, Mail, Phone, RefreshCcw, Save, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth-store";

const fallbackProfile = {
  name: "Administrator",
  email: "admin@simpertanian.test",
  phone: "081234567890",
  role: "Admin Dinas",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function PengaturanAkunPage() {
  const { token, user, setAuth } = useAuthStore();
  const initialProfile = useMemo(
    () => ({
      name: user?.name || fallbackProfile.name,
      email: user?.email || fallbackProfile.email,
      phone: user?.phone || fallbackProfile.phone,
      role: user?.roles?.[0] || fallbackProfile.role,
    }),
    [user],
  );

  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);

  const stats = [
    { label: "Status Akun", value: user?.is_active === false ? "Nonaktif" : "Aktif", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
    { label: "Hak Akses", value: profile.role, icon: ShieldCheck, className: "bg-blue-50 text-blue-700" },
    { label: "Email Admin", value: "Terverifikasi", icon: Mail, className: "bg-amber-50 text-amber-700" },
    { label: "Login Terakhir", value: "Hari ini", icon: Clock3, className: "bg-rose-50 text-rose-700" },
  ];

  function updateField(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function resetProfile() {
    setProfile(initialProfile);
    toast.info("Perubahan formulir dibatalkan");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (profile.name.trim().length < 3) {
      toast.error("Nama lengkap minimal 3 karakter");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      toast.error("Format email belum valid");
      return;
    }

    if (profile.phone.trim().length < 8) {
      toast.error("Nomor telepon minimal 8 digit");
      return;
    }

    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (token && user) {
      setAuth(token, {
        ...user,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        roles: [profile.role],
      });
    }

    setIsSaving(false);
    toast.success("Profil akun berhasil diperbarui");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Preferensi Administrator
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Pengaturan Akun</h1>
          <p className="text-sm text-[#66766e]">Kelola identitas admin, informasi kontak, dan status keamanan akun.</p>
        </div>
        <Button variant="outline" onClick={resetProfile} className="gap-2 rounded-xl">
          <RefreshCcw className="h-4 w-4" />
          Reset Form
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-[#66766e]">{item.label}</p>
                  <p className="mt-2 font-[var(--font-sora)] text-xl font-bold text-[#17231d]">{item.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${item.className}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden rounded-3xl border-[#e5ece8] bg-white shadow-sm">
          <div className="h-28 bg-[linear-gradient(135deg,#064e3b,#0f8b5f)]" />
          <CardContent className="-mt-12 p-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-[#17231d] font-[var(--font-sora)] text-3xl font-black text-white shadow-lg">
              {getInitials(profile.name) || "AD"}
            </div>
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">{profile.name || "Administrator"}</h2>
                <Badge variant={user?.is_active === false ? "destructive" : "success"}>{user?.is_active === false ? "Nonaktif" : "Aktif"}</Badge>
              </div>
              <p className="mt-1 text-sm text-[#66766e]">{profile.role}</p>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-sm text-[#4c5f55]">
                <Mail className="h-4 w-4 text-emerald-700" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4c5f55]">
                <Phone className="h-4 w-4 text-emerald-700" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#4c5f55]">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>Akses dashboard penuh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader className="border-b border-[#edf3ef]">
            <CardTitle className="flex items-center gap-2 font-[var(--font-sora)] text-xl text-[#17231d]">
              <UserRound className="h-5 w-5 text-emerald-700" />
              Profil Akun
            </CardTitle>
            <p className="text-sm text-[#66766e]">Pastikan data kontak administrator selalu valid untuk kebutuhan notifikasi sistem.</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" value={profile.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Masukkan nama lengkap" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Jabatan</Label>
                  <Input id="role" value={profile.role} onChange={(event) => updateField("role", event.target.value)} placeholder="Contoh: Admin Dinas" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={(event) => updateField("email", event.target.value)} placeholder="admin@domain.go.id" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input id="phone" value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="08xxxxxxxxxx" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-6 text-amber-800">
                Perubahan profil disimpan pada sesi admin yang sedang aktif. Jika backend profil sudah disediakan, form ini siap dihubungkan ke endpoint update akun.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isSaving} className="gap-2 rounded-xl bg-[#0f7d3b] px-5 hover:bg-[#0d6d35]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button type="button" variant="outline" onClick={resetProfile} className="rounded-xl">
                  Batalkan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
