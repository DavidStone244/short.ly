"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  ExternalLink,
  BarChart3,
  Lock,
  Clock,
  Search,
  Plus,
  X,
  Sparkles,
  Globe,
  MousePointerClick,
  Link2,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type LinkOut, type LinkStats } from "@/lib/api";
import { CopyButton } from "@/components/CopyButton";
import { ShortenForm } from "@/components/ShortenForm";
import { Sparkline } from "@/components/Sparkline";
import { toast } from "sonner";

export default function DashboardPage() {
  const { token, ready } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<LinkOut[] | null>(null);
  const [stats, setStats] = useState<Record<string, LinkStats>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  // Auth + initial load
  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listLinks(token);
        if (cancelled) return;
        setLinks(list);
        const subset = list.slice(0, 20);
        const results = await Promise.all(
          subset.map((l) =>
            api
              .getStats(l.code, token)
              .then((s) => [l.code, s] as const)
              .catch(() => null),
          ),
        );
        if (cancelled) return;
        const map: Record<string, LinkStats> = {};
        for (const r of results) if (r) map[r[0]] = r[1];
        setStats(map);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.detail : "Failed to load links";
        toast.error(msg);
        if (err instanceof ApiError && err.status === 401) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, token, router]);

  const handleDelete = useCallback(
    async (code: string) => {
      if (!token) return;
      if (!confirm(`Delete /${code}? This cannot be undone.`)) return;
      try {
        await api.deleteLink(code, token);
        setLinks((prev) => (prev ? prev.filter((l) => l.code !== code) : prev));
        toast.success("Link deleted");
      } catch (err) {
        const msg = err instanceof ApiError ? err.detail : "Delete failed";
        toast.error(msg);
      }
    },
    [token],
  );

  const filtered = useMemo(() => {
    if (!links) return [];
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.code.toLowerCase().includes(q) ||
        l.target_url.toLowerCase().includes(q) ||
        l.short_url.toLowerCase().includes(q),
    );
  }, [links, query]);

  const totals = useMemo(() => {
    if (!links) return { links: 0, clicks: 0, unique: 0 };
    const clicks = Object.values(stats).reduce((acc, s) => acc + s.total_clicks, 0);
    const unique = Object.values(stats).reduce((acc, s) => acc + s.unique_visitors, 0);
    return { links: links.length, clicks, unique };
  }, [links, stats]);

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(59,130,255,0.10), transparent 50%), radial-gradient(ellipse at bottom left, rgba(155,92,255,0.08), transparent 50%)",
        }}
      />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time view of your links and their clicks.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total links"
            value={totals.links}
            icon={<Link2 className="h-4 w-4" />}
            tone="blue"
          />
          <StatCard
            label="Total clicks"
            value={totals.clicks}
            icon={<MousePointerClick className="h-4 w-4" />}
            tone="purple"
          />
          <StatCard
            label="Unique visitors"
            value={totals.unique}
            icon={<Globe className="h-4 w-4" />}
            tone="cyan"
          />
        </div>

        {/* Links list — search + new-link sit alongside the heading */}
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Your links</h2>
            {links && (
              <span className="rounded-full border border-border/70 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 py-1.5 backdrop-blur sm:w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search links…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] px-4 py-2 text-sm font-medium text-white shadow-glow-sm transition-all hover:bg-[position:100%_50%] hover:shadow-glow"
            >
              <Plus className="h-4 w-4" />
              New link
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {loading || !links ? (
            [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState query={query} onCreate={() => setShowNew(true)} />
          ) : (
            filtered.map((link) => (
              <LinkRow
                key={link.code}
                link={link}
                stats={stats[link.code]}
                onDelete={() => handleDelete(link.code)}
              />
            ))
          )}
        </div>
      </main>

      {/* New link modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
            onClick={() => setShowNew(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-border/70 bg-card/80 p-6 backdrop-blur-2xl shadow-glow"
            >
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Sparkles className="h-4 w-4 text-primary" /> Create a new link
                </h3>
                <button
                  onClick={() => setShowNew(false)}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4">
                <ShortenForm />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "purple" | "cyan";
}) {
  const iconBg = {
    blue: "bg-[#3b82ff]/15 text-[#9bb8ff] ring-1 ring-[#3b82ff]/30",
    purple: "bg-[#9b5cff]/15 text-[#c4a5ff] ring-1 ring-[#9b5cff]/30",
    cyan: "bg-[#00e5ff]/15 text-[#7ee9ff] ring-1 ring-[#00e5ff]/30",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-3 font-mono text-3xl font-light tracking-tight">
        {value.toLocaleString()}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <TrendingUp className="h-3 w-3" /> last 30 days
      </div>
    </motion.div>
  );
}

function LinkRow({
  link,
  stats,
  onDelete,
}: {
  link: LinkOut;
  stats?: LinkStats;
  onDelete: () => void;
}) {
  const series = useMemo(() => {
    if (!stats) return [] as number[];
    const arr = stats.clicks_by_day ?? [];
    return arr.slice(-14).map(([, n]) => n);
  }, [stats]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl transition-shadow hover:shadow-glow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/links/${encodeURIComponent(link.code)}`}
              className="truncate font-mono text-sm font-semibold transition-colors group-hover:text-gradient"
            >
              {link.short_url}
            </Link>
            {link.has_password && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#9b5cff]/15 px-1.5 py-0.5 text-[10px] text-[#c4a5ff] ring-1 ring-[#9b5cff]/30">
                <Lock className="h-3 w-3" /> protected
              </span>
            )}
            {link.expires_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ff5cf0]/15 px-1.5 py-0.5 text-[10px] text-[#ffabf3] ring-1 ring-[#ff5cf0]/30">
                <Clock className="h-3 w-3" />
                {new Date(link.expires_at).toLocaleDateString()}
              </span>
            )}
            {!link.is_active && (
              <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-300 ring-1 ring-red-500/30">
                disabled
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">→ {link.target_url}</div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-base">{stats ? stats.total_clicks : "—"}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              clicks
            </div>
          </div>
          <div className="hidden text-muted-foreground sm:block">
            <Sparkline data={series} width={120} height={32} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CopyButton value={link.short_url} iconOnly />
          <Link
            href={`/links/${encodeURIComponent(link.code)}`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Stats"
          >
            <BarChart3 className="h-4 w-4" />
          </Link>
          <a
            href={link.short_url}
            target="_blank"
            rel="noreferrer"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Open"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={onDelete}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/50 text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-300"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="flex items-center gap-4">
        <div className="h-4 w-40 animate-pulse rounded bg-secondary/70" />
        <div className="h-3 flex-1 animate-pulse rounded bg-secondary/40" />
        <div className="h-8 w-24 animate-pulse rounded bg-secondary/40" />
      </div>
      <div
        aria-hidden
        className="absolute inset-y-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />
    </div>
  );
}

function EmptyState({ query, onCreate }: { query: string; onCreate: () => void }) {
  if (query) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-10 text-center text-sm text-muted-foreground">
        No links match <span className="font-mono">&ldquo;{query}&rdquo;</span>.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">Create your first link</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste a URL and we&rsquo;ll give you back a 6-character short code with built-in
        analytics, QR codes, expiry & password protection.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] px-4 py-2 text-sm font-medium text-white shadow-glow-sm transition-all hover:shadow-glow"
      >
        <Plus className="h-4 w-4" />
        New link
      </button>
    </div>
  );
}
