"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { createPublicNewsComment } from "@/lib/api/public";
import type { NewsComment } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type NewsCommentsProps = {
  newsSlug: string;
  initialComments: NewsComment[];
  initialCount: number;
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

export function NewsComments({ newsSlug, initialComments, initialCount }: NewsCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const commentCount = useMemo(() => Math.max(initialCount, comments.length), [comments.length, initialCount]);

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
    <section className="space-y-5 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[var(--font-sora)] text-xl font-bold">Komentar</h2>
          <p className="text-sm text-muted-foreground">{commentCount} komentar untuk berita ini</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <MessageCircle className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-border bg-background p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama" maxLength={120} />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email (opsional)" type="email" maxLength={190} />
        </div>
        <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Tulis komentar..." maxLength={1000} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : <span />}
          <Button type="submit" disabled={isSubmitting} className="gap-2 self-start sm:self-auto">
            <Send className="h-4 w-4" />
            {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border bg-background p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{comment.name}</h3>
                <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{comment.content}</p>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
            Belum ada komentar. Jadilah yang pertama memberi tanggapan.
          </div>
        )}
      </div>
    </section>
  );
}
