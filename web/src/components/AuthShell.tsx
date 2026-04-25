"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { MeshBackground } from "@/components/MeshBackground";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { Logo } from "@/components/Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden">
      <MeshBackground />
      <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
      <CursorSpotlight color="rgba(155, 92, 255, 0.18)" size={620} />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="border-gradient relative w-full overflow-hidden rounded-3xl bg-card/70 p-8 backdrop-blur-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <div className="flex justify-center">
            <Link href="/" className="inline-flex">
              <Logo withWordmark={false} size={36} href="" />
            </Link>
          </div>

          <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-7">{children}</div>

          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled
        title="Coming soon"
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/40 text-sm transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.737 2.986-4.296 2.986-7.351z"
          />
          <path
            fill="currentColor"
            d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.954-3.391.954-2.609 0-4.819-1.764-5.609-4.13H3.064v2.59A9.997 9.997 0 0 0 12 22z"
          />
          <path
            fill="currentColor"
            d="M6.391 13.892A6.012 6.012 0 0 1 6.077 12c0-.659.114-1.296.314-1.892V7.518H3.064A9.998 9.998 0 0 0 2 12c0 1.614.387 3.14 1.064 4.482l3.327-2.59z"
          />
          <path
            fill="currentColor"
            d="M12 5.978c1.473 0 2.795.507 3.835 1.504l2.864-2.864C16.96 2.99 14.696 2 12 2A9.997 9.997 0 0 0 3.064 7.518L6.39 10.108C7.181 7.74 9.391 5.978 12 5.978z"
          />
        </svg>
        Google
      </button>
      <button
        type="button"
        disabled
        title="Coming soon"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/40 text-sm transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.27-.01-.97-.02-1.91-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.96 10.96 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
          />
        </svg>
        GitHub
      </button>
    </div>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="relative my-6 text-center text-xs text-muted-foreground">
      <div aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
      <span className="relative bg-background/0 px-3 backdrop-blur">{children}</span>
    </div>
  );
}
