"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Field, SectionCard, Toggle } from "./ui";
import { slugify } from "@/lib/dashboard";
import { inputCls } from "@/lib/types";
import type { ArticleForm } from "@/lib/types";

interface Props {
  form: ArticleForm;
  setForm: (f: ArticleForm) => void;
  editingId: string | null;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ComposeTab({
  form, setForm, editingId, saving, onSubmit, onCancel,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <form onSubmit={onSubmit} className="space-y-5">

        <SectionCard title="Content">
          <Field label="Title *">
            <input
              type="text" value={form.title} required placeholder="Article headline"
              onChange={(e) =>
                setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Slug" hint="(auto-generated, editable)">
            <input
              type="text" value={form.slug} placeholder="article-slug"
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              className={inputCls}
            />
          </Field>
          <Field label="Excerpt" hint="(short summary shown on card)">
            <textarea
              value={form.excerpt}
              placeholder="One or two sentences summarising the article…"
              rows={2}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className={`${inputCls} resize-y`}
            />
          </Field>
          <Field label="Body *" hint="(blank lines separate paragraphs)">
            <textarea
              value={form.body} required
              placeholder="Write the full article here…"
              rows={14}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className={`${inputCls} resize-y`}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Media">
          <Field label="Cover Image URL" hint="(optional)">
            <input
              type="url" value={form.imageUrl} placeholder="https://…"
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className={inputCls}
            />
          </Field>
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl} alt="Preview"
              className="w-full max-h-48 object-cover rounded-xl border border-border"
            />
          )}
        </SectionCard>

        <SectionCard title="Metadata">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}
              >
                <option value="news">News</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
              </select>
            </Field>
            <Field label="Author">
              <input
                type="text" value={form.author} placeholder="Author name"
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Tags" hint="(comma-separated: event, music, urgent…)">
            <input
              type="text" value={form.tags} placeholder="event, music"
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Publish Date" hint="(leave blank to use now)">
            <input
              type="datetime-local" value={form.publishDate}
              onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
              className={inputCls}
            />
          </Field>
        </SectionCard>

        <SectionCard title="SEO">
          <Field label="SEO Title" hint="(defaults to article title)">
            <input
              type="text" value={form.seoTitle} placeholder="Custom search engine title"
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="SEO Description" hint="(160 chars max)">
            <textarea
              value={form.seoDesc} placeholder="Meta description…"
              rows={3} maxLength={160}
              onChange={(e) => setForm({ ...form, seoDesc: e.target.value })}
              className={`${inputCls} resize-none`}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {form.seoDesc.length}/160
            </p>
          </Field>
        </SectionCard>

        <SectionCard title="Visibility">
          <div className="flex gap-8">
            {([
              { key: "active" as const, label: "Live",   sub: "Visible on the website"   },
              { key: "pinned" as const, label: "Pinned", sub: "Always shown at the top" },
            ] as const).map(({ key, label, sub }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <Toggle
                  checked={form[key] as boolean}
                  onChange={(v) => setForm({ ...form, [key]: v })}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </label>
            ))}
          </div>
        </SectionCard>

        <Separator />

        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save Changes" : "Publish Article"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
