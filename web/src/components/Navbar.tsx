"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { token, email, logout, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const onSignOut = () => {
    logout();
    router.push("/");
  };

  // Hide chrome on the dashboard (it has its own sidebar)
  const onDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/links/");
  if (onDashboard) return null;

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40"
    >
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full border border-border/60 bg-background/60 px-4 py-2 backdrop-blur-xl">
        <Logo />

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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {ready && token ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/50 px-3 py-1.5 text-sm hover:border-primary/40 hover:shadow-glow-sm transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <span className="hidden lg:inline text-xs text-muted-foreground">
                {email}
              </span>
              <Button variant="ghost" size="sm" onClick={onSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            ready && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-brand-gradient bg-[length:200%_200%] animate-gradient-shift px-4 py-1.5 text-sm font-medium text-white shadow-glow-sm hover:shadow-glow transition-all"
                >
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
