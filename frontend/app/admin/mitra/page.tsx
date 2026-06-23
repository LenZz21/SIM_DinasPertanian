"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit3,
  Eye,
  ImageIcon,
  Leaf,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Sprout,
  Trash2,
  Users,
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
import { createMitra, deleteMitra, getMitra, updateMitra } from "@/lib/api/mitra";
import type { PartnerFarmer } from "@/lib/types/api";

const plantOptions = ["Semua", "Padi", "Jagung", "Cabai", "Kedelai", "Sayuran", "Buah", "Kakao", "Kopi"];

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  phone: z.string().min(8, "Nomor HP minimal 8 karakter"),
  region: z.string().min(3, "Wilayah minimal 3 karakter"),
  plant_type: z.string().min(2, "Jenis tanaman minimal 2 karakter"),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  address: "",
  phone: "",
  region: "",
  plant_type: "Padi",
  photo: undefined,
};

function formatNumber(value?: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value ?? 0);
}

function toFormData(values: FormValues) {
  const payload = new FormData();
  payload.append("name", values.name);
  payload.append("address", values.address);
  payload.append("phone", values.phone);
  payload.append("region", values.region);
  payload.append("plant_type", values.plant_type);

  const maybeFile = values.photo?.[0] as File | undefined;
  if (maybeFile) payload.append("photo", maybeFile);

  return payload;
}

export default function AdminMitraPage() {
  const [mitra, setMitra] = useState<PartnerFarmer[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("Semua");
  const [plantFilter, setPlantFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerFarmer | null>(null);
  const [previewItem, setPreviewItem] = useState<PartnerFarmer | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const regions = useMemo(() => ["Semua", ...Array.from(new Set(mitra.map((item) => item.region))).sort()], [mitra]);
  const plants = useMemo(() => Array.from(new Set([...plantOptions, ...mitra.map((item) => item.plant_type)])).filter(Boolean), [mitra]);

  const stats = useMemo(() => {
    const totalHarvest = mitra.reduce((sum, item) => sum + (item.total_harvest ?? 0), 0);

    return [
      { label: "Total Mitra", value: `${mitra.length} Mitra`, icon: Users, className: "bg-emerald-50 text-emerald-700" },
      { label: "Wilayah Aktif", value: `${new Set(mitra.map((item) => item.region)).size} Wilayah`, icon: MapPin, className: "bg-blue-50 text-blue-700" },
      { label: "Komoditas", value: `${new Set(mitra.map((item) => item.plant_type)).size} Jenis`, icon: Leaf, className: "bg-amber-50 text-amber-700" },
      { label: "Total Panen", value: `${formatNumber(totalHarvest)} Ton`, icon: Sprout, className: "bg-rose-50 text-rose-700" },
    ];
  }, [mitra]);

  const loadMitra = useCallback(async () => {
    setIsLoading(true);

    try {
      const params: Record<string, string | number> = { per_page: 80 };
      if (search) params.search = search;
      if (regionFilter !== "Semua") params.region = regionFilter;
      if (plantFilter !== "Semua") params.plant_type = plantFilter;

      const res = await getMitra(params);
      setMitra(res.data);
    } catch (error: unknown) {
      setMitra([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/mitra";
        return;
      }

      toast.error(message ?? "Data mitra belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [plantFilter, regionFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMitra();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadMitra]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search).get("q") ?? "";
    setSearch(query);
  }, []);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: PartnerFarmer) {
    setEditingItem(item);
    reset({
      name: item.name,
      address: item.address,
      phone: item.phone,
      region: item.region,
      plant_type: item.plant_type,
      photo: undefined,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toFormData(values);

      if (editingItem) {
        await updateMitra(editingItem.id, payload);
        toast.success("Mitra berhasil diperbarui");
      } else {
        await createMitra(payload);
        toast.success("Mitra berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadMitra();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data mitra belum bisa disimpan");
    }
  }

  async function handleDelete(item: PartnerFarmer) {
    const confirmed = window.confirm(`Hapus mitra "${item.name}"? Data panen terkait mungkin ikut terpengaruh.`);
    if (!confirmed) return;

    await deleteMitra(item.id);
    toast.success("Mitra berhasil dihapus");
    loadMitra();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Users className="h-3.5 w-3.5" />
            Registrasi Mitra Petani
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Data Mitra</h1>
          <p className="text-sm text-[#66766e]">Kelola data mitra petani, wilayah, jenis tanaman, kontak, dan dokumentasi profil.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Mitra
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
            <CardTitle className="text-base">Daftar Mitra</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Cari dan kelola data mitra berdasarkan nama, wilayah, nomor HP, alamat, atau komoditas.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari mitra, wilayah, komoditas..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
            </div>
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
              value={plantFilter}
              onChange={(event) => setPlantFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {plants.map((item) => (
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
              Memuat data mitra...
            </div>
          ) : mitra.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Wilayah</TableHead>
                    <TableHead>Jenis Tanaman</TableHead>
                    <TableHead>No HP</TableHead>
                    <TableHead>Total Panen</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mitra.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.name}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{item.address}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {item.region}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{item.plant_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-emerald-600" />
                          {item.phone}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{formatNumber(item.total_harvest)} Ton</TableCell>
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
              <Users className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada data mitra</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tambahkan mitra pertama untuk mulai mendata petani dan hasil panen.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Mitra
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Mitra Petani" : "Tambah Mitra Petani"}</DialogTitle>
            <DialogDescription>Lengkapi identitas mitra, kontak, wilayah, jenis tanaman, dan foto profil opsional.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Nama Mitra</Label>
              <Input {...register("name")} placeholder="Contoh: Poktan Maju Jaya" />
              {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Alamat</Label>
              <Textarea {...register("address")} placeholder="Alamat lengkap mitra / kelompok tani" className="min-h-20" />
              {errors.address ? <p className="text-xs text-rose-600">{errors.address.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nomor HP</Label>
                <Input {...register("phone")} placeholder="Contoh: 082312345678" />
                {errors.phone ? <p className="text-xs text-rose-600">{errors.phone.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Wilayah</Label>
                <Input {...register("region")} placeholder="Contoh: Gowa" />
                {errors.region ? <p className="text-xs text-rose-600">{errors.region.message}</p> : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Jenis Tanaman</Label>
              <Input {...register("plant_type")} placeholder="Contoh: Padi" />
              {errors.plant_type ? <p className="text-xs text-rose-600">{errors.plant_type.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Foto Mitra</Label>
              <Input type="file" accept="image/*" {...register("photo")} />
              <p className="text-xs text-muted-foreground">{editingItem ? "Kosongkan jika tidak ingin mengganti foto." : "Foto opsional untuk dokumentasi mitra."}</p>
            </div>
            <Button disabled={isSubmitting} className="gap-2" type="submit">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Mitra"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
          {previewItem ? (
            <div className="overflow-hidden rounded-xl">
              <div className="bg-black">
                {previewItem.photo_url ? (
                  <img src={previewItem.photo_url} alt={previewItem.name} className="max-h-[68vh] w-full object-contain" />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-emerald-100 text-emerald-700">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                )}
              </div>
              <div className="space-y-3 bg-white p-5">
                <Badge>{previewItem.plant_type}</Badge>
                <h2 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">{previewItem.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {previewItem.region} • {previewItem.phone} • Total panen {formatNumber(previewItem.total_harvest)} Ton
                </p>
                <p className="text-sm text-[#52645a]">{previewItem.address}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
