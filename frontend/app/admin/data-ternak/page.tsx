"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertTriangle,
  Beef,
  Edit3,
  HeartPulse,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createLivestockRecord,
  deleteLivestockRecord,
  getLivestockRecords,
  updateLivestockRecord,
  type LivestockPayload,
} from "@/lib/api/livestock";
import type { LivestockRecord } from "@/lib/types/api";

const livestockTypes = ["Semua", "Sapi", "Kambing", "Unggas", "Domba", "Kerbau", "Itik"];
const healthStatuses = ["Semua", "Sehat", "Perlu Dicek", "Sakit"];

const schema = z.object({
  partner_name: z.string().min(3, "Nama mitra minimal 3 karakter"),
  livestock_type: z.string().min(1, "Jenis ternak wajib dipilih"),
  quantity: z.number().min(0, "Jumlah tidak boleh minus"),
  region: z.string().min(2, "Wilayah wajib diisi"),
  health_status: z.enum(["Sehat", "Perlu Dicek", "Sakit"]),
  owner_phone: z.string().optional(),
  last_checked_at: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  partner_name: "",
  livestock_type: "Sapi",
  quantity: 0,
  region: "",
  health_status: "Sehat",
  owner_phone: "",
  last_checked_at: "",
  notes: "",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Belum diperiksa";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function healthVariant(status: LivestockRecord["health_status"]) {
  if (status === "Sehat") return "success";
  if (status === "Perlu Dicek") return "warning";
  return "destructive";
}

function toPayload(values: FormValues): LivestockPayload {
  return {
    partner_name: values.partner_name,
    livestock_type: values.livestock_type,
    quantity: values.quantity,
    region: values.region,
    health_status: values.health_status,
    owner_phone: values.owner_phone || null,
    last_checked_at: values.last_checked_at || null,
    notes: values.notes || null,
  };
}

export default function DataTernakPage() {
  const [items, setItems] = useState<LivestockRecord[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [regionFilter, setRegionFilter] = useState("Semua");
  const [healthFilter, setHealthFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LivestockRecord | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const regions = useMemo(() => ["Semua", ...Array.from(new Set(items.map((item) => item.region))).sort()], [items]);

  const stats = useMemo(() => {
    const totalPopulation = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalByType = (type: string) =>
      items
        .filter((item) => item.livestock_type === type)
        .reduce((sum, item) => sum + item.quantity, 0);
    const needsAttention = items.filter((item) => item.health_status !== "Sehat").length;

    return [
      { label: "Total Populasi", value: `${formatNumber(totalPopulation)} Ekor`, icon: Beef, className: "bg-emerald-50 text-emerald-700" },
      { label: "Sapi", value: `${formatNumber(totalByType("Sapi"))} Ekor`, icon: Activity, className: "bg-blue-50 text-blue-700" },
      { label: "Kambing", value: `${formatNumber(totalByType("Kambing"))} Ekor`, icon: HeartPulse, className: "bg-amber-50 text-amber-700" },
      { label: "Perlu Dicek", value: `${needsAttention} Mitra`, icon: AlertTriangle, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadLivestock = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getLivestockRecords({
        search,
        type: typeFilter,
        region: regionFilter,
        health_status: healthFilter,
        per_page: 80,
      });
      setItems(response.data);
    } catch (error: unknown) {
      setItems([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/data-ternak";
        return;
      }

      toast.error(message ?? "Data ternak belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [healthFilter, regionFilter, search, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLivestock();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadLivestock]);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: LivestockRecord) {
    setEditingItem(item);
    reset({
      partner_name: item.partner_name,
      livestock_type: item.livestock_type,
      quantity: item.quantity,
      region: item.region,
      health_status: item.health_status,
      owner_phone: item.owner_phone ?? "",
      last_checked_at: item.last_checked_at ?? "",
      notes: item.notes ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);

      if (editingItem) {
        await updateLivestockRecord(editingItem.id, payload);
        toast.success("Data ternak berhasil diperbarui");
      } else {
        await createLivestockRecord(payload);
        toast.success("Data ternak berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadLivestock();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data ternak belum bisa disimpan");
    }
  }

  async function handleDelete(item: LivestockRecord) {
    const confirmed = window.confirm(`Hapus data ${item.livestock_type} milik ${item.partner_name}?`);
    if (!confirmed) return;

    await deleteLivestockRecord(item.id);
    toast.success("Data ternak berhasil dihapus");
    loadLivestock();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Beef className="h-3.5 w-3.5" />
            Monitoring Populasi Ternak
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Data Ternak</h1>
          <p className="text-sm text-[#66766e]">Pendataan populasi ternak mitra petani dan distribusi per wilayah.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Data Ternak
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
        <CardHeader className="gap-4 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base">Data Populasi Ternak</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Pantau jumlah ternak, wilayah mitra, kontak, dan status pemeriksaan kesehatan.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mitra, ternak, wilayah..." className="pl-9" />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {livestockTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={healthFilter}
              onChange={(event) => setHealthFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {healthStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-muted-foreground">
              <Loader2 className="mb-3 h-6 w-6 animate-spin" />
              Memuat data ternak...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitra</TableHead>
                    <TableHead>Jenis Ternak</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Status Kesehatan</TableHead>
                    <TableHead>Pemeriksaan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.partner_name}</div>
                        <div className="text-xs text-muted-foreground">{item.owner_phone ?? "Kontak belum diisi"}</div>
                      </TableCell>
                      <TableCell>{item.livestock_type}</TableCell>
                      <TableCell className="font-semibold">{formatNumber(item.quantity)} Ekor</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {item.region}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={healthVariant(item.health_status)}>{item.health_status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.last_checked_at)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(item)} className="gap-2">
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(item)} className="gap-2 text-rose-600 hover:bg-rose-50">
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
              <Beef className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada data ternak</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tambahkan data populasi ternak pertama untuk mulai monitoring.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Data Ternak
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Data Ternak" : "Tambah Data Ternak"}</DialogTitle>
            <DialogDescription>Lengkapi identitas mitra, jenis ternak, jumlah populasi, wilayah, dan status kesehatan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Nama Mitra / Kelompok</Label>
              <Input {...register("partner_name")} placeholder="Contoh: Poktan Maju Jaya" />
              {errors.partner_name ? <p className="text-xs text-rose-600">{errors.partner_name.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jenis Ternak</Label>
                <select {...register("livestock_type")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {livestockTypes
                    .filter((item) => item !== "Semua")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah Populasi</Label>
                <Input type="number" {...register("quantity", { valueAsNumber: true })} />
                {errors.quantity ? <p className="text-xs text-rose-600">{errors.quantity.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Wilayah</Label>
                <Input {...register("region")} placeholder="Contoh: Maros" />
                {errors.region ? <p className="text-xs text-rose-600">{errors.region.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Status Kesehatan</Label>
                <select {...register("health_status")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {healthStatuses
                    .filter((item) => item !== "Semua")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nomor Kontak</Label>
                <Input {...register("owner_phone")} placeholder="Nomor HP mitra" />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Pemeriksaan</Label>
                <Input type="date" {...register("last_checked_at")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea {...register("notes")} placeholder="Catatan kondisi kandang, pakan, vaksin, atau pemeriksaan..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartPulse className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Data Ternak"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
