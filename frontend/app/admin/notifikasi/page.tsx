"use client";

import { AlertTriangle, BellRing, CheckCheck, CircleCheck, Info, Loader2, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteNotification, getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/api/notifications";
import type { SystemNotification } from "@/lib/types/api";

const typeOptions = ["Semua", "info", "success", "warning", "error"];
const statusOptions = ["Semua", "Belum Dibaca", "Dibaca"];

function typeConfig(type: SystemNotification["type"]) {
  if (type === "success") return { label: "Sukses", icon: CircleCheck, badge: "success" as const, className: "bg-emerald-50 text-emerald-700" };
  if (type === "warning") return { label: "Peringatan", icon: AlertTriangle, badge: "warning" as const, className: "bg-amber-50 text-amber-700" };
  if (type === "error") return { label: "Prioritas", icon: ShieldAlert, badge: "destructive" as const, className: "bg-rose-50 text-rose-700" };
  return { label: "Info", icon: Info, badge: "default" as const, className: "bg-blue-50 text-blue-700" };
}

function formatDate(value?: string | null) {
  if (!value) return "Baru saja";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function NotifikasiPage() {
  const router = useRouter();
  const [items, setItems] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const stats = useMemo(() => {
    const urgent = items.filter((item) => item.type === "warning" || item.type === "error").length;
    const read = items.filter((item) => item.read_at).length;

    return [
      { label: "Total Notifikasi", value: items.length, icon: BellRing, className: "bg-emerald-50 text-emerald-700" },
      { label: "Belum Dibaca", value: unreadCount, icon: Info, className: "bg-blue-50 text-blue-700" },
      { label: "Prioritas", value: urgent, icon: AlertTriangle, className: "bg-amber-50 text-amber-700" },
      { label: "Sudah Dibaca", value: read, icon: CheckCheck, className: "bg-rose-50 text-rose-700" },
    ];
  }, [items, unreadCount]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getNotifications({
        search,
        type: typeFilter,
        status: statusFilter,
        per_page: 50,
      });
      setItems(response.data.items);
      setUnreadCount(response.data.unread_count);
    } catch (error: unknown) {
      setItems([]);
      setUnreadCount(0);
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 401) {
        toast.error(message ?? "Sesi login tidak valid. Silakan login ulang.");
        window.location.href = "/login?redirect=/admin/notifikasi";
        return;
      }

      toast.error(message ?? "Data notifikasi belum bisa dimuat");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadNotifications]);

  async function handleOpenNotification(item: SystemNotification) {
    if (!item.read_at) {
      await markNotificationAsRead(item.id);
      setItems((current) => current.map((notification) => (notification.id === item.id ? { ...notification, read_at: new Date().toISOString() } : notification)));
      setUnreadCount((current) => Math.max(0, current - 1));
    }

    router.push(item.meta?.href ?? "/admin");
  }

  async function handleMarkAllRead() {
    await markAllNotificationsAsRead();
    toast.success("Semua notifikasi ditandai sudah dibaca");
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
  }

  async function handleDeleteNotification(item: SystemNotification) {
    if (!item.read_at) {
      toast.info("Notifikasi harus dibaca dulu sebelum dihapus");
      return;
    }

    setDeletingId(item.id);

    try {
      await deleteNotification(item.id);
      setItems((current) => current.filter((notification) => notification.id !== item.id));
      toast.success("Notifikasi berhasil dihapus");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Notifikasi gagal dihapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <BellRing className="h-3.5 w-3.5" />
            Pusat Pemberitahuan
          </div>
          <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">Notifikasi</h1>
          <p className="text-sm text-[#66766e]">Daftar pemberitahuan terbaru dari sistem manajemen pertanian.</p>
        </div>
        <Button type="button" variant="outline" onClick={handleMarkAllRead} disabled={isLoading || unreadCount === 0} className="gap-2">
          <CheckCheck className="h-4 w-4" />
          Tandai Semua Dibaca
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
                  <p className="mt-2 text-2xl font-bold text-[#1b2a22]">{isLoading ? "..." : item.value}</p>
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
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-emerald-700" />
              Notifikasi Masuk
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Klik notifikasi untuk menandai dibaca dan membuka modul terkait.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari notifikasi..." className="pl-9" />
            </div>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              {typeOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "Semua" ? item : typeConfig(item as SystemNotification["type"]).label}
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
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-20 w-full rounded-xl" />)
          ) : items.length > 0 ? (
            items.map((item) => {
              const config = typeConfig(item.type);
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
                    item.read_at ? "border-[#dce9e2] bg-white" : "border-emerald-200 bg-emerald-50/40"
                  }`}
                >
                  <button type="button" onClick={() => handleOpenNotification(item)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 ${config.className}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#17231d]">{item.title}</p>
                            <p className="mt-1 text-sm text-[#52645a]">{item.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={config.badge}>{item.meta?.category ?? config.label}</Badge>
                            {!item.read_at ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> : null}
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                      </div>
                    </div>
                  </button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteNotification(item)}
                    disabled={!item.read_at || deletingId === item.id}
                    title={item.read_at ? "Hapus notifikasi" : "Baca dulu sebelum menghapus"}
                    className="mt-1 shrink-0 border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:border-slate-100 disabled:text-slate-300"
                  >
                    {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dce9e2] text-center">
              <BellRing className="mb-3 h-10 w-10 text-emerald-600" />
              <h3 className="font-semibold text-[#17231d]">Tidak ada notifikasi</h3>
              <p className="mt-1 text-sm text-muted-foreground">Notifikasi baru dari sistem akan tampil di sini.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
