"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({
  label, value, sub, accent = false,
}: {
  label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <Card className={accent ? "bg-foreground text-background ring-foreground/20" : ""}>
      <CardContent>
        <p className={`text-xs font-medium mb-1 ${accent ? "text-background/60" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className={`text-3xl font-bold tracking-tight ${accent ? "text-background" : "text-foreground"}`}>
          {value}
        </p>
        {sub && (
          <p className={`text-xs mt-1 ${accent ? "text-background/50" : "text-muted-foreground"}`}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({
  checked, onChange,
}: {
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        focus-visible:ring-2 focus-visible:ring-ring ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-background transition-transform
          ${checked ? "translate-x-4" : "translate-x-1"}`}
      />
    </button>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
        {hint && <span className="font-normal text-muted-foreground/60 ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
export function SectionCard({
  title, children,
}: {
  title: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">{children}</CardContent>
    </Card>
  );
}
