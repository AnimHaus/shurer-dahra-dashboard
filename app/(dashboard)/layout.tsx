"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type NavItem = { path: string; label: string; icon: React.ReactNode };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [open, setOpen] = useState(true);

  const navItems: NavItem[] = [
    {
      path: "/overview", label: "Overview",
      icon: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    },
    {
      path: "/articles", label: "Articles",
      icon: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round"/></svg>,
    },
    {
      path: "/compose", label: "New Article",
      icon: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    },
    {
      path: "/gallery", label: "Gallery",
      icon: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
  ];

  const activeLabel =
    navItems.find((n) => pathname === n.path || pathname.startsWith(n.path + "/"))?.label ?? "";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`${open ? "w-56" : "w-14"} shrink-0 bg-muted border-r border-border flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold">S</span>
          </div>
          {open && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Shurer Dhara</p>
              <p className="text-[10px] text-muted-foreground truncate">Editorial</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <button key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-colors
                  ${active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent/40 hover:text-foreground"}`}>
                {item.icon}
                {open && <span className="text-xs font-medium truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-3">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="w-full">
            <svg className={`w-4 h-4 transition-transform ${open ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-3.5 flex items-center justify-between shrink-0">
          <h1 className="text-sm font-semibold text-foreground">{activeLabel}</h1>
          {!pathname.startsWith("/compose") && (
            <Button size="sm" onClick={() => router.push("/compose")}>
              + New Article
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
