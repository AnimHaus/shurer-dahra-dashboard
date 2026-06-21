"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ArticlesTab from "@/components/dashboard/ArticlesTab";
import { API } from "@/lib/types";
import type { Article } from "@/lib/types";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles]         = useState<Article[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<Article | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data: Article[] = await fetch(API).then((r) => r.json());
      setArticles(data);
      setSelected((prev) => prev ? data.find((a) => a.id === prev.id) ?? data[0] ?? null : data[0] ?? null);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this article?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  }

  async function toggleField(id: string, field: "active" | "pinned", value: boolean) {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }

  return (
    <ArticlesTab
      articles={articles}
      loading={loading}
      selectedArticle={selected}
      onSelect={setSelected}
      onEdit={(a) => router.push(`/compose/${a.id}`)}
      onDelete={handleDelete}
      onToggle={toggleField}
      onSelectUpdate={setSelected}
    />
  );
}
