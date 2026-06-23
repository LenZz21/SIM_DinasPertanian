import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PengaturanAkunPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">Pengaturan Akun</h1>
        <p className="text-sm text-[#66766e]">Kelola profil akun administrator dan informasi kontak.</p>
      </div>

      <Card className="max-w-3xl border-[#deebe2] bg-white">
        <CardHeader>
          <CardTitle>Profil Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input defaultValue="Administrator" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue="admin@simpertanian.test" />
          </div>
          <div className="space-y-1.5">
            <Label>No. Telepon</Label>
            <Input defaultValue="081234567890" />
          </div>
          <Button className="bg-[#0f7d3b] hover:bg-[#0d6d35]">Simpan Perubahan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
