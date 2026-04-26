"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { token, email, logout, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const onSignOut = () => {
    logout();
    router.push("/");
  };

  const onAuthArea =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/links/");

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4"
    >
      <div className="pointer-events-auto mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full border border-border/60 bg-card/55 px-4 py-2 shadow-glow-sm backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Logo />
          {!onAuthArea && (
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/#features">Features</NavLink>
              <NavLink href="/#how">How it works</NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {ready && token ? (
            <>
              {!onAuthArea && (
                <Link
                  href="/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-sm font-medium hover:border-primary/40 hover:shadow-glow-sm transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              {onAuthArea && (
                <span
                  title={email ?? undefined}
                  className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-xs"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-gradient text-[10px] font-semibold text-white">
                    {(email ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[200px] truncate text-foreground/80">{email}</span>
                </span>
              )}
              <button
                onClick={onSignOut}
                aria-label="Sign out"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-all hover:border-red-500/40 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            ready && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-sm font-medium text-foreground/90 transition-all hover:border-primary/40 hover:text-foreground hover:shadow-glow-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient bg-[length:200%_200%] animate-gradient-shift px-4 py-1.5 text-sm font-medium text-white shadow-glow-sm transition-all hover:shadow-glow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Get started
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
