"use client";

import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, RefreshCcw, Save, ShieldAlert, ShieldCheck, ShieldHalf, TimerReset } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/lib/api/users";
import { useAuthStore } from "@/lib/stores/auth-store";

type PasswordField = "current" | "new" | "confirm";

const defaultForm = {
  current: "",
  new: "",
  confirm: "",
};

function getStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  return checks.filter(Boolean).length;
}

function getStrengthLabel(score: number) {
  if (score >= 5) return { label: "Sangat Kuat", className: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" };
  if (score >= 4) return { label: "Kuat", className: "bg-blue-100 text-blue-800", bar: "bg-blue-500" };
  if (score >= 3) return { label: "Sedang", className: "bg-amber-100 text-amber-800", bar: "bg-amber-500" };
  return { label: "Lemah", className: "bg-rose-100 text-rose-700", bar: "bg-rose-500" };
}

export default function GantiPasswordPage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState(defaultForm);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const strength = useMemo(() => getStrength(form.new), [form.new]);
  const strengthMeta = getStrengthLabel(strength);
  const requirements = [
    { label: "Minimal 8 karakter", valid: form.new.length >= 8 },
    { label: "Huruf besar dan kecil", valid: /[A-Z]/.test(form.new) && /[a-z]/.test(form.new) },
    { label: "Memiliki angka", valid: /\d/.test(form.new) },
    { label: "Memiliki simbol", valid: /[^A-Za-z0-9]/.test(form.new) },
  ];

  const stats = [
    { label: "Status Keamanan", value: strength >= 4 ? "Baik" : "Perlu Ditingkatkan", icon: ShieldCheck, className: "bg-emerald-50 text-emerald-700" },
    { label: "Standar Password", value: "Min. 8 Karakter", icon: LockKeyhole, className: "bg-blue-50 text-blue-700" },
    { label: "Proteksi Akun", value: "Admin Dinas", icon: ShieldHalf, className: "bg-amber-50 text-amber-700" },
    { label: "Rotasi Disarankan", value: "90 Hari", icon: TimerReset, className: "bg-rose-50 text-rose-700" },
  ];

  function updateField(field: PasswordField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(defaultForm);
    toast.info("Form password dibersihkan");
  }

  function toggleVisible(field: PasswordField) {
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.current) {
      toast.error("Password saat ini wajib diisi");
      return;
    }

    if (form.new.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    if (strength < 4) {
      toast.error("Gunakan kombinasi huruf, angka, dan simbol agar password lebih kuat");
      return;
    }

    if (form.current === form.new) {
      toast.error("Password baru tidak boleh sama dengan password saat ini");
      return;
    }

    if (form.new !== form.confirm) {
      toast.error("Konfirmasi password baru belum cocok");
      return;
    }

    if (!user?.id) {
      toast.error("Data pengguna aktif belum tersedia. Silakan login ulang.");
      return;
    }

    setIsSaving(true);

    try {
      await updateUser(user.id, {
        password: form.new,
        password_confirmation: form.confirm,
      });

      setForm(defaultForm);
      toast.success("Password berhasil diperbarui");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Password belum bisa diperbarui");
    } finally {
      setIsSaving(false);
    }
  }

  function PasswordInput({ id, label, field, placeholder }: { id: string; label: string; field: PasswordField; placeholder: string }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            type={visible[field] ? "text" : "password"}
            value={form[field]}
            onChange={(event) => updateField(field, event.target.value)}
            placeholder={placeholder}
            className="h-12 rounded-xl pr-12"
          />
          <button
            type="button"
            onClick={() => toggleVisible(field)}
            className="absolute right-3 top-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={visible[field] ? "Sembunyikan password" : "Tampilkan password"}
          >
            {visible[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <KeyRound className="h-3.5 w-3.5" />
            Keamanan Administrator
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Ganti Password</h1>
          <p className="text-sm text-[#66766e]">Perbarui password akun untuk menjaga akses dashboard tetap aman.</p>
        </div>
        <Button variant="outline" onClick={resetForm} className="gap-2 rounded-xl">
          <RefreshCcw className="h-4 w-4" />
          Bersihkan Form
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
        <Card className="rounded-3xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader className="border-b border-[#edf3ef]">
            <CardTitle className="flex items-center gap-2 font-[var(--font-sora)] text-xl text-[#17231d]">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Panduan Password
            </CardTitle>
            <p className="text-sm text-[#66766e]">Gunakan password kuat untuk mengurangi risiko akses tidak sah.</p>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="rounded-3xl bg-[#17231d] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Kekuatan Password</p>
                  <p className="mt-2 font-[var(--font-sora)] text-2xl font-bold">{strengthMeta.label}</p>
                </div>
                <Badge className={strengthMeta.className}>{strength}/5</Badge>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div className={`h-full rounded-full transition-all ${strengthMeta.bar}`} style={{ width: `${Math.max(10, strength * 20)}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              {requirements.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium text-[#4c5f55]">{item.label}</span>
                  <span className={item.valid ? "font-bold text-emerald-700" : "font-bold text-slate-400"}>{item.valid ? "Terpenuhi" : "Belum"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader className="border-b border-[#edf3ef]">
            <CardTitle className="flex items-center gap-2 font-[var(--font-sora)] text-xl text-[#17231d]">
              <LockKeyhole className="h-5 w-5 text-emerald-700" />
              Form Update Password
            </CardTitle>
            <p className="text-sm text-[#66766e]">Masukkan password saat ini, lalu buat password baru dengan kombinasi yang kuat.</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput id="current-password" label="Password Saat Ini" field="current" placeholder="Masukkan password saat ini" />
              <div className="grid gap-5 md:grid-cols-2">
                <PasswordInput id="new-password" label="Password Baru" field="new" placeholder="Minimal 8 karakter" />
                <PasswordInput id="confirm-password" label="Konfirmasi Password Baru" field="confirm" placeholder="Ulangi password baru" />
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-800">
                Setelah password diperbarui, gunakan password baru pada login berikutnya. Hindari memakai tanggal lahir, nama pribadi, atau password yang pernah dipakai.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isSaving} className="gap-2 rounded-xl bg-[#0f7d3b] px-5 hover:bg-[#0d6d35]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Memperbarui..." : "Update Password"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">
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
