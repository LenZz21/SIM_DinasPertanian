"use client";

import { useEffect, useState } from "react";
import { recordPublicNewsView } from "@/lib/api/public";

type NewsViewCounterProps = {
  slug: string;
  initialViews: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function NewsViewCounter({ slug, initialViews }: NewsViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const storageKey = `sim-news-view:${slug}:${todayKey()}`;

    if (localStorage.getItem(storageKey) === "1") return;

    recordPublicNewsView(slug)
      .then((response) => {
        setViews(response.data.views_count);
        localStorage.setItem(storageKey, "1");
      })
      .catch(() => undefined);
  }, [slug]);

  return <>{views} kali dilihat</>;
}
