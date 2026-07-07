"use client";

import {
  Activity,
  BellRing,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Loader2,
  Mail,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const storageKey = "sim-pertanian-system-settings";

const defaultSettings = {
  institutionName: "Dinas Pertanian Daerah",
  notificationEmail: "dinas@pertanian.go.id",
  stockAlertLimit: "200",
  syncInterval: "15",
  timezone: "Asia/Makassar",
  reportFormat: "PDF & Excel",
  autoSync: true,
  emailNotification: true,
  stockAlert: true,
  maintenanceMode: false,
  notes: "Monitoring stok pupuk, sinkronisasi produksi, dan notifikasi sistem aktif untuk admin dinas.",
};

type SettingsState = typeof defaultSettings;
type ToggleKey = "autoSync" | "emailNotification" | "stockAlert" | "maintenanceMode";

function ToggleCard({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#e5ece8] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <span>
        <span className="block font-[var(--font-sora)] text-sm font-bold text-[#17231d]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#66766e]">{description}</span>
      </span>
      <span className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-emerald-600" : "bg-slate-200"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

export default function PengaturanSistemPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setHasLoaded(true);
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Status Sistem",
        value: settings.maintenanceMode ? "Maintenance" : "Aktif",
        icon: settings.maintenanceMode ? Settings2 : CheckCircle2,
        className: settings.maintenanceMode ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
      },
      { label: "Sinkronisasi", value: settings.autoSync ? `${settings.syncInterval} Menit` : "Manual", icon: DatabaseZap, className: "bg-blue-50 text-blue-700" },
      { label: "Alert Stok", value: `${settings.stockAlertLimit} Kg`, icon: BellRing, className: "bg-rose-50 text-rose-700" },
      { label: "Format Laporan", value: settings.reportFormat, icon: Activity, className: "bg-amber-50 text-amber-700" },
    ],
    [settings],
  );

  function updateField(field: keyof SettingsState, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function toggleField(field: ToggleKey) {
    setSettings((current) => ({ ...current, [field]: !current[field] }));
  }

  function resetSettings() {
    setSettings(defaultSettings);
    localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
    toast.info("Pengaturan sistem dikembalikan ke nilai bawaan");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (settings.institutionName.trim().length < 3) {
      toast.error("Nama instansi minimal 3 karakter");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.notificationEmail)) {
      toast.error("Email notifikasi belum valid");
      return;
    }

    const alertLimit = Number(settings.stockAlertLimit);
    const syncInterval = Number(settings.syncInterval);

    if (!Number.isFinite(alertLimit) || alertLimit < 1) {
      toast.error("Batas alert stok harus lebih dari 0 Kg");
      return;
    }

    if (!Number.isFinite(syncInterval) || syncInterval < 5) {
      toast.error("Interval sinkronisasi minimal 5 menit");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setIsSaving(false);
    toast.success("Pengaturan sistem berhasil disimpan");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Konfigurasi Aplikasi
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Pengaturan Sistem</h1>
          <p className="text-sm text-[#66766e]">Atur identitas aplikasi, notifikasi, batas stok, sinkronisasi, dan mode operasional.</p>
        </div>
        <Button variant="outline" onClick={resetSettings} className="gap-2 rounded-xl">
          <RefreshCcw className="h-4 w-4" />
          Reset Default
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
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              Kontrol Sistem
            </CardTitle>
            <p className="text-sm text-[#66766e]">Aktifkan fitur penting sesuai kebutuhan operasional admin.</p>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <ToggleCard
              title="Sinkronisasi Otomatis"
              description="Data dashboard diperbarui sesuai interval."
              enabled={settings.autoSync}
              onToggle={() => toggleField("autoSync")}
            />
            <ToggleCard
              title="Notifikasi Email"
              description="Kirim alert penting ke email admin."
              enabled={settings.emailNotification}
              onToggle={() => toggleField("emailNotification")}
            />
            <ToggleCard
              title="Alert Stok Pupuk"
              description="Tampilkan peringatan saat stok di bawah batas."
              enabled={settings.stockAlert}
              onToggle={() => toggleField("stockAlert")}
            />
            <ToggleCard
              title="Mode Maintenance"
              description="Batasi akses publik saat perawatan sistem."
              enabled={settings.maintenanceMode}
              onToggle={() => toggleField("maintenanceMode")}
            />

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-800">
              {hasLoaded ? "Pengaturan tersimpan otomatis di perangkat admin ini." : "Memuat pengaturan sistem..."}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-[#e5ece8] bg-white shadow-sm">
          <CardHeader className="border-b border-[#edf3ef]">
            <CardTitle className="flex items-center gap-2 font-[var(--font-sora)] text-xl text-[#17231d]">
              <Settings2 className="h-5 w-5 text-emerald-700" />
              Konfigurasi Umum
            </CardTitle>
            <p className="text-sm text-[#66766e]">Gunakan nilai yang stabil agar dashboard, laporan, dan notifikasi tetap akurat.</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Nama Instansi</Label>
                  <Input
                    id="institutionName"
                    value={settings.institutionName}
                    onChange={(event) => updateField("institutionName", event.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Email Notifikasi</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(event) => updateField("notificationEmail", event.target.value)}
                      className="h-12 rounded-xl pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockAlertLimit">Batas Alert Stok Pupuk (Kg)</Label>
                  <Input
                    id="stockAlertLimit"
                    type="number"
                    min={1}
                    value={settings.stockAlertLimit}
                    onChange={(event) => updateField("stockAlertLimit", event.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Interval Sinkronisasi Data (menit)</Label>
                  <div className="relative">
                    <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="syncInterval"
                      type="number"
                      min={5}
                      value={settings.syncInterval}
                      onChange={(event) => updateField("syncInterval", event.target.value)}
                      className="h-12 rounded-xl pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zona Waktu</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateField("timezone", value)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Pilih zona waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                      <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                      <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format Laporan Default</Label>
                  <Select value={settings.reportFormat} onValueChange={(value) => updateField("reportFormat", value)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Pilih format laporan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF & Excel">PDF & Excel</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Catatan Operasional</Label>
                  <Textarea
                    id="notes"
                    value={settings.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    className="min-h-28 rounded-xl"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-6 text-amber-800">
                Pengaturan ini disimpan lokal pada browser admin. Jika endpoint konfigurasi backend sudah tersedia, form ini siap dihubungkan ke API sistem.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isSaving} className="gap-2 rounded-xl bg-[#0f7d3b] px-5 hover:bg-[#0d6d35]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Menyimpan..." : "Simpan Pengaturan Sistem"}
                </Button>
                <Button type="button" variant="outline" onClick={resetSettings} className="rounded-xl">
                  Batalkan
                </Button>
                <Badge variant={settings.maintenanceMode ? "warning" : "success"}>{settings.maintenanceMode ? "Maintenance aktif" : "Sistem aktif"}</Badge>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
