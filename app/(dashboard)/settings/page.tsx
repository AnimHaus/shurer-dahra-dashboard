"use client";

import { useState, useEffect, useRef } from "react";
import { BG_AUDIO_API } from "@/lib/types";

const inputCls =
  "w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-card " +
  "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow";

export default function SettingsPage() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(BG_AUDIO_API)
      .then((r) => r.json())
      .then((d) => setCurrentUrl(d.url))
      .catch(() => {});
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BG_AUDIO_API}/upload`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail ?? "Upload failed");
      }
      const data = await res.json();
      setCurrentUrl(data.url);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setStatus({ type: "success", message: "Background audio updated successfully." });
    } catch (e: unknown) {
      setStatus({ type: "error", message: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Site-wide configuration</p>
      </div>

      {/* ── Background Audio ── */}
      <div className="border border-border rounded-2xl bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Background Audio</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a new audio file to replace the site-wide background song. MP3, WAV, OGG, or FLAC — max 50 MB.
          </p>
        </div>

        {/* Current file */}
        {currentUrl && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current file</p>
            <audio controls src={currentUrl} className="w-full h-10 rounded-lg" />
            <p className="text-xs text-muted-foreground truncate">{currentUrl}</p>
          </div>
        )}

        {/* Upload */}
        <div className="space-y-3">
          <div
            className="border-2 border-dashed border-border rounded-xl px-4 py-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <svg className="mx-auto w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm text-muted-foreground">Click to choose audio file</p>
                <p className="text-xs text-muted-foreground">MP3, WAV, OGG, FLAC</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac"
            className="hidden"
            onChange={handleFile}
          />

          {status && (
            <p className={`text-xs px-3 py-2 rounded-lg ${status.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
              {status.message}
            </p>
          )}

          <button
            disabled={!file || uploading}
            onClick={handleUpload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-opacity disabled:opacity-40"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg>
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Upload &amp; Replace
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
