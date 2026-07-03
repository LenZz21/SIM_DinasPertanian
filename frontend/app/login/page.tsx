"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Leaf, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await login(values);
      setAuth(response.data.access_token, response.data.user);
      toast.success("Login berhasil");
      const redirectTo =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      const safePath = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/admin";
      router.push(safePath);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Login gagal");
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage:
          "linear-gradient(120deg,rgba(6,51,38,0.86),rgba(34,82,55,0.48),rgba(243,183,89,0.34)),url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&auto=format&fit=crop&q=85')",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),linear-gradient(to_bottom,transparent,rgba(5,34,24,0.42))]" />

      <Link href="/" className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white shadow-sm ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <Card className="relative z-10 w-full max-w-md overflow-hidden border-white/70 bg-white/95 shadow-2xl backdrop-blur">
        <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-lime-500 to-amber-400" />
        <CardHeader className="space-y-5 px-7 pb-3 pt-7 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 shadow-inner">
            <Leaf className="h-10 w-10" />
          </div>
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Area Admin
            </p>
            <CardTitle className="font-[var(--font-sora)] text-3xl font-black text-[#17231d]">Login Admin</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[#66766e]">
              Masuk ke dashboard SIM Dinas Pertanian untuk mengelola data, berita, dan layanan.
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-[#25332c]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9b93]" />
                <Input
                  {...register("email")}
                  autoComplete="off"
                  placeholder="Masukkan email"
                  className="h-12 rounded-xl border-emerald-900/10 bg-white pl-11 text-[#17231d] shadow-sm"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-[#25332c]">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9b93]" />
                <Input
                  type="password"
                  {...register("password")}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  className="h-12 rounded-xl border-emerald-900/10 bg-white pl-11 text-[#17231d] shadow-sm"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="h-14 w-full rounded-xl bg-emerald-700 text-base font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-800" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
            <div className="text-center text-sm text-[#66766e]">
              <Link href="/forgot-password" className="font-bold text-emerald-700 hover:underline">
                Lupa password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
