"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LinkIcon, BarChart3, LogOut, Plus, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

interface SidebarItemDef {
  href: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

export function DashboardSidebar({
  onNew,
}: {
  onNew?: () => void;
}) {
  const pathname = usePathname();
  const { email, logout } = useAuth();
  const router = useRouter();

  const items: SidebarItemDef[] = [
    { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview", shortcut: "g d" },
    { href: "/dashboard?tab=links", icon: <LinkIcon className="h-4 w-4" />, label: "Links", shortcut: "g l" },
    { href: "/dashboard?tab=analytics", icon: <BarChart3 className="h-4 w-4" />, label: "Analytics", shortcut: "g a" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href.split("?")[0]);
  };

  const onLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 backdrop-blur-xl">
      <div className="px-5 pt-5">
        <Logo />
      </div>

      <div className="px-4 mt-6">
        <button
          onClick={onNew}
          className="group flex w-full items-center justify-between rounded-xl bg-brand-gradient bg-[length:200%_200%] px-3 py-2 text-sm font-medium text-white shadow-glow-sm transition-all hover:bg-[position:100%_50%] hover:shadow-glow"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New link
          </span>
          <kbd className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono">N</kbd>
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-secondary/70 ring-1 ring-border/60"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative flex items-center gap-2.5 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={active ? "text-primary" : ""}>{item.icon}</span>
                {item.label}
              </span>
              {item.shortcut && (
                <kbd className="relative hidden font-mono text-[10px] text-muted-foreground/70 group-hover:inline">
                  {item.shortcut}
                </kbd>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          Back to homepage
        </Link>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-[11px] font-semibold text-white">
          {(email?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium">{email}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Signed in
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={onLogout}
          aria-label="Sign out"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
