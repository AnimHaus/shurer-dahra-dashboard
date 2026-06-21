"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ComposeTab from "@/components/dashboard/ComposeTab";
import { API, EMPTY_FORM } from "@/lib/types";
import { slugify } from "@/lib/dashboard";
import type { ArticleForm } from "@/lib/types";

export default function ComposePage() {
  const router = useRouter();
  const [form, setForm]       = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);

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
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    router.push("/articles");
  }

  return (
    <ComposeTab
      form={form}
      setForm={setForm}
      editingId={null}
      saving={saving}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/articles")}
    />
  );
}
