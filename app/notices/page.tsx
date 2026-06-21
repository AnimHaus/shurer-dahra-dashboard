"use client";

import { useState, useEffect, useCallback } from "react";

interface Notice {
  id: string;
  slug: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  likes: number;
  tags: string[];
  active: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const API =
  (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:8000") +
  "/api/news";

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

const TAG_COLORS: Record<string, string> = {
  event: "bg-indigo-100 text-indigo-600",
  announcement: "bg-emerald-100 text-emerald-600",
  update: "bg-sky-100 text-sky-600",
  urgent: "bg-rose-100 text-rose-600",
  music: "bg-purple-100 text-purple-600",
};
function tagColor(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] ?? "bg-zinc-100 text-zinc-500";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const EMPTY_FORM = {
  title: "",
  body: "",
  imageUrl: "",
  tags: "",
  active: true,
  pinned: false,
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setNotices(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title,
      body: form.body,
      imageUrl: form.imageUrl || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      active: form.active,
      pinned: form.pinned,
    };
    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditingId(null);
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm(EMPTY_FORM);
    setSaving(false);
    fetchNotices();
  }

  function startEdit(n: Notice) {
    setEditingId(n.id);
    setForm({
      title: n.title,
      body: n.body,
      imageUrl: n.imageUrl ?? "",
      tags: n.tags.join(", "),
      active: n.active,
      pinned: n.pinned,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function toggleField(
    id: string,
    field: "active" | "pinned",
    value: boolean
  ) {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    fetchNotices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchNotices();
  }

  const pinned = notices.filter((n) => n.pinned);
  const regular = notices.filter((n) => !n.pinned);
  const ordered = [...pinned, ...regular];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Topbar */}
      <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/" className="text-zinc-400 hover:text-zinc-700 text-sm transition-colors">
            ← Dashboard
          </a>
          <span className="text-zinc-200">/</span>
          <h1 className="text-sm font-semibold text-zinc-900">Featured News &amp; Events</h1>
        </div>
        <span className="text-xs text-zinc-400">
          {notices.length} post{notices.length !== 1 ? "s" : ""}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Compose box */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-700">
              {editingId ? "Edit Post" : "Create a post…"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What's the announcement?"
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-300"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Article Content
                <span className="text-zinc-300 font-normal ml-1">(full article shown on the slug page)</span>
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Write the full article content here. This text will appear on the article's dedicated page. Use blank lines to separate paragraphs."
                rows={12}
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-y placeholder:text-zinc-300"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Image URL{" "}
                <span className="text-zinc-300 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-300"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Tags{" "}
                <span className="text-zinc-300 font-normal">
                  (comma-separated: event, announcement, update, urgent, music)
                </span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="event, music"
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-300"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer select-none">
                <ToggleSwitch
                  checked={form.active}
                  onChange={(v) => setForm({ ...form, active: v })}
                />
                Visible
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer select-none">
                <ToggleSwitch
                  checked={form.pinned}
                  onChange={(v) => setForm({ ...form, pinned: v })}
                />
                Pinned
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 border-t border-zinc-100 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-full hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : editingId ? "Save Changes" : "Publish Post"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-full hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="text-center py-16 text-sm text-zinc-400">Loading…</div>
        ) : ordered.length === 0 ? (
          <div className="text-center py-16 text-sm text-zinc-400">
            No posts yet. Create the first announcement above.
          </div>
        ) : (
          <div className="space-y-4">
            {ordered.map((n) => (
              <div
                key={n.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-opacity ${
                  n.active ? "border-zinc-200" : "border-zinc-100 opacity-55"
                } ${n.pinned ? "ring-2 ring-amber-300/50" : ""}`}
              >
                {/* Post header */}
                <div className="flex items-center gap-3 px-5 pt-5 pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-400 text-xs">{timeAgo(n.createdAt)}</p>
                  </div>
                  {/* Status badges */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {n.pinned && (
                      <span className="text-[10px] font-semibold uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                        📌 Pinned
                      </span>
                    )}
                    {!n.active && (
                      <span className="text-[10px] font-semibold uppercase bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 pt-3 pb-2">
                  <h3 className="text-zinc-900 font-semibold text-sm leading-snug mb-1">
                    {n.title}
                  </h3>
                  {n.slug && (
                    <a
                      href={`${FRONTEND_URL}/en/news/${n.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 mb-2 transition-colors"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9M9 1h6m0 0v6m0-6L7 9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      /en/news/{n.slug}
                    </a>
                  )}
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                    {n.body}
                  </p>
                </div>

                {/* Image */}
                {n.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.imageUrl}
                    alt={n.title}
                    className="w-full max-h-64 object-cover mt-2"
                  />
                )}

                {/* Tags */}
                {n.tags && n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-5 pt-3">
                    {n.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full ${tagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 mt-3">
                  {/* Like count */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{n.likes} like{n.likes !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Admin actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleField(n.id, "pinned", !n.pinned)}
                      title={n.pinned ? "Unpin" : "Pin"}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-amber-500 transition-colors text-sm"
                    >
                      📌
                    </button>
                    <button
                      onClick={() => toggleField(n.id, "active", !n.active)}
                      title={n.active ? "Hide" : "Show"}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-green-600 transition-colors text-sm"
                    >
                      {n.active ? "👁" : "🚫"}
                    </button>
                    <button
                      onClick={() => startEdit(n)}
                      title="Edit"
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      title="Delete"
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-zinc-900" : "bg-zinc-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}
