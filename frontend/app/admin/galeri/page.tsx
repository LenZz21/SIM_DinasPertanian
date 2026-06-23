"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Camera,
  Edit3,
  Eye,
  ImageIcon,
  Images,
  Loader2,
  Plus,
  Search,
  Trash2,
  UploadCloud,
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
import { Textarea } from "@/components/ui/textarea";
import { createGalleryItem, deleteGalleryItem, getGalleryItems, updateGalleryItem } from "@/lib/api/gallery";
import type { GalleryItem } from "@/lib/types/api";

const categories = ["Semua", "Kegiatan Lapangan", "Hasil Panen", "Penyuluhan", "Infrastruktur", "Dokumentasi Dinas"];

const schema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori wajib dipilih"),
  image: z.any().optional(),
  taken_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  description: "",
  category: "Kegiatan Lapangan",
  image: undefined,
  taken_at: "",
};

function formatDate(value?: string | null) {
  if (!value) return "Belum diisi";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function toFormData(values: FormValues, requireImage: boolean) {
  const payload = new FormData();
  payload.append("title", values.title);
  payload.append("category", values.category);

  if (values.description) payload.append("description", values.description);
  if (values.taken_at) payload.append("taken_at", values.taken_at);

  const maybeFile = values.image?.[0] as File | undefined;
  if (maybeFile) payload.append("image", maybeFile);
  if (requireImage && !maybeFile) throw new Error("Foto wajib diunggah.");

  return payload;
}

export default function GaleriPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

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
    const latest = items.filter((item) => {
      const createdAt = item.created_at;
      if (!createdAt) return false;

      const date = new Date(createdAt);
      const today = new Date();
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    return [
      { label: "Total Foto", value: items.length, icon: Images, className: "bg-emerald-50 text-emerald-700" },
      { label: "Kategori Aktif", value: new Set(items.map((item) => item.category)).size, icon: ImageIcon, className: "bg-blue-50 text-blue-700" },
      { label: "Upload Bulan Ini", value: latest, icon: UploadCloud, className: "bg-amber-50 text-amber-700" },
      { label: "Dokumentasi Terbaru", value: items[0] ? formatDate(items[0].created_at) : "-", icon: CalendarDays, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadGallery = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getGalleryItems({ search, category, per_page: 60 });
      setItems(response.data);
    } catch (error: unknown) {
      setItems([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/galeri";
        return;
      }

      toast.error(message ?? "Data galeri belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGallery();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadGallery]);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: GalleryItem) {
    setEditingItem(item);
    reset({
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      image: undefined,
      taken_at: item.taken_at ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toFormData(values, !editingItem);

      if (editingItem) {
        await updateGalleryItem(editingItem.id, payload);
        toast.success("Dokumentasi galeri berhasil diperbarui");
      } else {
        await createGalleryItem(payload);
        toast.success("Dokumentasi galeri berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadGallery();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Data galeri belum bisa disimpan";
      toast.error(message);
    }
  }

  async function handleDelete(item: GalleryItem) {
    const confirmed = window.confirm(`Hapus dokumentasi "${item.title}"?`);
    if (!confirmed) return;

    await deleteGalleryItem(item.id);
    toast.success("Dokumentasi galeri berhasil dihapus");
    loadGallery();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Camera className="h-3.5 w-3.5" />
            Dokumentasi Dinas
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Galeri</h1>
          <p className="text-sm text-[#66766e]">Kelola dokumentasi kegiatan lapangan, hasil panen, penyuluhan, dan agenda dinas.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Dokumentasi
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
            <CardTitle className="text-base">Album Kegiatan</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Foto yang diunggah tersimpan di server dan bisa dikelola dari halaman ini.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari dokumentasi..." className="pl-9" />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {categories.map((item) => (
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
              Memuat data galeri...
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-2xl border border-[#dce9e2] bg-[#f7faf8] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <button type="button" onClick={() => setPreviewItem(item)} className="relative block h-44 w-full overflow-hidden bg-emerald-100 text-left">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#9ad8b3,#7ec5a0,#4ba973)] text-white">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-white/90 text-[#145434]">{item.category}</Badge>
                    </div>
                  </button>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="line-clamp-1 font-semibold text-[#17231d]">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description ?? "Tidak ada deskripsi."}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(item.taken_at ?? item.created_at)}</span>
                      <span>{item.uploaded_by ?? "Admin"}</span>
                    </div>
                    <div className="flex gap-2 border-t border-[#dce9e2] pt-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => setPreviewItem(item)} className="flex-1 gap-2">
                        <Eye className="h-4 w-4" />
                        Lihat
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(item)} className="gap-2">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(item)} className="gap-2 text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
              <ImageIcon className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada dokumentasi</h3>
              <p className="mt-1 text-sm text-muted-foreground">Unggah foto kegiatan pertama untuk mengisi galeri.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Dokumentasi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Dokumentasi" : "Tambah Dokumentasi"}</DialogTitle>
            <DialogDescription>Lengkapi detail dokumentasi dan unggah foto kegiatan dinas.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Judul Dokumentasi</Label>
              <Input {...register("title")} placeholder="Contoh: Penyuluhan teknologi tanam padi" />
              {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <select {...register("category")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {categories
                    .filter((item) => item !== "Semua")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Kegiatan</Label>
                <Input type="date" {...register("taken_at")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi</Label>
              <Textarea {...register("description")} placeholder="Catatan singkat dokumentasi..." className="min-h-24" />
            </div>
            <div className="space-y-1.5">
              <Label>Foto</Label>
              <Input type="file" accept="image/*" {...register("image")} />
              <p className="text-xs text-muted-foreground">{editingItem ? "Kosongkan jika tidak ingin mengganti foto." : "Wajib unggah foto untuk dokumentasi baru."}</p>
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Upload Dokumentasi"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
          {previewItem ? (
            <div className="overflow-hidden rounded-xl">
              <div className="bg-black">
                {previewItem.image_url ? (
                  <img src={previewItem.image_url} alt={previewItem.title} className="max-h-[70vh] w-full object-contain" />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-[linear-gradient(145deg,#9ad8b3,#7ec5a0,#4ba973)] text-white">
                    <ImageIcon className="h-14 w-14" />
                  </div>
                )}
              </div>
              <div className="space-y-3 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge>{previewItem.category}</Badge>
                    <h2 className="mt-3 font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">{previewItem.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{previewItem.description ?? "Tidak ada deskripsi."}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(previewItem.taken_at ?? previewItem.created_at)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
