"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Lock, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { api, ApiError, type LinkOut } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function ShortenForm() {
  const { token } = useAuth();
  const [targetUrl, setTargetUrl] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LinkOut | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      toast.error("Please enter a URL to shorten");
      return;
    }
    setSubmitting(true);
    try {
      const link = await api.createLink(
        {
          target_url: targetUrl.trim(),
          custom_alias: customAlias.trim() || undefined,
          password: password.trim() || undefined,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
        token,
      );
      setResult(link);
      setTargetUrl("");
      setCustomAlias("");
      setPassword("");
      setExpiresAt("");
      toast.success("Short link created");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Failed to create link";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="url"
            placeholder="https://your-very-long-url.example.com/path?with=params"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="h-12 text-base"
            required
          />
          <Button type="submit" size="lg" disabled={submitting} className="h-12 px-6">
            {submitting ? "Shortening..." : "Shorten"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            onClick={() => setAdvanced((v) => !v)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {advanced ? "Hide" : "Show"} advanced options
          </button>
          {!token && (
            <span className="text-muted-foreground text-xs">
              Tip: <a className="underline" href="/login">log in</a> to manage and track your links
            </span>
          )}
        </div>

        {advanced && (
          <Card>
            <CardContent className="pt-6 grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="alias">Custom alias</Label>
                <Input
                  id="alias"
                  placeholder="my-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">e.g. short.ly/my-link</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Password
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="optional"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Visitors must enter it</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expires" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Expires at
                </Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Optional auto-expiry</p>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {result && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="text-xs text-muted-foreground">Your short link</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-base font-mono font-semibold break-all">{result.short_url}</code>
              <CopyButton value={result.short_url} />
            </div>
            <div className="text-xs text-muted-foreground">
              redirects to <span className="font-mono">{result.target_url}</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-secondary px-2 py-1">code: {result.code}</span>
              {result.is_custom && <span className="rounded-full bg-secondary px-2 py-1">custom alias</span>}
              {result.has_password && <span className="rounded-full bg-secondary px-2 py-1">password protected</span>}
              {result.expires_at && (
                <span className="rounded-full bg-secondary px-2 py-1">expires {new Date(result.expires_at).toLocaleString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
