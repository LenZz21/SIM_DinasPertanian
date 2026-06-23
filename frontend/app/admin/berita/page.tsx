"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  FileText,
  Loader2,
  MessageCircle,
  Newspaper,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
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
import { createAdminNews, deleteAdminNews, getAdminNews, updateAdminNews } from "@/lib/api/news";
import type { News } from "@/lib/types/api";

const schema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  excerpt: z.string().optional(),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  is_published: z.enum(["true", "false"]),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  excerpt: "",
  content: "",
  is_published: "true",
  image: undefined,
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function toFormData(values: FormValues) {
  const payload = new FormData();
  payload.append("title", values.title);
  payload.append("content", values.content);
  payload.append("is_published", values.is_published === "true" ? "1" : "0");

  if (values.excerpt) payload.append("excerpt", values.excerpt);

  const maybeFile = values.image?.[0] as File | undefined;
  if (maybeFile) payload.append("image", maybeFile);

  return payload;
}

export default function AdminBeritaPage() {
  const [items, setItems] = useState<News[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);

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
    const published = items.filter((item) => item.is_published).length;
    const drafts = items.length - published;
    const comments = items.reduce((total, item) => total + (item.comments_count ?? 0), 0);
    const thisMonth = items.filter((item) => {
      const date = item.published_at ?? item.created_at;
      if (!date) return false;

      const newsDate = new Date(date);
      const today = new Date();
      return newsDate.getMonth() === today.getMonth() && newsDate.getFullYear() === today.getFullYear();
    }).length;

    return [
      { label: "Berita Dipublikasikan", value: `${published} Artikel`, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
      { label: "Draft", value: `${drafts} Artikel`, icon: Clock3, className: "bg-amber-50 text-amber-700" },
      { label: "Artikel Bulan Ini", value: `${thisMonth} Artikel`, icon: FileText, className: "bg-blue-50 text-blue-700" },
      { label: "Komentar Masuk", value: `${comments}`, icon: MessageCircle, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadNews = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getAdminNews({ search, per_page: 50 });
      setItems(response.data);
    } catch (error: unknown) {
      setItems([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/berita";
        return;
      }

      toast.error(message ?? "Data berita belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNews();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadNews]);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: News) {
    setEditingItem(item);
    reset({
      title: item.title,
      excerpt: item.excerpt ?? "",
      content: item.content,
      is_published: item.is_published ? "true" : "false",
      image: undefined,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const payload = toFormData(values);

    if (editingItem) {
      await updateAdminNews(editingItem.id, payload);
      toast.success("Berita berhasil diperbarui");
    } else {
      await createAdminNews(payload);
      toast.success("Berita berhasil ditambahkan");
    }

    setIsDialogOpen(false);
    reset(defaultValues);
    loadNews();
  }

  async function handleDelete(item: News) {
    const confirmed = window.confirm(`Hapus berita "${item.title}"?`);
    if (!confirmed) return;

    await deleteAdminNews(item.id);
    toast.success("Berita berhasil dihapus");
    loadNews();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Newspaper className="h-3.5 w-3.5" />
            Manajemen Publikasi
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Berita</h1>
          <p className="text-sm text-[#66766e]">Kelola berita, pengumuman, status publikasi, dan komentar pembaca.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Berita
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
        <CardHeader className="gap-4 pb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base">Data Berita</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Berita yang dipublikasikan akan muncul di halaman depan.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul berita..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Komentar</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Memuat data berita...
                  </TableCell>
                </TableRow>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-md">
                      <div className="font-semibold text-[#17231d]">{item.title}</div>
                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.excerpt ?? item.content}</div>
                    </TableCell>
                    <TableCell>{item.author ?? "Admin Dinas"}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? "success" : "warning"}>{item.is_published ? "Published" : "Draft"}</Badge>
                    </TableCell>
                    <TableCell>{item.comments_count ?? 0}</TableCell>
                    <TableCell>{formatDate(item.published_at ?? item.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {item.is_published ? (
                          <Button asChild size="icon" variant="ghost" title="Lihat di halaman depan">
                            <Link href={`/berita/${item.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}
                        <Button type="button" size="icon" variant="outline" title="Edit berita" onClick={() => openEditDialog(item)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="outline" title="Hapus berita" onClick={() => handleDelete(item)} className="text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Belum ada berita yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Berita" : "Tambah Berita"}</DialogTitle>
            <DialogDescription>Isi konten berita dan tentukan apakah berita langsung dipublikasikan atau disimpan sebagai draft.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Judul</Label>
              <Input {...register("title")} placeholder="Contoh: Program irigasi modern dimulai" />
              {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Ringkasan</Label>
              <Textarea {...register("excerpt")} placeholder="Ringkasan singkat yang tampil di daftar berita" className="min-h-20" />
            </div>
            <div className="space-y-1.5">
              <Label>Konten Berita</Label>
              <Textarea {...register("content")} placeholder="Tulis isi berita lengkap..." className="min-h-44" />
              {errors.content ? <p className="text-xs text-rose-600">{errors.content.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status Publikasi</Label>
                <select {...register("is_published")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Gambar Berita</Label>
                <Input type="file" accept="image/*" {...register("image")} />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Terbitkan Berita"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
