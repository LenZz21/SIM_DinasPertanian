"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input defaultValue={user?.name ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user?.email ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input type="password" placeholder="Isi jika ingin ganti password" />
          </div>
          <Button onClick={() => toast.success("Profil berhasil disimpan")}>Simpan Perubahan</Button>
        </CardContent>
      </Card>
    </main>
  );
}
