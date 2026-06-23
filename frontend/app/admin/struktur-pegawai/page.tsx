"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Edit3, Loader2, Mail, Phone, Plus, Search, ShieldCheck, Trash2, UsersRound } from "lucide-react";
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
import { createEmployee, deleteEmployee, getEmployees, updateEmployee, type EmployeePayload } from "@/lib/api/employee";
import type { EmployeeRecord } from "@/lib/types/api";

const categories = ["Semua", "Pimpinan", "Petugas Lapangan", "Penyuluh", "Staf Administrasi"];
const statuses = ["Semua", "Aktif", "Cuti", "Nonaktif"];

const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  position: z.string().min(3, "Jabatan minimal 3 karakter"),
  unit: z.string().min(2, "Unit wajib diisi"),
  category: z.enum(["Pimpinan", "Petugas Lapangan", "Penyuluh", "Staf Administrasi"]),
  status: z.enum(["Aktif", "Cuti", "Nonaktif"]),
  phone: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  joined_at: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  position: "",
  unit: "",
  category: "Petugas Lapangan",
  status: "Aktif",
  phone: "",
  email: "",
  joined_at: "",
  notes: "",
};

function formatDate(value?: string | null) {
  if (!value) return "Belum diisi";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function statusVariant(status: EmployeeRecord["status"]) {
  if (status === "Aktif") return "success";
  if (status === "Cuti") return "warning";
  return "destructive";
}

function toPayload(values: FormValues): EmployeePayload {
  return {
    name: values.name,
    position: values.position,
    unit: values.unit,
    category: values.category,
    status: values.status,
    phone: values.phone || null,
    email: values.email || null,
    joined_at: values.joined_at || null,
    notes: values.notes || null,
  };
}

export default function StrukturPegawaiPage() {
  const [items, setItems] = useState<EmployeeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeRecord | null>(null);

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
    const totalByCategory = (category: string) => items.filter((item) => item.category === category).length;

    return [
      { label: "Total Pegawai", value: `${items.length} Orang`, icon: UsersRound, className: "bg-emerald-50 text-emerald-700" },
      { label: "Petugas Lapangan", value: `${totalByCategory("Petugas Lapangan")} Orang`, icon: BriefcaseBusiness, className: "bg-blue-50 text-blue-700" },
      { label: "Penyuluh", value: `${totalByCategory("Penyuluh")} Orang`, icon: ShieldCheck, className: "bg-amber-50 text-amber-700" },
      { label: "Staf Administrasi", value: `${totalByCategory("Staf Administrasi")} Orang`, icon: UsersRound, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getEmployees({
        search,
        category: categoryFilter,
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
        window.location.href = "/login?redirect=/admin/struktur-pegawai";
        return;
      }

      toast.error(message ?? "Data pegawai belum bisa dimuat");
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

  function openEditDialog(item: EmployeeRecord) {
    setEditingItem(item);
    reset({
      name: item.name,
      position: item.position,
      unit: item.unit,
      category: item.category,
      status: item.status,
      phone: item.phone ?? "",
      email: item.email ?? "",
      joined_at: item.joined_at ?? "",
      notes: item.notes ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);

      if (editingItem) {
        await updateEmployee(editingItem.id, payload);
        toast.success("Data pegawai berhasil diperbarui");
      } else {
        await createEmployee(payload);
        toast.success("Data pegawai berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadData();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data pegawai belum bisa disimpan");
    }
  }

  async function handleDelete(item: EmployeeRecord) {
    const confirmed = window.confirm(`Hapus data pegawai "${item.name}"?`);
    if (!confirmed) return;

    await deleteEmployee(item.id);
    toast.success("Data pegawai berhasil dihapus");
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <UsersRound className="h-3.5 w-3.5" />
            Struktur Organisasi Dinas
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Struktur Pegawai</h1>
          <p className="text-sm text-[#66766e]">Data pegawai dinas, jabatan, unit kerja, kontak, dan status kepegawaian.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pegawai
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
            <CardTitle className="text-base">Data Struktur Pegawai</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Cari dan kelola pegawai berdasarkan nama, jabatan, unit, kategori, status, email, atau nomor HP.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari pegawai, jabatan, unit..." className="pl-9" />
            </div>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              {statuses.map((item) => (
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
              Memuat data pegawai...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.name}</div>
                        <div className="text-xs text-muted-foreground">Bergabung: {formatDate(item.joined_at)}</div>
                      </TableCell>
                      <TableCell>{item.position}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <Badge variant="default">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {item.phone ?? "-"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {item.email ?? "-"}
                          </div>
                        </div>
                      </TableCell>
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
              <UsersRound className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada data pegawai</h3>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Pegawai
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Data Pegawai" : "Tambah Data Pegawai"}</DialogTitle>
            <DialogDescription>Lengkapi identitas pegawai, jabatan, unit, kategori, kontak, dan status kepegawaian.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Nama Pegawai</Label>
              <Input {...register("name")} placeholder="Contoh: Rahmat Hidayat" />
              {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jabatan</Label>
                <Input {...register("position")} placeholder="Contoh: Penyuluh Senior" />
                {errors.position ? <p className="text-xs text-rose-600">{errors.position.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Input {...register("unit")} placeholder="Contoh: Penyuluhan" />
                {errors.unit ? <p className="text-xs text-rose-600">{errors.unit.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <select {...register("category")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
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
                <Label>Status</Label>
                <select {...register("status")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
                  {statuses
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
                <Label>No HP</Label>
                <Input {...register("phone")} placeholder="Nomor HP pegawai" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...register("email")} placeholder="email@dinas.go.id" />
                {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Bergabung</Label>
              <Input type="date" {...register("joined_at")} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea {...register("notes")} placeholder="Catatan tugas, wilayah kerja, atau status pegawai..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UsersRound className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Pegawai"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
