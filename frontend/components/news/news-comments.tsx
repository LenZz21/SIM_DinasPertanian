"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { createPublicNewsComment } from "@/lib/api/public";
import type { NewsComment } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type NewsCommentsProps = {
  newsSlug: string;
  initialComments: NewsComment[];
  initialCount: number;
  variant?: "default" | "dark";
};

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NewsComments({ newsSlug, initialComments, initialCount, variant = "default" }: NewsCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const commentCount = useMemo(() => Math.max(initialCount, comments.length), [comments.length, initialCount]);
  const isDark = variant === "dark";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!name.trim() || !content.trim()) {
      setMessage("Nama dan komentar wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createPublicNewsComment(newsSlug, {
        name: name.trim(),
        email: email.trim() || undefined,
        content: content.trim(),
      });

      setComments((currentComments) => [response.data, ...currentComments]);
      setContent("");
      setMessage("Komentar berhasil dikirim.");
    } catch {
      setMessage("Komentar belum bisa dikirim. Coba lagi sebentar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={cn("space-y-5 rounded-xl border p-6", isDark ? "border-white/10 bg-[#202a35] text-slate-100" : "border-border bg-card")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[var(--font-sora)] text-xl font-bold">Komentar</h2>
          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-muted-foreground")}>{commentCount} komentar untuk berita ini</p>
        </div>
        <div className={cn("rounded-full p-3", isDark ? "bg-[#25576a]/10 text-[#25576a]" : "bg-primary/10 text-primary")}>
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={cn("grid gap-3 rounded-lg border p-4", isDark ? "border-white/10 bg-[#18222d]" : "border-border bg-background")}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama" maxLength={120} className={cn(isDark ? "border-white/10 bg-[#111a24] text-slate-100 placeholder:text-slate-500" : "")} />
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email (opsional)"
            type="email"
            maxLength={190}
            className={cn(isDark ? "border-white/10 bg-[#111a24] text-slate-100 placeholder:text-slate-500" : "")}
          />
        </div>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Tulis komentar..."
          maxLength={1000}
          className={cn(isDark ? "border-white/10 bg-[#111a24] text-slate-100 placeholder:text-slate-500" : "")}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {message ? <p className={cn("text-xs", isDark ? "text-slate-400" : "text-muted-foreground")}>{message}</p> : <span />}
          <Button type="submit" disabled={isSubmitting} className={cn("gap-2 self-start sm:self-auto", isDark ? "bg-[#0f7d3b] hover:bg-[#0b6b32]" : "")}>
            <Send className="h-4 w-4" />
            {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className={cn("rounded-lg border p-4", isDark ? "border-white/10 bg-[#18222d]" : "border-border bg-background")}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{comment.name}</h3>
                <span className={cn("text-xs", isDark ? "text-slate-500" : "text-muted-foreground")}>{formatDate(comment.created_at)}</span>
              </div>
              <p className={cn("whitespace-pre-wrap text-sm leading-6", isDark ? "text-slate-400" : "text-muted-foreground")}>{comment.content}</p>
            </article>
          ))
        ) : (
          <div className={cn("rounded-lg border border-dashed p-5 text-center text-sm", isDark ? "border-white/10 text-slate-400" : "border-border text-muted-foreground")}>
            Belum ada komentar. Jadilah yang pertama memberi tanggapan.
          </div>
        )}
      </div>
    </section>
  );
}
