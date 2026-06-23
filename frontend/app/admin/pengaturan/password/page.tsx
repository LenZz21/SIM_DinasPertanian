import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GantiPasswordPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-sora)] text-2xl font-bold text-[#17231d]">Ganti Password</h1>
        <p className="text-sm text-[#66766e]">Perbarui password akun untuk meningkatkan keamanan sistem.</p>
      </div>

      <Card className="max-w-3xl border-[#deebe2] bg-white">
        <CardHeader>
          <CardTitle>Keamanan Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Password Saat Ini</Label>
            <Input type="password" />
          </div>
          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input type="password" />
          </div>
          <div className="space-y-1.5">
            <Label>Konfirmasi Password Baru</Label>
            <Input type="password" />
          </div>
          <Button className="bg-[#0f7d3b] hover:bg-[#0d6d35]">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
