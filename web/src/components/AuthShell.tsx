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
