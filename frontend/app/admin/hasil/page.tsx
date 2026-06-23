"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Edit3,
  Eye,
  ImageIcon,
  Leaf,
  Loader2,
  MapPin,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  Wheat,
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
import { createHarvest, deleteHarvest, getHarvests, updateHarvest } from "@/lib/api/harvest";
import { getMitra } from "@/lib/api/mitra";
import type { Harvest, PartnerFarmer } from "@/lib/types/api";

const cropOptions = ["Semua", "Padi", "Jagung", "Cabai", "Kedelai", "Sayuran", "Buah", "Kakao", "Kopi"];

const schema = z.object({
  partner_farmer_id: z.number().min(1, "Mitra wajib dipilih"),
  crop_type: z.string().min(2, "Jenis tanaman minimal 2 karakter"),
  harvest_amount: z.number().min(0, "Jumlah panen tidak boleh minus"),
  harvested_at: z.string().min(1, "Tanggal panen wajib diisi"),
  location: z.string().min(2, "Lokasi minimal 2 karakter"),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  partner_farmer_id: 0,
  crop_type: "Padi",
  harvest_amount: 0,
  harvested_at: "",
  location: "",
  notes: "",
  photo: undefined,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function toFormData(values: FormValues) {
  const payload = new FormData();
  payload.append("partner_farmer_id", String(values.partner_farmer_id));
  payload.append("crop_type", values.crop_type);
  payload.append("harvest_amount", String(values.harvest_amount));
  payload.append("harvested_at", values.harvested_at);
  payload.append("location", values.location);
  if (values.notes) payload.append("notes", values.notes);

  const maybeFile = values.photo?.[0] as File | undefined;
  if (maybeFile) payload.append("photo", maybeFile);

  return payload;
}

export default function AdminHasilPage() {
  const [items, setItems] = useState<Harvest[]>([]);
  const [partners, setPartners] = useState<PartnerFarmer[]>([]);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("Semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Harvest | null>(null);
  const [previewItem, setPreviewItem] = useState<Harvest | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const availableCrops = useMemo(() => {
    const crops = Array.from(new Set([...cropOptions, ...items.map((item) => item.crop_type)]));
    return crops.filter(Boolean);
  }, [items]);

  const stats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.harvest_amount, 0);
    const currentMonthTotal = items
      .filter((item) => {
        const date = new Date(item.harvested_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, item) => sum + item.harvest_amount, 0);
    const cropCount = new Set(items.map((item) => item.crop_type)).size;
    const regionCount = new Set(items.map((item) => item.location)).size;

    return [
      { label: "Total Panen", value: `${formatNumber(total)} Ton`, icon: Wheat, className: "bg-emerald-50 text-emerald-700" },
      { label: "Panen Bulan Ini", value: `${formatNumber(currentMonthTotal)} Ton`, icon: CalendarDays, className: "bg-blue-50 text-blue-700" },
      { label: "Jenis Tanaman", value: `${cropCount} Komoditas`, icon: Leaf, className: "bg-amber-50 text-amber-700" },
      { label: "Lokasi Panen", value: `${regionCount} Wilayah`, icon: MapPin, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const params: Record<string, string | number> = { per_page: 80 };
      if (search) params.search = search;
      if (cropFilter !== "Semua") params.crop_type = cropFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const [harvestRes, mitraRes] = await Promise.all([getHarvests(params), getMitra({ per_page: 100 })]);
      setItems(harvestRes.data);
      setPartners(mitraRes.data);
    } catch (error: unknown) {
      setItems([]);
      setPartners([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/hasil";
        return;
      }

      toast.error(message ?? "Data hasil panen belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [cropFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadData]);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: Harvest) {
    setEditingItem(item);
    reset({
      partner_farmer_id: item.partner_farmer.id,
      crop_type: item.crop_type,
      harvest_amount: item.harvest_amount,
      harvested_at: item.harvested_at,
      location: item.location,
      notes: item.notes ?? "",
      photo: undefined,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toFormData(values);

      if (editingItem) {
        await updateHarvest(editingItem.id, payload);
        toast.success("Hasil panen berhasil diperbarui");
      } else {
        await createHarvest(payload);
        toast.success("Hasil panen berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadData();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data hasil panen belum bisa disimpan");
    }
  }

  async function handleDelete(item: Harvest) {
    const confirmed = window.confirm(`Hapus data panen ${item.crop_type} dari ${item.partner_farmer.name}?`);
    if (!confirmed) return;

    await deleteHarvest(item.id);
    toast.success("Hasil panen berhasil dihapus");
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Wheat className="h-3.5 w-3.5" />
            Monitoring Hasil Panen
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Hasil Pertanian</h1>
          <p className="text-sm text-[#66766e]">Input data panen, upload foto hasil, dan monitoring statistik produksi.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Hasil
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
            <CardTitle className="text-base">Data Panen</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Kelola data panen mitra, komoditas, jumlah, tanggal, lokasi, catatan, dan dokumentasi foto.</p>
          </div>
          <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row">
            <div className="relative xl:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tanaman, lokasi, catatan..." className="pl-9" />
            </div>
            <select
              value={cropFilter}
              onChange={(event) => setCropFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {availableCrops.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="xl:w-40" />
            <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="xl:w-40" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-muted-foreground">
              <Loader2 className="mb-3 h-6 w-6 animate-spin" />
              Memuat data hasil panen...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitra</TableHead>
                    <TableHead>Tanaman</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.partner_farmer.name}</div>
                        <div className="text-xs text-muted-foreground">{item.partner_farmer.region}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{item.crop_type}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatNumber(item.harvest_amount)} Ton</TableCell>
                      <TableCell>{formatDate(item.harvested_at)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {item.location}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.photo_url ? (
                          <Button type="button" variant="outline" size="sm" onClick={() => setPreviewItem(item)} className="gap-2">
                            <Eye className="h-4 w-4" />
                            Lihat
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Belum ada</span>
                        )}
                      </TableCell>
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
              <Wheat className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada data panen</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tambahkan data hasil panen pertama untuk mulai monitoring produksi.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Hasil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Hasil Panen" : "Tambah Hasil Panen"}</DialogTitle>
            <DialogDescription>Isi data panen dari mitra petani, termasuk jumlah, tanggal, lokasi, dan foto opsional.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Mitra</Label>
              <select
                {...register("partner_farmer_id", { valueAsNumber: true })}
                className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value={0}>Pilih mitra</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} - {partner.region}
                  </option>
                ))}
              </select>
              {errors.partner_farmer_id ? <p className="text-xs text-rose-600">{errors.partner_farmer_id.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jenis Tanaman</Label>
                <Input {...register("crop_type")} placeholder="Contoh: Padi" />
                {errors.crop_type ? <p className="text-xs text-rose-600">{errors.crop_type.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Jumlah Panen</Label>
                <Input type="number" step="0.01" {...register("harvest_amount", { valueAsNumber: true })} />
                {errors.harvest_amount ? <p className="text-xs text-rose-600">{errors.harvest_amount.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tanggal Panen</Label>
                <Input type="date" {...register("harvested_at")} />
                {errors.harvested_at ? <p className="text-xs text-rose-600">{errors.harvested_at.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Lokasi</Label>
                <Input {...register("location")} placeholder="Contoh: Gowa" />
                {errors.location ? <p className="text-xs text-rose-600">{errors.location.message}</p> : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea {...register("notes")} placeholder="Catatan kualitas hasil, cuaca, distribusi, atau kendala panen..." className="min-h-24" />
            </div>
            <div className="space-y-1.5">
              <Label>Foto Hasil</Label>
              <Input type="file" accept="image/*" {...register("photo")} />
              <p className="text-xs text-muted-foreground">{editingItem ? "Kosongkan jika tidak ingin mengganti foto." : "Foto opsional, bisa ditambahkan sebagai dokumentasi panen."}</p>
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Hasil"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
          {previewItem ? (
            <div className="overflow-hidden rounded-xl">
              <div className="bg-black">
                {previewItem.photo_url ? (
                  <img src={previewItem.photo_url} alt={previewItem.crop_type} className="max-h-[70vh] w-full object-contain" />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-emerald-100 text-emerald-700">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                )}
              </div>
              <div className="space-y-2 bg-white p-5">
                <Badge>{previewItem.crop_type}</Badge>
                <h2 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">{previewItem.partner_farmer.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(previewItem.harvest_amount)} Ton • {formatDate(previewItem.harvested_at)} • {previewItem.location}
                </p>
                <p className="text-sm text-[#52645a]">{previewItem.notes ?? "Tidak ada catatan tambahan."}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
