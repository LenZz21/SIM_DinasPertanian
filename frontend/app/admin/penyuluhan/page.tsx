"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, CalendarDays, Edit3, Loader2, MapPin, Plus, Search, Trash2, Users } from "lucide-react";
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
  createExtensionSession,
  deleteExtensionSession,
  getExtensionSessions,
  updateExtensionSession,
  type ExtensionPayload,
} from "@/lib/api/extension";
import type { ExtensionSession } from "@/lib/types/api";

const statusOptions = ["Semua", "Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

const schema = z.object({
  scheduled_at: z.string().min(1, "Tanggal wajib diisi"),
  topic: z.string().min(3, "Topik minimal 3 karakter"),
  location: z.string().min(2, "Lokasi minimal 2 karakter"),
  instructor: z.string().optional(),
  registered_participants: z.number().min(0, "Peserta tidak boleh minus"),
  attended_participants: z.number().min(0, "Kehadiran tidak boleh minus"),
  materials_count: z.number().min(0, "Materi tidak boleh minus"),
  status: z.enum(["Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  scheduled_at: "",
  topic: "",
  location: "",
  instructor: "",
  registered_participants: 0,
  attended_participants: 0,
  materials_count: 0,
  status: "Terjadwal",
  notes: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function statusVariant(status: ExtensionSession["status"]) {
  if (status === "Selesai") return "success";
  if (status === "Terjadwal" || status === "Berlangsung") return "warning";
  return "destructive";
}

function toPayload(values: FormValues): ExtensionPayload {
  return {
    scheduled_at: values.scheduled_at,
    topic: values.topic,
    location: values.location,
    instructor: values.instructor || null,
    registered_participants: values.registered_participants,
    attended_participants: values.attended_participants,
    materials_count: values.materials_count,
    status: values.status,
    notes: values.notes || null,
  };
}

export default function PenyuluhanPage() {
  const [items, setItems] = useState<ExtensionSession[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [locationFilter, setLocationFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtensionSession | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const locations = useMemo(() => ["Semua", ...Array.from(new Set(items.map((item) => item.location))).sort()], [items]);

  const stats = useMemo(() => {
    const activeSessions = items.filter((item) => item.status === "Terjadwal" || item.status === "Berlangsung").length;
    const registered = items.reduce((sum, item) => sum + item.registered_participants, 0);
    const attended = items.reduce((sum, item) => sum + item.attended_participants, 0);
    const materials = items.reduce((sum, item) => sum + item.materials_count, 0);
    const attendance = registered > 0 ? Math.round((attended / registered) * 100) : 0;

    return [
      { label: "Jadwal Aktif", value: `${activeSessions} Sesi`, icon: CalendarDays, className: "bg-emerald-50 text-emerald-700" },
      { label: "Peserta Terdaftar", value: `${formatNumber(registered)} Orang`, icon: Users, className: "bg-blue-50 text-blue-700" },
      { label: "Materi Tersedia", value: `${formatNumber(materials)} Modul`, icon: BookOpen, className: "bg-amber-50 text-amber-700" },
      { label: "Tingkat Kehadiran", value: `${attendance}%`, icon: Users, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getExtensionSessions({
        search,
        status: statusFilter,
        location: locationFilter,
        per_page: 80,
      });
      setItems(response.data);
    } catch (error: unknown) {
      setItems([]);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/penyuluhan";
        return;
      }

      toast.error(message ?? "Data penyuluhan belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [locationFilter, search, statusFilter]);

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

  function openEditDialog(item: ExtensionSession) {
    setEditingItem(item);
    reset({
      scheduled_at: item.scheduled_at,
      topic: item.topic,
      location: item.location,
      instructor: item.instructor ?? "",
      registered_participants: item.registered_participants,
      attended_participants: item.attended_participants,
      materials_count: item.materials_count,
      status: item.status,
      notes: item.notes ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);

      if (editingItem) {
        await updateExtensionSession(editingItem.id, payload);
        toast.success("Jadwal penyuluhan berhasil diperbarui");
      } else {
        await createExtensionSession(payload);
        toast.success("Jadwal penyuluhan berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadData();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data penyuluhan belum bisa disimpan");
    }
  }

  async function handleDelete(item: ExtensionSession) {
    const confirmed = window.confirm(`Hapus jadwal penyuluhan "${item.topic}"?`);
    if (!confirmed) return;

    await deleteExtensionSession(item.id);
    toast.success("Jadwal penyuluhan berhasil dihapus");
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BookOpen className="h-3.5 w-3.5" />
            Manajemen Penyuluhan
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Penyuluhan</h1>
          <p className="text-sm text-[#66766e]">Manajemen jadwal penyuluhan, materi, dan kehadiran peserta.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Jadwal
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
            <CardTitle className="text-base">Data Penyuluhan</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Kelola jadwal, topik, lokasi, pemateri, peserta, materi, dan status kegiatan.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari topik, lokasi, pemateri..." className="pl-9" />
            </div>
            <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              {locations.map((item) => (
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
              Memuat data penyuluhan...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Topik</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Peserta</TableHead>
                    <TableHead>Materi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.scheduled_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.topic}</div>
                        <div className="text-xs text-muted-foreground">{item.instructor ?? "Pemateri belum diisi"}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {item.location}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatNumber(item.attended_participants)} / {formatNumber(item.registered_participants)}
                      </TableCell>
                      <TableCell>{formatNumber(item.materials_count)} Modul</TableCell>
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
              <BookOpen className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada jadwal penyuluhan</h3>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Jadwal Penyuluhan" : "Tambah Jadwal Penyuluhan"}</DialogTitle>
            <DialogDescription>Lengkapi jadwal, topik, lokasi, pemateri, jumlah peserta, materi, dan status kegiatan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tanggal</Label>
                <Input type="date" {...register("scheduled_at")} />
                {errors.scheduled_at ? <p className="text-xs text-rose-600">{errors.scheduled_at.message}</p> : null}
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
              <Label>Topik</Label>
              <Input {...register("topic")} placeholder="Contoh: Irigasi Hemat Air" />
              {errors.topic ? <p className="text-xs text-rose-600">{errors.topic.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Lokasi</Label>
                <Input {...register("location")} placeholder="Contoh: Gowa" />
                {errors.location ? <p className="text-xs text-rose-600">{errors.location.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Pemateri</Label>
                <Input {...register("instructor")} placeholder="Nama pemateri" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Peserta Terdaftar</Label>
                <Input type="number" {...register("registered_participants", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Hadir</Label>
                <Input type="number" {...register("attended_participants", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Materi</Label>
                <Input type="number" {...register("materials_count", { valueAsNumber: true })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea {...register("notes")} placeholder="Catatan kegiatan penyuluhan..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Jadwal"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
