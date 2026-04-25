"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2, Power, PowerOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type LinkOut, type LinkStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
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

  if (loading || !link || !stats) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const dailyData = stats.clicks_by_day.map(([day, count]) => ({ day: day.slice(5), count }));
  const browserData = stats.top_browsers.filter(([k]) => k).map(([k, v]) => ({ name: k ?? "unknown", value: v }));
  const osData = stats.top_os.filter(([k]) => k).map(([k, v]) => ({ name: k ?? "unknown", value: v }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-mono truncate">{link.short_url}</h1>
          <p className="text-sm text-muted-foreground truncate">→ {link.target_url}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="rounded-full bg-secondary px-2 py-1">code: {link.code}</span>
            {link.is_custom && <span className="rounded-full bg-secondary px-2 py-1">custom</span>}
            {link.has_password && <span className="rounded-full bg-secondary px-2 py-1">password protected</span>}
            {link.expires_at && (
              <span className="rounded-full bg-secondary px-2 py-1">
                expires {new Date(link.expires_at).toLocaleString()}
              </span>
            )}
            {!link.is_active && <span className="rounded-full bg-red-500/20 text-red-500 px-2 py-1">disabled</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={link.short_url} />
          <Button asChild size="sm" variant="outline">
            <a href={link.short_url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Visit
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={handleToggleActive}>
            {link.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            {link.is_active ? "Disable" : "Enable"}
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total clicks" value={stats.total_clicks} />
        <StatCard label="Unique visitors" value={stats.unique_visitors} />
        <StatCard
          label="Last clicked"
          value={stats.last_clicked_at ? new Date(stats.last_clicked_at).toLocaleString() : "—"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Clicks (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {dailyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No clicks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">QR code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Image
              src={api.qrUrl(code)}
              alt={`QR code for ${link.short_url}`}
              width={180}
              height={180}
              unoptimized
              className="rounded-md border"
            />
            <Button asChild size="sm" variant="outline">
              <a href={api.qrUrl(code)} download={`shortly-${code}.png`}>
                Download PNG
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ChartCard title="Top browsers" data={browserData} />
        <ChartCard title="Top operating systems" data={osData} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
