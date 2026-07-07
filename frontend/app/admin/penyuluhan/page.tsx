"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Edit3, ImageIcon, Loader2, MapPin, Plus, Search, Trash2 } from "lucide-react";
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
import { createAgendaEvent, deleteAgendaEvent, getAgendaEvents, updateAgendaEvent } from "@/lib/api/agenda";
import type { AgendaEvent } from "@/lib/types/api";

const statusOptions = ["Semua", "Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

const schema = z.object({
  title: z.string().min(3, "Judul agenda minimal 3 karakter"),
  summary: z.string().optional(),
  location: z.string().min(2, "Lokasi minimal 2 karakter"),
  starts_at: z.string().min(1, "Waktu mulai wajib diisi"),
  ends_at: z.string().optional(),
  category: z.string().min(2, "Kategori minimal 2 karakter"),
  status: z.enum(["Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"]),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  summary: "",
  location: "",
  starts_at: "",
  ends_at: "",
  category: "Agenda Pertanian",
  status: "Terjadwal",
  image: undefined,
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function statusVariant(status: AgendaEvent["status"]) {
  if (status === "Selesai") return "success";
  if (status === "Terjadwal" || status === "Berlangsung") return "warning";
  return "destructive";
}

function toPayload(values: FormValues) {
  const payload = new FormData();
  payload.append("title", values.title);
  payload.append("summary", values.summary || "");
  payload.append("location", values.location);
  payload.append("starts_at", values.starts_at);
  payload.append("ends_at", values.ends_at || "");
  payload.append("category", values.category);
  payload.append("status", values.status);

  const image = values.image?.[0] as File | undefined;
  if (image) payload.append("image", image);

  return payload;
}

export default function AgendaPage() {
  const [items, setItems] = useState<AgendaEvent[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaEvent | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(items.map((item) => item.category))).sort()], [items]);

  const stats = useMemo(() => {
    const scheduled = items.filter((item) => item.status === "Terjadwal" || item.status === "Berlangsung").length;
    const done = items.filter((item) => item.status === "Selesai").length;
    const canceled = items.filter((item) => item.status === "Dibatalkan").length;

    return [
      { label: "Total Agenda", value: `${items.length} Agenda`, icon: CalendarDays, className: "bg-emerald-50 text-emerald-700" },
      { label: "Agenda Aktif", value: `${scheduled} Agenda`, icon: CalendarDays, className: "bg-blue-50 text-blue-700" },
      { label: "Selesai", value: `${done} Agenda`, icon: CalendarDays, className: "bg-amber-50 text-amber-700" },
      { label: "Dibatalkan", value: `${canceled} Agenda`, icon: CalendarDays, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getAgendaEvents({
        search,
        status: statusFilter,
        category: categoryFilter,
        per_page: 80,
      });
      setItems(response.data);
    } catch (error: unknown) {
      setItems([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/agenda";
        return;
      }

      toast.error(message ?? "Data agenda belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, search, statusFilter]);

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

  function openEditDialog(item: AgendaEvent) {
    setEditingItem(item);
    reset({
      title: item.title,
      summary: item.summary ?? "",
      location: item.location,
      starts_at: toInputDateTime(item.starts_at),
      ends_at: toInputDateTime(item.ends_at),
      category: item.category,
      status: item.status,
      image: undefined,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);

      if (editingItem) {
        await updateAgendaEvent(editingItem.id, payload);
        toast.success("Agenda berhasil diperbarui");
      } else {
        await createAgendaEvent(payload);
        toast.success("Agenda berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadData();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data agenda belum bisa disimpan");
    }
  }

  async function handleDelete(item: AgendaEvent) {
    const confirmed = window.confirm(`Hapus agenda "${item.title}"?`);
    if (!confirmed) return;

    await deleteAgendaEvent(item.id);
    toast.success("Agenda berhasil dihapus");
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CalendarDays className="h-3.5 w-3.5" />
            Manajemen Agenda
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Agenda</h1>
          <p className="text-sm text-[#66766e]">Kelola agenda kegiatan yang tampil pada bagian Agenda Pertanian di beranda.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Agenda
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
            <CardTitle className="text-base">Data Agenda</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Kelola judul, kategori, lokasi, jadwal, gambar, ringkasan, dan status agenda.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari agenda, lokasi, kategori..." className="pl-9" />
            </div>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
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
              Memuat data agenda...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Agenda</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Mulai</TableHead>
                    <TableHead>Selesai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700">
                          {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {item.location}
                        </span>
                      </TableCell>
                      <TableCell>{formatDateTime(item.starts_at)}</TableCell>
                      <TableCell>{formatDateTime(item.ends_at)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
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
              <CalendarDays className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada agenda</h3>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Agenda
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Agenda" : "Tambah Agenda"}</DialogTitle>
            <DialogDescription>Lengkapi detail agenda yang akan tampil pada beranda.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Judul Agenda</Label>
              <Input {...register("title")} placeholder="Contoh: Agenda Teknologi Tanam Padi Modern" />
              {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Input {...register("category")} placeholder="Contoh: Agenda Pertanian" />
                {errors.category ? <p className="text-xs text-rose-600">{errors.category.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select {...register("status")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
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
            <div className="space-y-1.5">
              <Label>Lokasi</Label>
              <Input {...register("location")} placeholder="Contoh: Balai Pertanian Gowa" />
              {errors.location ? <p className="text-xs text-rose-600">{errors.location.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Mulai</Label>
                <Input type="datetime-local" {...register("starts_at")} />
                {errors.starts_at ? <p className="text-xs text-rose-600">{errors.starts_at.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Selesai</Label>
                <Input type="datetime-local" {...register("ends_at")} />
                {errors.ends_at ? <p className="text-xs text-rose-600">{errors.ends_at.message}</p> : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Gambar Agenda</Label>
              <Input type="file" accept="image/*" {...register("image")} />
              <p className="text-xs text-muted-foreground">{editingItem ? "Kosongkan jika tidak ingin mengganti gambar." : "Opsional. Jika kosong, beranda memakai gambar bawaan."}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Ringkasan</Label>
              <Textarea {...register("summary")} placeholder="Ringkasan singkat agenda..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Agenda"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
