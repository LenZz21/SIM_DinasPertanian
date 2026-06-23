import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { NewsComments } from "@/components/news/news-comments";
import type { ApiResponse, News } from "@/lib/types/api";

async function getNews(slug: string): Promise<News | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${apiUrl}/public/news/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;

    const payload = (await res.json()) as ApiResponse<News>;
    return payload.data;
  } catch {
    return null;
  }
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getNews(slug);

  if (!data) notFound();

  return (
    <PublicShell>
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 md:px-6">
        <h1 className="font-[var(--font-sora)] text-3xl font-bold">{data.title}</h1>
        <p className="text-sm text-muted-foreground">{data.author ? `Penulis: ${data.author}` : "Dinas Pertanian"}</p>
        <article className="rounded-xl border border-border bg-card p-6">
          <p className="whitespace-pre-wrap text-sm leading-7">{data.content}</p>
        </article>
        <NewsComments newsSlug={data.slug} initialComments={data.comments ?? []} initialCount={data.comments_count ?? data.comments?.length ?? 0} />
      </main>
    </PublicShell>
  );
}
