"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatCard } from "./ui";
import {
  fmt, timeAgo, buildViewsSeries, buildEngagementSeries,
  GEO_DATA, DEVICE_DATA, DAYS,
  viewsChartConfig, geoChartConfig, engagementChartConfig, deviceChartConfig,
} from "@/lib/dashboard";
import { PIE_COLORS } from "@/lib/types";
import type { Article } from "@/lib/types";

interface Props {
  articles: Article[];
  loading: boolean;
}

export default function OverviewTab({ articles, loading }: Props) {
  const [viewsRange, setViewsRange] = useState<"30d" | "14d" | "7d">("30d");

  const totalViews    = articles.reduce((s, a) => s + (a.views   ?? 0), 0);
  const totalLikes    = articles.reduce((s, a) => s + a.likes,          0);
  const totalComments = articles.reduce((s, a) => s + (a.comments ?? 0), 0);
  const activeCount   = articles.filter((a) => a.active).length;

  const allViewsSeries = buildViewsSeries(articles);
  const viewsSeries =
    viewsRange === "7d"  ? allViewsSeries.slice(-7)  :
    viewsRange === "14d" ? allViewsSeries.slice(-14) :
    allViewsSeries;

  const engagementData = buildEngagementSeries(articles);

  return (
    <div className="p-6 space-y-5 max-w-8xl mx-auto">

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={fmt(totalViews)} sub="aggregated" accent />
        <StatCard label="Total Articles" value={articles.length} sub={`${activeCount} live`} />
        <StatCard label="Total Likes"    value={fmt(totalLikes)}    sub="across all posts" />
        <StatCard label="Comments"       value={fmt(totalComments)} sub="reader responses" />
      </div>

      {/* ── Views + Geography ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 pt-0">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b py-4">
            <div className="grid flex-1 gap-1">
              <CardTitle className="text-sm">Page Views</CardTitle>
              <CardDescription>Aggregated across all articles</CardDescription>
            </div>
            <Select value={viewsRange} onValueChange={(v) => setViewsRange(v as typeof viewsRange)}>
              <SelectTrigger className="w-[130px] rounded-lg text-xs h-8" aria-label="Select range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="30d" className="rounded-lg text-xs">Last 30 days</SelectItem>
                <SelectItem value="14d" className="rounded-lg text-xs">Last 14 days</SelectItem>
                <SelectItem value="7d"  className="rounded-lg text-xs">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6">
            <ChartContainer config={viewsChartConfig} className="aspect-auto h-[200px] w-full">
              <AreaChart data={viewsSeries}>
                <defs>
                  <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-views)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tick={{ fontSize: 10 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area type="natural" dataKey="views" stroke="var(--color-views)" strokeWidth={2} fill="url(#vg)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Audience Geography</CardTitle>
            <CardDescription>By country (estimated %)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={geoChartConfig} className="h-[200px] w-full">
              <BarChart accessibilityLayer data={GEO_DATA} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" dataKey="pct" hide />
                <YAxis
                  dataKey="country" type="category"
                  tickLine={false} tickMargin={10} axisLine={false}
                  tick={{ fontSize: 11 }} width={80}
                  tickFormatter={(v: string) => v.length > 9 ? v.slice(0, 9) + "…" : v}
                />
                <ChartTooltip cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(v) => [`${v}%`, "Share"]} />}
                />
                <Bar dataKey="pct" fill="var(--color-pct)" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Engagement + Devices ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Engagement — Last 14 Days</CardTitle>
            <CardDescription>Likes and comments over time</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ChartContainer config={engagementChartConfig} className="aspect-auto h-[180px] w-full">
              <LineChart data={engagementData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={20} tick={{ fontSize: 10 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="natural" dataKey="likes"    stroke="var(--color-likes)"    strokeWidth={2} dot={false} />
                <Line type="natural" dataKey="comments" stroke="var(--color-comments)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Device Split</CardTitle>
            <CardDescription>Mobile · Desktop · Tablet</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ChartContainer config={deviceChartConfig} className="h-[180px] w-full">
              <PieChart>
                <Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                  paddingAngle={3} dataKey="value" nameKey="name">
                  {DEVICE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`${v}%`, ""]} hideLabel />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Top articles ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Articles by Views</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : articles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No articles yet.</p>
          ) : (
            <div className="space-y-3">
              {[...articles]
                .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
                .slice(0, 5)
                .map((a, i) => (
                  <div key={a.id} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-4 shrink-0 font-medium">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                      <span>{fmt(a.views ?? 0)} views</span>
                      <span>{a.likes} ♥</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.active ? "bg-emerald-500" : "bg-border"}`} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
