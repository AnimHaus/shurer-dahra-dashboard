import type { ChartConfig } from "@/components/ui/chart";
import { C_CRIMSON, C_APRICOT, C_BLUSH, C_CHARCOAL } from "./types";
import type { Article } from "./types";

// ─── Date helpers ─────────────────────────────────────────────────────────────
export const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
});

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Analytics series builders ────────────────────────────────────────────────
export function buildViewsSeries(articles: Article[]) {
  return DAYS.map((day, i) => {
    const views = articles.reduce((sum, a) => {
      const base = a.views ?? 0;
      const wave = Math.sin((i / 29) * Math.PI * 2 + (a.id.charCodeAt(0) ?? 0)) * 0.3 + 1;
      return sum + Math.round((base / 30) * wave);
    }, 0);
    return { day, views };
  });
}

export function buildEngagementSeries(articles: Article[]) {
  return DAYS.slice(-14).map((day, i) => ({
    day,
    likes: articles.reduce(
      (s, a) => s + Math.round((a.likes / 14) * (0.7 + 0.6 * Math.sin(i))), 0
    ),
    comments: articles.reduce(
      (s, a) =>
        s + Math.round(((a.comments ?? 0) / 14) * (0.5 + 0.5 * Math.cos(i * 1.3))), 0
    ),
  }));
}

// ─── Static reference data ────────────────────────────────────────────────────
export const GEO_DATA = [
  { country: "Bangladesh", pct: 42 },
  { country: "India",      pct: 22 },
  { country: "UK",         pct: 11 },
  { country: "USA",        pct: 9  },
  { country: "Canada",     pct: 6  },
  { country: "Others",     pct: 10 },
];

export const DEVICE_DATA = [
  { name: "Mobile",  value: 61 },
  { name: "Desktop", value: 31 },
  { name: "Tablet",  value: 8  },
];

// ─── Chart configs ────────────────────────────────────────────────────────────
export const viewsChartConfig = {
  views: { label: "Views", color: C_CRIMSON },
} satisfies ChartConfig;

export const geoChartConfig = {
  pct: { label: "Visitors", color: C_CHARCOAL },
} satisfies ChartConfig;

export const engagementChartConfig = {
  likes:    { label: "Likes",    color: C_CRIMSON },
  comments: { label: "Comments", color: C_APRICOT },
} satisfies ChartConfig;

export const deviceChartConfig = {
  Mobile:  { label: "Mobile",  color: C_CRIMSON },
  Desktop: { label: "Desktop", color: C_APRICOT },
  Tablet:  { label: "Tablet",  color: C_BLUSH   },
} satisfies ChartConfig;
