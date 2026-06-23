"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BarChart3,
  Edit3,
  Leaf,
  Loader2,
  Map,
  MapPinned,
  Plus,
  Search,
  Sprout,
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
import { createLandArea, deleteLandArea, getLandAreas, updateLandArea, type LandAreaPayload } from "@/lib/api/land-area";
import type { LandArea } from "@/lib/types/api";

const landTypes = ["Semua", "Sawah", "Hortikultura", "Perkebunan", "Tegalan", "Ladang", "Tambak"];
const statusOptions = ["Semua", "Aktif", "Monitoring", "Tidak Aktif"];

const schema = z.object({
  region: z.string().min(3, "Wilayah minimal 3 karakter"),
  land_type: z.string().min(1, "Jenis lahan wajib dipilih"),
  area_size: z.number().min(0, "Luas tidak boleh minus"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  status: z.enum(["Aktif", "Monitoring", "Tidak Aktif"]),
  main_crop: z.string().optional(),
  owner_group: z.string().optional(),
  last_surveyed_at: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  region: "",
  land_type: "Sawah",
  area_size: 0,
  unit: "Ha",
  status: "Aktif",
  main_crop: "",
  owner_group: "",
  last_surveyed_at: "",
  notes: "",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Belum survei";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function statusVariant(status: LandArea["status"]) {
  if (status === "Aktif") return "success";
  if (status === "Monitoring") return "warning";
  return "destructive";
}

function toPayload(values: FormValues): LandAreaPayload {
  return {
    region: values.region,
    land_type: values.land_type,
    area_size: values.area_size,
    unit: values.unit,
    status: values.status,
    main_crop: values.main_crop || null,
    owner_group: values.owner_group || null,
    last_surveyed_at: values.last_surveyed_at || null,
    notes: values.notes || null,
  };
}

export default function LuasLahanPage() {
  const [items, setItems] = useState<LandArea[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LandArea | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const stats = useMemo(() => {
    const activeItems = items.filter((item) => item.status === "Aktif");
    const totalActive = activeItems.reduce((sum, item) => sum + item.area_size, 0);
    const totalByType = (type: string) =>
      activeItems
        .filter((item) => item.land_type === type)
        .reduce((sum, item) => sum + item.area_size, 0);

    return [
      { label: "Total Lahan Aktif", value: `${formatNumber(totalActive)} Ha`, icon: Map, className: "bg-emerald-50 text-emerald-700" },
      { label: "Lahan Sawah", value: `${formatNumber(totalByType("Sawah"))} Ha`, icon: Sprout, className: "bg-blue-50 text-blue-700" },
      { label: "Hortikultura", value: `${formatNumber(totalByType("Hortikultura"))} Ha`, icon: Leaf, className: "bg-amber-50 text-amber-700" },
      { label: "Monitoring", value: `${items.filter((item) => item.status === "Monitoring").length} Wilayah`, icon: BarChart3, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadLandAreas = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getLandAreas({
        search,
        type: typeFilter,
        status: statusFilter,
        per_page: 80,
      });
      setItems(response.data);
    } catch (error: unknown) {
      setItems([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/luas-lahan";
        return;
      }

      toast.error(message ?? "Data luas lahan belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLandAreas();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadLandAreas]);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: LandArea) {
    setEditingItem(item);
    reset({
      region: item.region,
      land_type: item.land_type,
      area_size: item.area_size,
      unit: item.unit,
      status: item.status,
      main_crop: item.main_crop ?? "",
      owner_group: item.owner_group ?? "",
      last_surveyed_at: item.last_surveyed_at ?? "",
      notes: item.notes ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);

      if (editingItem) {
        await updateLandArea(editingItem.id, payload);
        toast.success("Data luas lahan berhasil diperbarui");
      } else {
        await createLandArea(payload);
        toast.success("Data luas lahan berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadLandAreas();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data luas lahan belum bisa disimpan");
    }
  }

  async function handleDelete(item: LandArea) {
    const confirmed = window.confirm(`Hapus data lahan ${item.region} (${item.land_type})?`);
    if (!confirmed) return;

    await deleteLandArea(item.id);
    toast.success("Data luas lahan berhasil dihapus");
    loadLandAreas();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <MapPinned className="h-3.5 w-3.5" />
            Monitoring Lahan Produktif
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Luas Lahan</h1>
          <p className="text-sm text-[#66766e]">Monitoring luas lahan aktif berdasarkan kecamatan dan jenis tanaman.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Data Lahan
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
            <CardTitle className="text-base">Data Luas Lahan</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Kelola wilayah, jenis lahan, luas, komoditas utama, kelompok pengelola, dan status survei.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari wilayah, lahan, komoditas..." className="pl-9" />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {landTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {statusOptions.map((item) => (
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
              Memuat data luas lahan...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Jenis Lahan</TableHead>
                    <TableHead>Luas</TableHead>
                    <TableHead>Komoditas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Survei Terakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.region}</div>
                        <div className="text-xs text-muted-foreground">{item.owner_group ?? "Kelompok belum diisi"}</div>
                      </TableCell>
                      <TableCell>{item.land_type}</TableCell>
                      <TableCell className="font-semibold">
                        {formatNumber(item.area_size)} {item.unit}
                      </TableCell>
                      <TableCell>{item.main_crop ?? "Belum diisi"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.last_surveyed_at)}</TableCell>
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
              <Map className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada data lahan</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tambahkan data luas lahan pertama untuk mulai monitoring wilayah.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Data Lahan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Data Lahan" : "Tambah Data Lahan"}</DialogTitle>
            <DialogDescription>Lengkapi wilayah, jenis lahan, luas, status, komoditas utama, dan hasil survei terbaru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Wilayah / Kecamatan</Label>
              <Input {...register("region")} placeholder="Contoh: Kec. Bontomarannu" />
              {errors.region ? <p className="text-xs text-rose-600">{errors.region.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jenis Lahan</Label>
                <select {...register("land_type")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {landTypes
                    .filter((item) => item !== "Semua")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select {...register("status")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {statusOptions
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
                <Label>Luas Lahan</Label>
                <Input type="number" step="0.01" {...register("area_size", { valueAsNumber: true })} />
                {errors.area_size ? <p className="text-xs text-rose-600">{errors.area_size.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Satuan</Label>
                <Input {...register("unit")} placeholder="Ha" />
                {errors.unit ? <p className="text-xs text-rose-600">{errors.unit.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Komoditas Utama</Label>
                <Input {...register("main_crop")} placeholder="Contoh: Padi, Kakao, Cabai" />
              </div>
              <div className="space-y-1.5">
                <Label>Kelompok Pengelola</Label>
                <Input {...register("owner_group")} placeholder="Nama poktan / kelompok tani" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Survei Terakhir</Label>
              <Input type="date" {...register("last_surveyed_at")} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea {...register("notes")} placeholder="Catatan kondisi irigasi, kesiapan tanam, atau kebutuhan monitoring..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Data Lahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
