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
      className="sticky top-0 z-40"
    >
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full border border-border/60 bg-background/60 px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Logo />
          {!onAuthArea && (
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/#features">Features</NavLink>
              <NavLink href="/#how">How it works</NavLink>
              <a
                href="https://github.com/DavidStone244/short.ly"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.27-.01-.97-.02-1.91-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.96 10.96 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                </svg>
                GitHub
              </a>
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
