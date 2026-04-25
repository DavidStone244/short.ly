"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  QrCode,
  Lock,
  Timer,
  Zap,
  Globe,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { ShortenForm } from "@/components/ShortenForm";
import { Particles } from "@/components/Particles";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { MeshBackground } from "@/components/MeshBackground";
import { TypewriterHeadline } from "@/components/TypewriterHeadline";

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <MeshBackground />
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <Particles />
        <CursorSpotlight />

        <div className="relative mx-auto max-w-6xl px-5 pb-32 pt-24 sm:pt-32">
          <TypewriterHeadline
            lines={[
              { prefix: "Shorten ", highlight: "smarter", suffix: "." },
              { prefix: "Share ", highlight: "faster", suffix: "." },
            ]}
            className="text-balance text-center text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-center text-base text-muted-foreground sm:text-lg"
          >
            A futuristic URL shortener with first-class analytics, QR codes,
            password-gated links, and auto-expiry. Built for speed.
          </motion.p>

          {/* Hero shorten form — the star of the show */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative mx-auto mt-14 max-w-3xl"
          >
            {/* Outer glow halo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-80 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(59,130,255,0.35), transparent 70%), radial-gradient(closest-side at 80% 30%, rgba(155,92,255,0.32), transparent 70%), radial-gradient(closest-side at 20% 80%, rgba(0,229,255,0.25), transparent 70%)",
              }}
            />
            <div className="border-gradient rounded-[2rem] bg-card/60 p-3 backdrop-blur-2xl shadow-glow sm:rounded-[2.25rem]">
              <ShortenForm size="hero" />
            </div>
          </motion.div>
        </div>

        {/* Bottom fade into rest of page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* FEATURES */}
      <section id="features" className="relative mx-auto max-w-6xl px-5 py-24">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need. Nothing you don't."
          subtitle="Power tools wrapped in a UI that gets out of the way."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<BarChart3 className="h-5 w-5" />}
            title="Real-time analytics"
            desc="Per-link click counts, unique visitors, browser & OS breakdown."
            tone="blue"
          />
          <Feature
            icon={<QrCode className="h-5 w-5" />}
            title="QR codes"
            desc="One-tap printable QR for every link. Perfect for offline campaigns."
            tone="purple"
          />
          <Feature
            icon={<Lock className="h-5 w-5" />}
            title="Password protection"
            desc="Gate sensitive links behind a password. Argon2-hashed, never stored in plain text."
            tone="cyan"
          />
          <Feature
            icon={<Timer className="h-5 w-5" />}
            title="Auto-expiry"
            desc="Set an expiration time. The link self-destructs cleanly when due."
            tone="pink"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative mx-auto max-w-6xl px-5 py-24">
        <SectionHeader
          eyebrow="How it works"
          title="From long URL to shareable link in three motions."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <Step
            n={1}
            title="Paste your URL"
            desc="Anywhere — landing page, dashboard, or hit POST /api/links from your terminal."
            icon={<Sparkles className="h-4 w-4" />}
          />
          <Step
            n={2}
            title="We compute a base62 code"
            desc="Auto-incrementing IDs encoded into 6-char codes. No collisions, no retries."
            icon={<Zap className="h-4 w-4" />}
          />
          <Step
            n={3}
            title="Track every click"
            desc="Async analytics pipeline logs UA, browser, OS, and timestamps without blocking the redirect."
            icon={<Globe className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-5 py-24">
        <div className="border-gradient relative overflow-hidden rounded-3xl bg-card/40 p-10 backdrop-blur-xl sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-32 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(closest-side, rgba(59,130,255,0.35), transparent 60%), radial-gradient(closest-side at 80% 20%, rgba(155,92,255,0.3), transparent 60%)",
            }}
          />
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to ship faster links?
              </h3>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Create your account and start tracking clicks in under 30 seconds.
                No credit card. No bullshit.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] px-5 py-3 text-sm font-medium text-white shadow-glow transition-all hover:bg-[position:100%_50%]"
              >
                Get started free
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/40 px-5 py-3 text-sm transition-colors hover:border-primary/40"
              >
                Explore features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>short.ly · open source URL shortener</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/DavidStone244/short.ly" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="/login" className="hover:text-foreground transition-colors">Sign in</a>
            <a href="/register" className="hover:text-foreground transition-colors">Get started</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: "blue" | "purple" | "cyan" | "pink";
}) {
  const glow = {
    blue: "from-[#3b82ff]/30 to-transparent",
    purple: "from-[#9b5cff]/30 to-transparent",
    cyan: "from-[#00e5ff]/30 to-transparent",
    pink: "from-[#ff5cf0]/30 to-transparent",
  }[tone];
  const iconBg = {
    blue: "bg-[#3b82ff]/15 text-[#9bb8ff] ring-1 ring-[#3b82ff]/30",
    purple: "bg-[#9b5cff]/15 text-[#c4a5ff] ring-1 ring-[#9b5cff]/30",
    cyan: "bg-[#00e5ff]/15 text-[#7ee9ff] ring-1 ring-[#00e5ff]/30",
    pink: "bg-[#ff5cf0]/15 text-[#ffabf3] ring-1 ring-[#ff5cf0]/30",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${glow} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-80`}
      />
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${iconBg}`}>{icon}</div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

function Step({
  n,
  title,
  desc,
  icon,
}: {
  n: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: n * 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="font-mono text-3xl font-light text-gradient">0{n}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary/50 text-muted-foreground">
          {icon}
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </motion.div>
  );
}
