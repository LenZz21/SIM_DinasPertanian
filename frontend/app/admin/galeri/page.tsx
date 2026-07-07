"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Camera, Edit3, Eye, ImageIcon, Images, Loader2, Plus, Search, Trash2, UploadCloud } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import { addGalleryPhotos, createGalleryItem, deleteGalleryItem, deleteGalleryPhoto, getGalleryItems, updateGalleryItem } from "@/lib/api/gallery";
import type { GalleryAlbum, GalleryItem } from "@/lib/types/api";

const schema = z.object({
  title: z.string().min(3, "Judul album minimal 3 karakter"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori wajib dipilih"),
  taken_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  description: "",
  category: "",
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

function toFormData(values: FormValues) {
  const payload = new FormData();
  payload.append("title", values.title);
  payload.append("category", values.category);

  if (values.description) payload.append("description", values.description);
  if (values.taken_at) payload.append("taken_at", values.taken_at);

  return payload;
}

export default function GaleriPage() {
  const [items, setItems] = useState<GalleryAlbum[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryAlbum | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryAlbum | null>(null);
  const [photoAlbum, setPhotoAlbum] = useState<GalleryAlbum | null>(null);
  const [isPhotoSubmitting, setIsPhotoSubmitting] = useState(false);

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
    const totalPhotos = items.reduce((total, item) => total + item.photos_count, 0);
    const latest = items.filter((item) => {
      const createdAt = item.created_at;
      if (!createdAt) return false;

      const date = new Date(createdAt);
      const today = new Date();
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    return [
      { label: "Total Album", value: items.length, icon: Images, className: "bg-emerald-50 text-emerald-700" },
      { label: "Total Foto", value: totalPhotos, icon: ImageIcon, className: "bg-blue-50 text-blue-700" },
      { label: "Album Bulan Ini", value: latest, icon: UploadCloud, className: "bg-amber-50 text-amber-700" },
      { label: "Album Terbaru", value: items[0] ? formatDate(items[0].created_at) : "-", icon: CalendarDays, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const categoryOptions = useMemo(() => {
    const existingCategories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ["Semua", ...existingCategories];
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

      toast.error(message ?? "Data album galeri belum bisa dimuat");
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

  function openEditDialog(item: GalleryAlbum) {
    setEditingItem(item);
    reset({
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      taken_at: item.taken_at ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toFormData(values);

      if (editingItem) {
        await updateGalleryItem(editingItem.id, payload);
        toast.success("Album galeri berhasil diperbarui");
      } else {
        await createGalleryItem(payload);
        toast.success("Album galeri berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadGallery();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Album galeri belum bisa disimpan";
      toast.error(message);
    }
  }

  async function handlePhotoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!photoAlbum) return;

    const form = event.currentTarget;
    const input = form.elements.namedItem("images") as HTMLInputElement | null;
    const files = Array.from(input?.files ?? []);

    if (files.length === 0) {
      toast.error("Pilih minimal satu foto.");
      return;
    }

    const payload = new FormData();
    files.forEach((file) => payload.append("images[]", file));
    setIsPhotoSubmitting(true);

    try {
      const response = await addGalleryPhotos(photoAlbum.id, payload);
      toast.success("Foto berhasil ditambahkan ke album");
      setPhotoAlbum(null);
      form.reset();
      loadGallery();

      if (previewItem?.id === photoAlbum.id) {
        setPreviewItem(response.data);
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Foto belum bisa ditambahkan");
    } finally {
      setIsPhotoSubmitting(false);
    }
  }

  async function handleDelete(item: GalleryAlbum) {
    const confirmed = window.confirm(`Hapus album "${item.title}" beserta semua fotonya?`);
    if (!confirmed) return;

    await deleteGalleryItem(item.id);
    toast.success("Album galeri berhasil dihapus");
    loadGallery();
  }

  async function handleDeletePhoto(photo: GalleryItem) {
    const confirmed = window.confirm(`Hapus foto "${photo.title}" dari album?`);
    if (!confirmed) return;

    await deleteGalleryPhoto(photo.id);
    toast.success("Foto berhasil dihapus dari album");

    if (previewItem) {
      setPreviewItem({
        ...previewItem,
        photos_count: Math.max(previewItem.photos_count - 1, 0),
        photos: previewItem.photos.filter((item) => item.id !== photo.id),
        cover_url: previewItem.photos.find((item) => item.id !== photo.id)?.image_url ?? null,
      });
    }

    loadGallery();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Camera className="h-3.5 w-3.5" />
            Album Dokumentasi Dinas
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Galeri</h1>
          <p className="text-sm text-[#66766e]">Kelola album kegiatan, lalu tambahkan banyak foto ke dalam setiap album.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Album
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
            <p className="mt-1 text-xs text-muted-foreground">Buka album untuk melihat semua foto di dalamnya, atau edit album untuk menambahkan foto baru.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari album..." className="pl-9" />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {categoryOptions.map((item) => (
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
              Memuat album galeri...
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-2xl border border-[#dce9e2] bg-[#f7faf8] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <button type="button" onClick={() => setPreviewItem(item)} className="relative block h-48 w-full overflow-hidden bg-emerald-100 text-left">
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,#9ad8b3,#7ec5a0,#4ba973)] text-white">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-white/90 text-[#145434]">{item.category}</Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                      {item.photos_count} foto
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
                        Buka Album
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(item)} className="gap-2">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setPhotoAlbum(item)} className="gap-2">
                        <UploadCloud className="h-4 w-4" />
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
              <h3 className="font-semibold text-[#17231d]">Belum ada album galeri</h3>
              <p className="mt-1 text-sm text-muted-foreground">Buat album pertama dan unggah beberapa foto kegiatan.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Album
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Album" : "Tambah Album"}</DialogTitle>
            <DialogDescription>{editingItem ? "Ubah detail album. Foto ditambahkan melalui tombol Tambah Foto pada album." : "Buat album terlebih dahulu. Setelah album jadi, tambahkan foto dari tombol Tambah Foto."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Nama Album</Label>
              <Input {...register("title")} placeholder="Contoh: Penyuluhan teknologi tanam padi" />
              {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Input {...register("category")} placeholder="Contoh: Kegiatan Lapangan" />
                {errors.category ? <p className="text-xs text-rose-600">{errors.category.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Kegiatan</Label>
                <Input type="date" {...register("taken_at")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi Album</Label>
              <Textarea {...register("description")} placeholder="Catatan singkat album..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Album" : "Buat Album"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(photoAlbum)} onOpenChange={(open) => !open && setPhotoAlbum(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Foto Album</DialogTitle>
            <DialogDescription>{photoAlbum ? `Pilih satu atau banyak foto untuk album "${photoAlbum.title}".` : "Pilih foto untuk album."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePhotoSubmit} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Foto</Label>
              <Input name="images" type="file" accept="image/*" multiple />
              <p className="text-xs text-muted-foreground">Bisa pilih lebih dari satu foto sekaligus.</p>
            </div>
            <Button type="submit" disabled={isPhotoSubmitting} className="gap-2">
              {isPhotoSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isPhotoSubmitting ? "Mengunggah..." : "Tambah Foto"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          {previewItem ? (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle>{previewItem.title}</DialogTitle>
                <DialogDescription>
                  {previewItem.category} - {previewItem.photos_count} foto - {formatDate(previewItem.taken_at ?? previewItem.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div>
                <Button type="button" onClick={() => setPhotoAlbum(previewItem)} className="gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Tambah Foto
                </Button>
              </div>

              {previewItem.description ? <p className="text-sm leading-6 text-muted-foreground">{previewItem.description}</p> : null}

              {previewItem.photos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {previewItem.photos.map((photo) => (
                    <article key={photo.id} className="overflow-hidden rounded-2xl border border-[#dce9e2] bg-white">
                      <div className="bg-black">
                        {photo.image_url ? (
                          <img src={photo.image_url} alt={photo.title} className="h-52 w-full object-cover" />
                        ) : (
                          <div className="flex h-52 items-center justify-center bg-[linear-gradient(145deg,#9ad8b3,#7ec5a0,#4ba973)] text-white">
                            <ImageIcon className="h-14 w-14" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="line-clamp-1 text-sm font-semibold text-[#17231d]">{photo.title}</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleDeletePhoto(photo)} className="text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-[#dce9e2] text-sm text-muted-foreground">
                  Album ini belum memiliki foto.
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
