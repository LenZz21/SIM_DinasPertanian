"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
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
      email: "admin@simpertanian.test",
      password: "Password@123",
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
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Login Sistem Dinas Pertanian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...register("email")} />
              {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Lupa password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
