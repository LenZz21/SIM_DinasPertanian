"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function KontakPage() {
  const [loading, setLoading] = useState(false);

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 md:px-6">
        <div className="space-y-2">
          <h1 className="font-[var(--font-sora)] text-3xl font-bold">Kontak Dinas</h1>
          <p className="text-sm text-muted-foreground">Hubungi kami untuk kebutuhan informasi pertanian dan layanan sistem.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Nama lengkap" />
              <Input placeholder="Email" />
              <Textarea placeholder="Pesan" />
              <Button
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    toast.success("Pesan berhasil dikirim");
                  }, 700);
                }}
              >
                {loading ? "Mengirim..." : "Kirim Pesan"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dinas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> Jl. Pangan Nusantara No. 12</p>
              <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> (0411) 123-456</p>
              <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> dinas@pertanian.go.id</p>
              <div className="mt-4 h-56 rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                Peta lokasi kantor dinas (embed map) dapat diaktifkan saat deployment.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicShell>
  );
}
