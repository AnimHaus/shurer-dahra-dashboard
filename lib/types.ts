export interface Article {
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
  views?: number;
  comments?: number;
}

export interface ArticleForm {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  imageUrl: string;
  tags: string;
  type: string;
  author: string;
  publishDate: string;
  active: boolean;
  pinned: boolean;
  seoTitle: string;
  seoDesc: string;
}

export const EMPTY_FORM: ArticleForm = {
  title: "", slug: "", body: "", excerpt: "", imageUrl: "",
  tags: "", type: "news", author: "", publishDate: "",
  active: true, pinned: false, seoTitle: "", seoDesc: "",
};

export const API =
  (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:8000") + "/api/news";

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";

// ─── Brand palette ────────────────────────────────────────────────────────────
export const C_CRIMSON  = "#b31b20";
export const C_APRICOT  = "#e89d75";
export const C_BLUSH    = "#f6c299";
export const C_CHARCOAL = "#2b2b2b";
export const PIE_COLORS = [C_CRIMSON, C_APRICOT, C_BLUSH];

// ─── Tag styles ───────────────────────────────────────────────────────────────
export const TAG_VARIANTS: Record<string, string> = {
  event:        "bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]",
  announcement: "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
  update:       "bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]",
  urgent:       "bg-destructive/10 text-destructive border-destructive/20",
  music:        "bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]",
  news:         "bg-secondary/60 text-foreground/80 border-border",
};
export const tagClass = (t: string) =>
  TAG_VARIANTS[t.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";

export const inputCls =
  "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-card " +
  "focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow";
