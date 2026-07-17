"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";

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
    {
      path: "/settings", label: "Settings",
      icon: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
  ];

  const activeLabel =
    navItems.find((n) => pathname === n.path || pathname.startsWith(n.path + "/"))?.label ?? "";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`${open ? "w-56" : "w-14"} shrink-0 bg-muted border-r border-border flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="flex items-center justify-center gap-2.5 px-4 py-2 border-b border-border">
          <Image
            src="/logo.png"
            alt="Shurer Dhara"
            width={120}
            height={40}
            className={`w-auto object-contain transition-all duration-200 ${open ? "h-10" : "h-6"}`}
            priority
          />
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

        <div className="px-2 pb-3 flex flex-col gap-1">
          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign out"
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-colors text-foreground/70 hover:bg-destructive/10 hover:text-destructive`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {open && <span className="text-xs font-medium truncate">Sign out</span>}
            </button>
          </form>

          {/* Collapse toggle */}
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
