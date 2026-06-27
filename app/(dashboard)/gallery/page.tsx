"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GALLERY_API, FOLDERS_API } from "@/lib/types";

interface GalleryImage {
  id: string;
  title: string;
  caption?: string | null;
  category: string;
  url: string;
  order: number;
  active: boolean;
  createdAt: string;
}

interface GalleryFolder {
  id: string;
  slug: string;
  label: string;
  order: number;
}

const inputCls =
  "w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-card " +
  "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow";

export default function GalleryPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [images, setImages]     = useState<GalleryImage[]>([]);
  const [folders, setFolders]   = useState<GalleryFolder[]>([]);
  const [loading, setLoading]   = useState(true);

  // ── Folder panel state ────────────────────────────────────────────────────
  const [activeFolderSlug, setActiveFolderSlug] = useState<string>("all");
  const [newFolderLabel, setNewFolderLabel]     = useState("");
  const [newFolderOrder, setNewFolderOrder]     = useState(0);
  const [creatingFolder, setCreatingFolder]     = useState(false);
  const [editingFolder, setEditingFolder]       = useState<GalleryFolder | null>(null);
  const [editFolderLabel, setEditFolderLabel]   = useState("");
  const [editFolderOrder, setEditFolderOrder]   = useState(0);

  // ── Image panel state ─────────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [selected, setSelected]   = useState<GalleryImage | null>(null);
  const [editMode, setEditMode]   = useState(false);

  // Upload form — shared metadata applied to all queued files
  const [uploadCaption, setUploadCaption]   = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadOrder, setUploadOrder]       = useState(0);
  const [uploadActive, setUploadActive]     = useState(true);
  // Per-file queue: each entry has the File + an editable title
  const [queue, setQueue] = useState<{ file: File; title: string; preview: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit form
  const [editTitle, setEditTitle]       = useState("");
  const [editCaption, setEditCaption]   = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editOrder, setEditOrder]       = useState(0);
  const [editActive, setEditActive]     = useState(true);

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch(GALLERY_API).then((r) => r.json());
      setImages(Array.isArray(data) ? data : []);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      const data = await fetch(FOLDERS_API).then((r) => r.json());
      setFolders(Array.isArray(data) ? data : []);
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    loadImages();
    loadFolders();
  }, [loadImages, loadFolders]);

  // Sync upload category to active folder
  useEffect(() => {
    if (activeFolderSlug !== "all") setUploadCategory(activeFolderSlug);
  }, [activeFolderSlug]);

  // Populate edit form when selected changes
  useEffect(() => {
    if (selected && editMode) {
      setEditTitle(selected.title);
      setEditCaption(selected.caption ?? "");
      setEditCategory(selected.category);
      setEditOrder(selected.order);
      setEditActive(selected.active);
    }
  }, [selected, editMode]);

  // ── Folder CRUD ───────────────────────────────────────────────────────────
  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderLabel.trim()) return;
    setCreatingFolder(true);
    await fetch(FOLDERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newFolderLabel.trim(), order: newFolderOrder }),
    });
    setNewFolderLabel("");
    setNewFolderOrder(0);
    setCreatingFolder(false);
    loadFolders();
  }

  function startEditFolder(f: GalleryFolder) {
    setEditingFolder(f);
    setEditFolderLabel(f.label);
    setEditFolderOrder(f.order);
  }

  async function handleSaveFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFolder) return;
    await fetch(`${FOLDERS_API}/${editingFolder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editFolderLabel.trim(), order: editFolderOrder }),
    });
    setEditingFolder(null);
    loadFolders();
  }

  async function handleDeleteFolder(f: GalleryFolder) {
    const count = images.filter((img) => img.category === f.slug).length;
    const msg = count > 0
      ? `Delete folder "${f.label}"? ${count} image(s) using this category will keep their category slug but the folder will no longer appear in filters.`
      : `Delete folder "${f.label}"?`;
    if (!confirm(msg)) return;
    await fetch(`${FOLDERS_API}/${f.id}`, { method: "DELETE" });
    if (activeFolderSlug === f.slug) setActiveFolderSlug("all");
    loadFolders();
  }

  // ── Image CRUD ────────────────────────────────────────────────────────────
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const entries = files.map((f) => ({
      file: f,
      title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      preview: URL.createObjectURL(f),
    }));
    setQueue((prev) => [...prev, ...entries]);
    // Reset so the same files can be re-added if needed
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFromQueue(index: number) {
    setQueue((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateQueueTitle(index: number, title: string) {
    setQueue((prev) => prev.map((item, i) => i === index ? { ...item, title } : item));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!queue.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: queue.length });
    let done = 0;
    for (const item of queue) {
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("title", item.title.trim() || item.file.name);
      fd.append("caption", uploadCaption);
      fd.append("category", uploadCategory);
      fd.append("order", String(uploadOrder));
      fd.append("active", String(uploadActive));
      try {
        await fetch(GALLERY_API, { method: "POST", body: fd });
      } catch { /* continue with remaining files */ }
      done++;
      setUploadProgress({ done, total: queue.length });
    }
    // Revoke all object URLs
    queue.forEach((item) => URL.revokeObjectURL(item.preview));
    setQueue([]);
    setUploadCaption("");
    setUploadCategory(activeFolderSlug !== "all" ? activeFolderSlug : "general");
    setUploadOrder(0);
    setUploadActive(true);
    setUploadProgress(null);
    setUploading(false);
    loadImages();
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    await fetch(`${GALLERY_API}/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        caption: editCaption || null,
        category: editCategory,
        order: editOrder,
        active: editActive,
      }),
    });
    setEditMode(false);
    loadImages();
  }

  async function handleDeleteImage(id: string) {
    if (!confirm("Permanently delete this image from the gallery and R2?")) return;
    await fetch(`${GALLERY_API}/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    loadImages();
  }

  async function toggleActive(img: GalleryImage) {
    await fetch(`${GALLERY_API}/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !img.active }),
    });
    loadImages();
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const allFolderOptions = [{ id: "all", slug: "all", label: "All Images", order: -1 }, ...folders];
  const filteredImages = activeFolderSlug === "all"
    ? images
    : images.filter((img) => img.category === activeFolderSlug);
  const sortedImages = [...filteredImages].sort(
    (a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt),
  );

  // Category options for selects: folders + any orphaned slugs in use
  const folderSlugs = new Set(folders.map((f) => f.slug));
  const orphanedSlugs = [...new Set(images.map((i) => i.category))].filter(
    (s) => !folderSlugs.has(s),
  );
  const categoryOptions: { slug: string; label: string }[] = [
    ...folders.map((f) => ({ slug: f.slug, label: f.label })),
    ...orphanedSlugs.map((s) => ({ slug: s, label: s })),
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">

      {/* ═══ Column 1: Folders ═══════════════════════════════════════════════ */}
      <div className="w-56 shrink-0 border-r border-border bg-muted flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Folders</p>
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto py-1">
          {allFolderOptions.map((f) => {
            const count = f.slug === "all" ? images.length : images.filter((i) => i.category === f.slug).length;
            const isActive = activeFolderSlug === f.slug;
            const realFolder = folders.find((x) => x.slug === f.slug);
            return (
              <div key={f.slug} className="group relative px-1.5 my-0.5">
                <button
                  onClick={() => { setActiveFolderSlug(f.slug); setSelected(null); setEditMode(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-sm transition-colors rounded-lg ${
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent/40 hover:text-foreground"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    {f.slug === "all"
                      ? <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>
                      : <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    }
                  </svg>
                  <span className="flex-1 text-xs font-medium truncate">{f.label}</span>
                  <span className={`text-[10px] shrink-0 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{count}</span>
                </button>

                {realFolder && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-card border border-border rounded-lg px-1 py-0.5 shadow-sm z-10">
                    <button
                      onClick={() => startEditFolder(realFolder)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="Rename"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(realFolder)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Inline edit form */}
        {editingFolder && (
          <div className="border-t border-border px-3 py-3 bg-card">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Rename Folder</p>
            <form onSubmit={handleSaveFolder} className="space-y-2">
              <input className={inputCls} value={editFolderLabel} onChange={(e) => setEditFolderLabel(e.target.value)} autoFocus required />
              <input type="number" className={inputCls} value={editFolderOrder} onChange={(e) => setEditFolderOrder(Number(e.target.value))} placeholder="Order" />
              <div className="flex gap-1.5">
                <Button type="submit" size="sm" className="flex-1 h-7 text-xs">Save</Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingFolder(null)}>×</Button>
              </div>
            </form>
          </div>
        )}

        {/* New folder form */}
        <div className="border-t border-border px-3 py-3">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">New Folder</p>
          <form onSubmit={handleCreateFolder} className="space-y-2">
            <input className={inputCls} placeholder="Folder name" value={newFolderLabel} onChange={(e) => setNewFolderLabel(e.target.value)} required />
            <input type="number" className={inputCls} placeholder="Order (0)" value={newFolderOrder} onChange={(e) => setNewFolderOrder(Number(e.target.value))} />
            <Button type="submit" size="sm" className="w-full h-7 text-xs" disabled={creatingFolder || !newFolderLabel.trim()}>
              {creatingFolder ? "Creating…" : "+ Create Folder"}
            </Button>
          </form>
        </div>
      </div>

      {/* ═══ Column 2: Image list ════════════════════════════════════════════ */}
      <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {loading ? "Loading…" : `${sortedImages.length} image${sortedImages.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedImages.length === 0 && !loading ? (
            <p className="text-xs text-muted-foreground p-4">No images in this folder.</p>
          ) : (
            sortedImages.map((img) => (
              <button
                key={img.id}
                onClick={() => { setSelected(img); setEditMode(false); }}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors ${
                  selected?.id === img.id ? "bg-accent/40 border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{img.title}</p>
                  <p className="text-[10px] text-muted-foreground">{img.category}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${img.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <span className="text-[9px] text-muted-foreground">#{img.order}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ═══ Column 3: Detail / upload ═══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">

        {/* Upload form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Upload Images</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* File picker / drop zone */}
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files).filter((f) =>
                  ["image/jpeg","image/png","image/webp","image/gif"].includes(f.type)
                );
                if (!files.length) return;
                setQueue((prev) => [...prev, ...files.map((f) => ({
                  file: f,
                  title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
                  preview: URL.createObjectURL(f),
                }))]);
              }}
            >
              <p className="text-sm text-muted-foreground">
                Click or drag &amp; drop — JPEG, PNG, WEBP, GIF · max 10 MB each · multiple files allowed
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {/* Per-file queue with editable titles */}
            {queue.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {queue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted rounded-xl px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <input
                      className={inputCls + " flex-1"}
                      value={item.title}
                      onChange={(e) => updateQueueTitle(i, e.target.value)}
                      placeholder="Title"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromQueue(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0 text-lg leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Shared metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Folder / Category</label>
                <select
                  className={inputCls}
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                >
                  {categoryOptions.length === 0 && <option value="general">general</option>}
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Caption (all files)</label>
                <input
                  className={inputCls}
                  placeholder="Optional shared caption"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Starting Order</label>
                <input
                  type="number"
                  className={inputCls}
                  value={uploadOrder}
                  onChange={(e) => setUploadOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={uploadActive}
                    onChange={(e) => setUploadActive(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Visible on site</span>
                </label>
              </div>
            </div>

            {uploadProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{uploadProgress.done} / {uploadProgress.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={uploading || queue.length === 0} className="w-full">
              {uploading
                ? `Uploading ${uploadProgress?.done ?? 0} / ${uploadProgress?.total ?? queue.length}…`
                : queue.length > 0
                  ? `Upload ${queue.length} file${queue.length !== 1 ? "s" : ""}`
                  : "Upload to Gallery"
              }
            </Button>
          </form>
        </div>

        {/* Selected image detail / edit */}
        {selected && (
          <div className="bg-card border border-border rounded-2xl p-6">
            {!editMode ? (
              <>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{selected.title}</h2>
                    {selected.caption && <p className="text-xs text-muted-foreground mt-0.5">{selected.caption}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(selected)}>
                      {selected.active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(selected.id)}>Delete</Button>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.url} alt={selected.title} className="max-h-72 w-full object-contain rounded-lg bg-muted mb-4" />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Folder</p>
                    <p className="text-sm font-semibold capitalize">{selected.category}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Order</p>
                    <p className="text-sm font-semibold">{selected.order}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Visible</p>
                    <p className={`text-sm font-semibold ${selected.active ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {selected.active ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 break-all">{selected.url}</p>
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-foreground mb-4">Edit Image Metadata</h2>
                <form onSubmit={handleEditSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title *</label>
                      <input className={inputCls} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Folder / Category</label>
                      <select className={inputCls} value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                        {categoryOptions.length === 0 && <option value="general">general</option>}
                        {categoryOptions.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Caption</label>
                    <input className={inputCls} value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Optional caption" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Display Order</label>
                      <input type="number" className={inputCls} value={editOrder} onChange={(e) => setEditOrder(Number(e.target.value))} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="w-4 h-4 accent-primary" />
                        <span className="text-sm text-foreground">Visible on site</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
