"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Lock, Calendar, Sparkles, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Animated input bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-brand-gradient bg-[length:300%_300%] opacity-70 blur-[2px] animate-gradient-shift"
          />
          <div className="relative flex items-center gap-2 rounded-2xl border border-border/70 bg-card/80 p-1.5 backdrop-blur-xl">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/40">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="url"
              required
              placeholder="https://your-very-long-url.example.com/path"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] px-5 text-sm font-medium text-white shadow-glow-sm transition-all hover:bg-[position:100%_50%] hover:shadow-glow disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              )}
              <span>{submitting ? "Shortening" : "Shorten"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setAdvanced((v) => !v)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {advanced ? "Hide" : "Show"} advanced options
          </button>
          {!token && (
            <span className="text-xs text-muted-foreground">
              <a className="underline-offset-2 hover:underline" href="/login">
                Sign in
              </a>{" "}
              to track clicks & manage links
            </span>
          )}
        </div>

        <AnimatePresence initial={false}>
          {advanced && (
            <motion.div
              key="adv"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/40 p-5 backdrop-blur sm:grid-cols-3">
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
                  <p className="text-xs text-muted-foreground">Auto-expiry (optional)</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.code}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="border-gradient relative overflow-hidden rounded-2xl bg-card/70 p-5 backdrop-blur-xl"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your short link</div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-lg font-semibold text-gradient">
                {result.short_url}
              </code>
              <CopyButton value={result.short_url} />
            </div>
            <div className="mt-2 truncate text-xs text-muted-foreground">
              → {result.target_url}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Chip label={`code: ${result.code}`} />
              {result.is_custom && <Chip label="custom alias" tone="cyan" />}
              {result.has_password && <Chip label="password protected" tone="purple" />}
              {result.expires_at && (
                <Chip
                  label={`expires ${new Date(result.expires_at).toLocaleString()}`}
                  tone="pink"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "purple" | "cyan" | "pink";
}) {
  const map = {
    blue: "bg-[#3b82ff]/15 text-[#9bb8ff] ring-1 ring-[#3b82ff]/30",
    purple: "bg-[#9b5cff]/15 text-[#c4a5ff] ring-1 ring-[#9b5cff]/30",
    cyan: "bg-[#00e5ff]/15 text-[#7ee9ff] ring-1 ring-[#00e5ff]/30",
    pink: "bg-[#ff5cf0]/15 text-[#ffabf3] ring-1 ring-[#ff5cf0]/30",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${map[tone]}`}>
      {label}
    </span>
  );
}
