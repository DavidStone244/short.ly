"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ExternalLink, BarChart3, Lock, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type LinkOut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { ShortenForm } from "@/components/ShortenForm";
import { toast } from "sonner";

export default function DashboardPage() {
  const { token, ready } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<LinkOut[] | null>(null);
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
        const list = await api.listLinks(token);
        if (!cancelled) setLinks(list);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.detail : "Failed to load links";
        toast.error(msg);
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, token, router]);

  const handleDelete = async (code: string) => {
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
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Your links</h1>
        <p className="text-sm text-muted-foreground">Create and manage short links from one place.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Create a new link</CardTitle>
        </CardHeader>
        <CardContent>
          <ShortenForm />
        </CardContent>
      </Card>

      {loading || !links ? (
        <div className="text-center py-10 text-muted-foreground text-sm">Loading...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No links yet. Create one above to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.code}>
              <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/links/${encodeURIComponent(link.code)}`} className="font-mono font-semibold hover:underline truncate">
                      {link.short_url}
                    </Link>
                    {link.has_password && (
                      <span title="Password protected">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    )}
                    {link.expires_at && (
                      <span title={`Expires ${new Date(link.expires_at).toLocaleString()}`}>
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    )}
                    {!link.is_active && <span className="text-xs text-red-500">disabled</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">→ {link.target_url}</div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={link.short_url} />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/links/${encodeURIComponent(link.code)}`}>
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Stats</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={link.short_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(link.code)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
