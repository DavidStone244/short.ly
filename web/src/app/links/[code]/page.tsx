"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Power,
  PowerOff,
  Lock,
  Clock,
  MousePointerClick,
  Globe,
  Activity,
  QrCode,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type LinkOut, type LinkStats } from "@/lib/api";
import { CopyButton } from "@/components/CopyButton";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface PageProps {
  params: { code: string };
}

export default function LinkDetailPage({ params }: PageProps) {
  const { code } = params;
  const { token, ready } = useAuth();
  const router = useRouter();
  const [link, setLink] = useState<LinkOut | null>(null);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [l, s] = await Promise.all([api.getLink(code, token), api.getStats(code, token)]);
        if (cancelled) return;
        setLink(l);
        setStats(s);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.detail : "Failed to load";
        toast.error(msg);
        if (err instanceof ApiError && err.status === 404) {
          router.replace("/dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, ready, token, router]);

  const handleDelete = async () => {
    if (!token) return;
    if (!confirm(`Delete /${code}? This cannot be undone.`)) return;
    try {
      await api.deleteLink(code, token);
      toast.success("Link deleted");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Delete failed";
      toast.error(msg);
    }
  };

  const handleToggleActive = async () => {
    if (!token || !link) return;
    try {
      const updated = await api.updateLink(code, { is_active: !link.is_active }, token);
      setLink(updated);
      toast.success(updated.is_active ? "Link enabled" : "Link disabled");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Update failed";
      toast.error(msg);
    }
  };

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

      <main className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>

          {loading || !link || !stats ? (
            <div className="mt-10 space-y-4">
              <div className="h-12 w-2/3 animate-pulse rounded-xl bg-secondary/40" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="h-28 animate-pulse rounded-2xl bg-secondary/40" />
                <div className="h-28 animate-pulse rounded-2xl bg-secondary/40" />
                <div className="h-28 animate-pulse rounded-2xl bg-secondary/40" />
              </div>
              <div className="h-72 animate-pulse rounded-2xl bg-secondary/40" />
            </div>
          ) : (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <h1 className="break-all font-mono text-2xl font-semibold tracking-tight text-gradient sm:text-3xl">
                    {link.short_url}
                  </h1>
                  <p className="mt-1 truncate text-sm text-muted-foreground">→ {link.target_url}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Chip>code: {link.code}</Chip>
                    {link.is_custom && <Chip tone="cyan">custom alias</Chip>}
                    {link.has_password && (
                      <Chip tone="purple">
                        <Lock className="h-3 w-3" /> protected
                      </Chip>
                    )}
                    {link.expires_at && (
                      <Chip tone="pink">
                        <Clock className="h-3 w-3" />
                        expires {new Date(link.expires_at).toLocaleString()}
                      </Chip>
                    )}
                    {!link.is_active && (
                      <Chip tone="red">disabled</Chip>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={link.short_url} />
                  <a
                    href={link.short_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 text-xs transition-all hover:border-primary/40 hover:shadow-glow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Visit
                  </a>
                  <button
                    onClick={handleToggleActive}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 text-xs transition-all hover:border-primary/40 hover:shadow-glow-sm"
                  >
                    {link.is_active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    {link.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs text-red-300 transition-all hover:border-red-500/60 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </motion.div>

              {/* Stat cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <BigStat
                  label="Total clicks"
                  value={stats.total_clicks.toLocaleString()}
                  icon={<MousePointerClick className="h-4 w-4" />}
                  tone="blue"
                  delay={0}
                />
                <BigStat
                  label="Unique visitors"
                  value={stats.unique_visitors.toLocaleString()}
                  icon={<Globe className="h-4 w-4" />}
                  tone="purple"
                  delay={0.05}
                />
                <BigStat
                  label="Last click"
                  value={stats.last_clicked_at ? timeAgo(stats.last_clicked_at) : "—"}
                  icon={<Activity className="h-4 w-4" />}
                  tone="cyan"
                  delay={0.1}
                />
              </div>

              {/* Chart + QR */}
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl lg:col-span-2"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-tight">Clicks (last 30 days)</h3>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      daily
                    </span>
                  </div>
                  <div className="h-64">
                    {stats.clicks_by_day.length === 0 ? (
                      <EmptyChart message="No clicks yet — share your link!" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={stats.clicks_by_day.map(([day, count]) => ({ day: day.slice(5), count }))}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6ea8ff" stopOpacity={0.55} />
                              <stop offset="100%" stopColor="#6ea8ff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0" stopColor="#3b82ff" />
                              <stop offset="0.5" stopColor="#9b5cff" />
                              <stop offset="1" stopColor="#00e5ff" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="day" fontSize={11} stroke="rgba(255,255,255,0.4)" />
                          <YAxis fontSize={11} allowDecimals={false} stroke="rgba(255,255,255,0.4)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15,15,28,0.9)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 12,
                              fontSize: 12,
                              backdropFilter: "blur(12px)",
                              color: "#f5f7ff",
                            }}
                            labelStyle={{ color: "#f5f7ff", fontWeight: 600 }}
                            itemStyle={{ color: "#dbe4ff" }}
                            cursor={{ stroke: "rgba(110,168,255,0.5)", strokeWidth: 1 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="url(#strokeGrad)"
                            strokeWidth={2.5}
                            fill="url(#clickGrad)"
                            isAnimationActive
                            animationDuration={900}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="group rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                      <QrCode className="h-3.5 w-3.5" /> QR code
                    </h3>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative rounded-xl bg-white p-3 transition-all duration-300 group-hover:shadow-glow">
                      <Image
                        src={api.qrUrl(code)}
                        alt={`QR code for ${link.short_url}`}
                        width={180}
                        height={180}
                        unoptimized
                        className="rounded"
                      />
                    </div>
                    <a
                      href={api.qrUrl(code)}
                      download={`shortly-${code}.png`}
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card/40 px-3 text-xs transition-all hover:border-primary/40 hover:shadow-glow-sm"
                    >
                      Download PNG
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Browsers / OS */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <BarCard
                  title="Top browsers"
                  data={stats.top_browsers.filter(([k]) => k).map(([k, v]) => ({ name: k ?? "?", value: v }))}
                />
                <BarCard
                  title="Top operating systems"
                  data={stats.top_os.filter(([k]) => k).map(([k, v]) => ({ name: k ?? "?", value: v }))}
                />
              </div>
            </>
          )}
      </main>
    </div>
  );
}

function timeAgo(iso: string): string {
  // The backend always sends UTC. If the string lacks a timezone marker
  // (legacy data from naive SQLite columns), append 'Z' so the browser
  // doesn't reinterpret it as local time.
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(iso);
  const normalized = hasTz ? iso : iso + "Z";
  const now = Date.now();
  const t = new Date(normalized).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Math.max(0, (now - t) / 1000);
  if (diff < 30) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(normalized).toLocaleDateString();
}

function Chip({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "purple" | "cyan" | "pink" | "red";
}) {
  const map = {
    blue: "bg-secondary/60 text-foreground/80 ring-1 ring-border",
    purple: "bg-[#9b5cff]/15 text-[#c4a5ff] ring-1 ring-[#9b5cff]/30",
    cyan: "bg-[#00e5ff]/15 text-[#7ee9ff] ring-1 ring-[#00e5ff]/30",
    pink: "bg-[#ff5cf0]/15 text-[#ffabf3] ring-1 ring-[#ff5cf0]/30",
    red: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

function BigStat({
  label,
  value,
  icon,
  tone,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "blue" | "purple" | "cyan";
  delay: number;
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
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-3 font-mono text-3xl font-light tracking-tight">{value}</div>
    </motion.div>
  );
}

function BarCard({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  const colors = ["#6ea8ff", "#b88aff", "#57e0ff", "#ff8ce0", "#9b5cff"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl"
    >
      <h3 className="mb-4 text-sm font-semibold tracking-tight">{title}</h3>
      <div className="h-56">
        {data.length === 0 ? (
          <EmptyChart message="No data yet" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" fontSize={11} stroke="rgba(255,255,255,0.4)" />
              <YAxis fontSize={11} allowDecimals={false} stroke="rgba(255,255,255,0.4)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,15,28,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#f5f7ff",
                }}
                labelStyle={{ color: "#f5f7ff", fontWeight: 600 }}
                itemStyle={{ color: "#dbe4ff" }}
                cursor={{ fill: "rgba(110,168,255,0.08)" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
