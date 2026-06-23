import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PengaturanSistemPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">Pengaturan Sistem</h1>
        <p className="text-sm text-[#66766e]">Konfigurasi umum aplikasi, notifikasi, dan parameter monitoring.</p>
      </div>

      <Card className="max-w-4xl border-[#deebe2] bg-white">
        <CardHeader>
          <CardTitle>Konfigurasi Umum</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nama Instansi</Label>
            <Input defaultValue="Dinas Pertanian Daerah" />
          </div>
          <div className="space-y-1.5">
            <Label>Email Notifikasi</Label>
            <Input defaultValue="dinas@pertanian.go.id" />
          </div>
          <div className="space-y-1.5">
            <Label>Batas Alert Stok Pupuk (Kg)</Label>
            <Input defaultValue="200" />
          </div>
          <div className="space-y-1.5">
            <Label>Interval Sinkronisasi Data (menit)</Label>
            <Input defaultValue="15" />
          </div>
          <div className="md:col-span-2">
            <Button className="bg-[#0f7d3b] hover:bg-[#0d6d35]">Simpan Pengaturan Sistem</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
