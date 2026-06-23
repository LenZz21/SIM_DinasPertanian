"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Boxes,
  Edit3,
  Factory,
  Loader2,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  Truck,
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
  createFertilizerStock,
  deleteFertilizerStock,
  getFertilizerStocks,
  updateFertilizerStock,
  type FertilizerPayload,
} from "@/lib/api/fertilizer";
import type { FertilizerStock } from "@/lib/types/api";

const fertilizerTypes = ["Semua", "Urea", "NPK", "Organik", "SP-36", "ZA", "KCl", "Dolomit"];
const statusOptions = ["Semua", "Aman", "Menipis", "Kosong"];

const schema = z.object({
  warehouse: z.string().min(3, "Nama gudang minimal 3 karakter"),
  fertilizer_type: z.string().min(1, "Jenis pupuk wajib dipilih"),
  stock_amount: z.number().min(0, "Stok tidak boleh minus"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  minimum_stock: z.number().min(0, "Batas minimum tidak boleh minus"),
  supplier: z.string().optional(),
  last_restocked_at: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  warehouse: "",
  fertilizer_type: "Urea",
  stock_amount: 0,
  unit: "Kg",
  minimum_stock: 200,
  supplier: "",
  last_restocked_at: "",
  notes: "",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Belum restock";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function statusVariant(status: FertilizerStock["status"]) {
  if (status === "Aman") return "success";
  if (status === "Menipis") return "warning";
  return "destructive";
}

function toPayload(values: FormValues): FertilizerPayload {
  return {
    warehouse: values.warehouse,
    fertilizer_type: values.fertilizer_type,
    stock_amount: values.stock_amount,
    unit: values.unit,
    minimum_stock: values.minimum_stock,
    supplier: values.supplier || null,
    last_restocked_at: values.last_restocked_at || null,
    notes: values.notes || null,
  };
}

export default function DataPupukPage() {
  const [items, setItems] = useState<FertilizerStock[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FertilizerStock | null>(null);

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
    const totalStock = items.reduce((sum, item) => sum + item.stock_amount, 0);
    const totalByType = (type: string) =>
      items
        .filter((item) => item.fertilizer_type === type)
        .reduce((sum, item) => sum + item.stock_amount, 0);
    const lowStock = items.filter((item) => item.status !== "Aman").length;

    return [
      { label: "Total Stok", value: `${formatNumber(totalStock)} Kg`, icon: Boxes, className: "bg-emerald-50 text-emerald-700" },
      { label: "Urea", value: `${formatNumber(totalByType("Urea"))} Kg`, icon: PackageCheck, className: "bg-blue-50 text-blue-700" },
      { label: "NPK", value: `${formatNumber(totalByType("NPK"))} Kg`, icon: Factory, className: "bg-amber-50 text-amber-700" },
      { label: "Perlu Perhatian", value: `${lowStock} Gudang`, icon: AlertTriangle, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items]);

  const loadFertilizers = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getFertilizerStocks({
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
        window.location.href = "/login?redirect=/admin/data-pupuk";
        return;
      }

      toast.error(message ?? "Data pupuk belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFertilizers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadFertilizers]);

  function openCreateDialog() {
    setEditingItem(null);
    reset(defaultValues);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: FertilizerStock) {
    setEditingItem(item);
    reset({
      warehouse: item.warehouse,
      fertilizer_type: item.fertilizer_type,
      stock_amount: item.stock_amount,
      unit: item.unit,
      minimum_stock: item.minimum_stock,
      supplier: item.supplier ?? "",
      last_restocked_at: item.last_restocked_at ?? "",
      notes: item.notes ?? "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);

      if (editingItem) {
        await updateFertilizerStock(editingItem.id, payload);
        toast.success("Data stok pupuk berhasil diperbarui");
      } else {
        await createFertilizerStock(payload);
        toast.success("Data stok pupuk berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      reset(defaultValues);
      loadFertilizers();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data stok pupuk belum bisa disimpan");
    }
  }

  async function handleDelete(item: FertilizerStock) {
    const confirmed = window.confirm(`Hapus stok ${item.fertilizer_type} di ${item.warehouse}?`);
    if (!confirmed) return;

    await deleteFertilizerStock(item.id);
    toast.success("Data stok pupuk berhasil dihapus");
    loadFertilizers();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Truck className="h-3.5 w-3.5" />
            Manajemen Stok Pupuk
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Data Pupuk</h1>
          <p className="text-sm text-[#66766e]">Kontrol ketersediaan stok pupuk subsidi dan non subsidi per gudang.</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Stok
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
            <CardTitle className="text-base">Data Stok Pupuk</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Status otomatis berubah menjadi menipis saat stok berada di bawah batas minimum.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari gudang, pupuk, supplier..." className="pl-9" />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {fertilizerTypes.map((item) => (
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
              Memuat data pupuk...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gudang</TableHead>
                    <TableHead>Jenis Pupuk</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Batas Minimum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Restock Terakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-[#17231d]">{item.warehouse}</div>
                        <div className="text-xs text-muted-foreground">{item.supplier ?? "Supplier belum diisi"}</div>
                      </TableCell>
                      <TableCell>{item.fertilizer_type}</TableCell>
                      <TableCell className="font-semibold">
                        {formatNumber(item.stock_amount)} {item.unit}
                      </TableCell>
                      <TableCell>
                        {formatNumber(item.minimum_stock)} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.last_restocked_at)}</TableCell>
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
              <Boxes className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Belum ada data pupuk</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tambahkan stok pertama untuk mulai memantau ketersediaan gudang.</p>
              <Button onClick={openCreateDialog} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tambah Stok
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Stok Pupuk" : "Tambah Stok Pupuk"}</DialogTitle>
            <DialogDescription>Lengkapi data gudang, jenis pupuk, jumlah stok, dan batas minimum.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Nama Gudang</Label>
              <Input {...register("warehouse")} placeholder="Contoh: Gudang Tahuna" />
              {errors.warehouse ? <p className="text-xs text-rose-600">{errors.warehouse.message}</p> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jenis Pupuk</Label>
                <select {...register("fertilizer_type")} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {fertilizerTypes
                    .filter((item) => item !== "Semua")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Satuan</Label>
                <Input {...register("unit")} placeholder="Kg" />
                {errors.unit ? <p className="text-xs text-rose-600">{errors.unit.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Jumlah Stok</Label>
                <Input type="number" step="0.01" {...register("stock_amount", { valueAsNumber: true })} />
                {errors.stock_amount ? <p className="text-xs text-rose-600">{errors.stock_amount.message}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Batas Minimum</Label>
                <Input type="number" step="0.01" {...register("minimum_stock", { valueAsNumber: true })} />
                {errors.minimum_stock ? <p className="text-xs text-rose-600">{errors.minimum_stock.message}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input {...register("supplier")} placeholder="Nama distributor / supplier" />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Restock</Label>
                <Input type="date" {...register("last_restocked_at")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea {...register("notes")} placeholder="Catatan distribusi atau kebutuhan restock..." className="min-h-24" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Stok"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
