"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, ImageIcon, Loader2, Search, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmployees, updateEmployee, type EmployeePayload } from "@/lib/api/employee";
import type { EmployeeRecord } from "@/lib/types/api";

const schema = z.object({
  position: z.string().min(2, "Nama bidang atau jabatan minimal 2 karakter"),
  name: z.string().min(2, "Nama orang minimal 2 karakter"),
  nip: z.string().optional(),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  position: "",
  name: "",
  nip: "",
  photo: undefined,
};

function toPayload(values: FormValues, currentItem: EmployeeRecord): EmployeePayload {
  const payload = new FormData();
  payload.append("name", values.name);
  payload.append("position", values.position);
  payload.append("unit", currentItem.unit || "Struktur Organisasi");
  payload.append("category", currentItem.category || "Staf Administrasi");
  payload.append("status", currentItem.status || "Aktif");
  payload.append("phone", currentItem.phone || "");
  payload.append("email", currentItem.email || "");
  payload.append("joined_at", currentItem.joined_at ?? "");
  payload.append("notes", values.nip ?? "");

  const photoFile = values.photo?.[0] as File | undefined;

  if (photoFile) {
    payload.append("photo", photoFile);
  }

  return payload;
}

export function EmployeeStructureSection() {
  const [items, setItems] = useState<EmployeeRecord[]>([]);
  const [search, setSearch] = useState("");
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
    const totalBidang = items.filter((item) => item.position.toLowerCase().includes("bidang")).length;
    const totalPimpinan = items.filter((item) => item.category === "Pimpinan").length;
    const totalFungsional = Math.max(items.length - totalPimpinan, 0);

    return [
      { label: "Total Struktur", value: `${items.length} Posisi` },
      { label: "Bidang", value: `${totalBidang} Posisi` },
      { label: "Pimpinan", value: `${totalPimpinan} Orang` },
      { label: "Jabatan Fungsional", value: `${totalFungsional} Posisi` },
    ];
  }, [items]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getEmployees({
        search,
        category: "Semua",
        status: "Aktif",
        per_page: 120,
      });
      setItems(response.data.filter((item) => item.structure_key));
    } catch (error: unknown) {
      setItems([]);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Data struktur organisasi belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  function openEditDialog(item: EmployeeRecord) {
    setEditingItem(item);
    reset({
      name: item.name,
      position: item.position,
      nip: item.notes ?? "",
      photo: undefined,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (!editingItem) return;

    try {
      await updateEmployee(editingItem.id, toPayload(values, editingItem));
      toast.success("Struktur organisasi berhasil diperbarui");
      setIsDialogOpen(false);
      reset(defaultValues);
      loadData();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Struktur organisasi belum bisa disimpan");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <UsersRound className="h-3.5 w-3.5" />
            Struktur Organisasi Dinas
          </div>
          <h2 className="font-[var(--font-sora)] text-2xl font-bold leading-tight text-[#17231d]">Data Struktur Pegawai</h2>
          <p className="text-sm text-[#66766e]">Ubah nama bidang atau jabatan dan nama pejabat sesuai struktur organisasi.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-[#5f6e67]">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-[#1b2a22]">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-[#e5ece8] bg-white shadow-sm">
        <CardHeader className="gap-4 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base">Tabel Struktur Organisasi</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Data ini mengikuti struktur organisasi dari file DISTAN.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari jabatan atau nama..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-muted-foreground">
              <Loader2 className="mb-3 h-6 w-6 animate-spin" />
              Memuat struktur organisasi...
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama Bidang / Jabatan</TableHead>
                    <TableHead>Nama Orang</TableHead>
                    <TableHead>NIP</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#eef7f2] text-[#25576a]">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-[#17231d]">{item.position}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.notes ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(item)} className="gap-2">
                            <Edit3 className="h-4 w-4" />
                            Edit
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
              <h3 className="font-semibold text-[#17231d]">Struktur organisasi belum tersedia</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">Jalankan seeder struktur organisasi agar data dari file DISTAN tampil di halaman ini.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Struktur Organisasi</DialogTitle>
            <DialogDescription>Ubah nama bidang atau jabatan, nama orang, NIP, dan foto yang tampil pada halaman publik.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-4 rounded-2xl border border-[#dce9e2] bg-[#f7fbf8] p-4 sm:grid-cols-[112px_1fr] sm:items-center">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#25576a]">
                {editingItem?.photo_url ? (
                  <img src={editingItem.photo_url} alt={editingItem.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 h-7 w-7" />
                    <p className="text-[11px] font-semibold">Belum ada foto</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="structurePhoto">Foto Pejabat</Label>
                <Input id="structurePhoto" type="file" accept="image/*" {...register("photo")} className="h-11 rounded-xl bg-white" />
                <p className="text-xs leading-5 text-[#66766e]">
                  Upload JPG/PNG maksimal 4 MB. Foto ini tampil di selayang pandang, struktur organisasi, dan kartu beranda jika data digunakan.
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Bidang / Jabatan</Label>
              <Input {...register("position")} placeholder="Contoh: Kepala Dinas" />
              {errors.position ? <p className="text-xs text-rose-600">{errors.position.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>Nama Orang</Label>
              <Input {...register("name")} placeholder="Contoh: FRANKY NANTINGKASEH, S.Pi" />
              {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>NIP</Label>
              <Input {...register("nip")} placeholder="Contoh: NIP. 19751104 200212 1 004" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UsersRound className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
