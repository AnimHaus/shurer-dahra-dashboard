"use client";

import {
  AreaChart, Area, CartesianGrid, XAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { Toggle } from "./ui";
import { fmt, timeAgo, DAYS, viewsChartConfig } from "@/lib/dashboard";
import { tagClass, FRONTEND_URL } from "@/lib/types";
import type { Article } from "@/lib/types";

interface Props {
  articles: Article[];
  loading: boolean;
  selectedArticle: Article | null;
  onSelect: (a: Article) => void;
  onEdit: (a: Article) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, field: "active" | "pinned", value: boolean) => void;
  onSelectUpdate: (a: Article) => void;
}

export default function ArticlesTab({
  articles, loading, selectedArticle,
  onSelect, onEdit, onDelete, onToggle, onSelectUpdate,
}: Props) {
  return (
    <div className="flex h-full">
      {/* ── Article list ── */}
      <div className="w-80 shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="px-4 py-3 border-b border-border sticky top-0 bg-card z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {articles.length} Articles
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground p-4">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">No articles yet.</p>
        ) : (
          [...articles]
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((a) => (
              <button
                key={a.id}
                onClick={() => onSelect(a)}
                className={`w-full text-left px-4 py-3.5 border-b border-border hover:bg-accent/30 transition-colors
                  ${selectedArticle?.id === a.id ? "bg-accent/40 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{a.title}</p>
                  <div className="flex gap-1 shrink-0 mt-0.5">
                    {a.pinned && (
                      <Badge className="text-[9px] px-1.5 py-0 h-4 bg-secondary text-foreground/80">PIN</Badge>
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${a.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.body.slice(0, 100)}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">{timeAgo(a.createdAt)}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{fmt(a.views ?? 0)} views</span>
                    <span>{a.likes} ♥</span>
                  </div>
                </div>
              </button>
            ))
        )}
      </div>

      {/* ── Article detail ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedArticle ? (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Select an article to view analytics
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header — full width */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedArticle.tags.map((t) => (
                    <span key={t} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${tagClass(t)}`}>
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-foreground leading-tight mb-1">{selectedArticle.title}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{timeAgo(selectedArticle.createdAt)}</span>
                  {selectedArticle.slug && (
                    <a
                      href={`${FRONTEND_URL}/en/news/${selectedArticle.slug}`}
                      target="_blank" rel="noreferrer"
                      className="hover:text-foreground transition-colors underline truncate max-w-xs"
                    >
                      /en/news/{selectedArticle.slug}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline"     size="sm" onClick={() => onEdit(selectedArticle)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(selectedArticle.id)}>Delete</Button>
              </div>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-2 gap-5 items-start">

              {/* ── Left: Article preview ── */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Content Preview
                    </p>
                  </CardHeader>
                  <CardContent>
                    {selectedArticle.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedArticle.imageUrl}
                        alt={selectedArticle.title}
                        className="w-full max-h-52 object-cover rounded-xl mb-4"
                      />
                    )}
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line line-clamp-10">
                      {selectedArticle.body}
                    </p>
                  </CardContent>
                </Card>

                {/* Toggles */}
                <Card>
                  <CardContent className="pt-5 flex items-center gap-8">
                    {([
                      { key: "active" as const, label: "Live",   sub: "Visible on website" },
                      { key: "pinned" as const, label: "Pinned", sub: "Always shown first" },
                    ] as const).map(({ key, label, sub }) => (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                        <Toggle
                          checked={selectedArticle[key]}
                          onChange={(v) => {
                            onToggle(selectedArticle.id, key, v);
                            onSelectUpdate({ ...selectedArticle, [key]: v });
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* ── Right: Analytics ── */}
              <div className="space-y-4">
                {/* Stat mini-cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Views", value: fmt(selectedArticle.views ?? 0) },
                    { label: "Likes",       value: selectedArticle.likes },
                    { label: "Comments",    value: selectedArticle.comments ?? 0 },
                  ].map(({ label, value }) => (
                    <Card key={label}>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Views chart */}
                <Card className="pt-0">
                  <CardHeader>
                    <CardTitle className="text-sm border-b py-3">Views — Last 30 Days</CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pt-3 sm:px-6">
                    <ChartContainer config={viewsChartConfig} className="aspect-auto h-[160px] w-full">
                      <AreaChart
                        data={DAYS.map((day, i) => {
                          const base = selectedArticle.views ?? 0;
                          const wave = Math.sin((i / 29) * Math.PI * 2.5 + 1.2) * 0.4 + 1;
                          return { day, views: Math.round((base / 30) * wave) };
                        })}
                      >
                        <defs>
                          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--color-views)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tick={{ fontSize: 10 }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Area type="natural" dataKey="views" stroke="var(--color-views)" strokeWidth={2} fill="url(#ag)" />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
