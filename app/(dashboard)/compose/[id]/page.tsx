"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ComposeTab from "@/components/dashboard/ComposeTab";
import { API, EMPTY_FORM } from "@/lib/types";
import { slugify } from "@/lib/dashboard";
import type { Article, ArticleForm } from "@/lib/types";

export default function EditComposePage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [form, setForm]     = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    fetch(`${API}/${id}`)
      .then((r) => r.json())
      .then((a: Article) => {
        setForm({
          title: a.title,
          slug: a.slug,
          body: a.body,
          excerpt: "",
          imageUrl: a.imageUrl ?? "",
          tags: a.tags.join(", "),
          type: a.tags.includes("event") ? "event" : "news",
          author: "",
          publishDate: "",
          active: a.active,
          pinned: a.pinned,
          seoTitle: "",
          seoDesc: "",
        });
        setReady(true);
      })
      .catch(() => router.push("/articles"));
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      body: form.body,
      imageUrl: form.imageUrl || null,
      tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      active: form.active,
      pinned: form.pinned,
    };
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    router.push("/articles");
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  return (
    <ComposeTab
      form={form}
      setForm={setForm}
      editingId={id}
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/articles")}
    />
  );
}
