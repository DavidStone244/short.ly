"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock as LockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";

type StrengthTier = "poor" | "good" | "excellent";

interface StrengthInfo {
  tier: StrengthTier;
  label: string;
  hint: string;
  /** 0..3 — number of bars to fill */
  fill: number;
}

function passwordStrength(p: string): StrengthInfo {
  const long = p.length >= 16;
  const medium = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasNumber = /\d/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);
  const charBucketsOk = hasUpper && hasNumber && hasSpecial;

  if (long && charBucketsOk) {
    return { tier: "excellent", label: "Excellent", hint: "", fill: 3 };
  }
  if (medium && charBucketsOk) {
    return { tier: "good", label: "Good", hint: "", fill: 2 };
  }

  // Priority order: special, uppercase, number — show those *first*. Only
  // once all three character-class buckets are satisfied does the 8+ chars
  // requirement surface (since otherwise it dominates while the rest are
  // also missing).
  const missing: string[] = [];
  if (!hasSpecial) missing.push("a special character");
  if (!hasUpper) missing.push("an uppercase letter");
  if (!hasNumber) missing.push("a number");
  if (charBucketsOk && !medium) missing.push("8+ characters");

  return {
    tier: "poor",
    label: "Poor",
    hint: missing.length > 0 ? `Add ${missing.join(", ")}.` : "",
    fill: p.length === 0 ? 0 : 1,
  };
}

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);
  const acceptable = strength.tier !== "poor";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!acceptable) {
      toast.error("Password isn't strong enough yet — " + strength.hint);
      return;
    }
    setSubmitting(true);
    try {
      await api.register(email, password);
      const tok = await api.login(email, password);
      login(tok.access_token, email);
      toast.success("Account created");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Sign up failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const tierColor: Record<StrengthTier, string> = {
    poor: "bg-red-500",
    good: "bg-amber-400",
    excellent: "bg-emerald-400",
  };
  const tierLabelColor: Record<StrengthTier, string> = {
    poor: "text-red-300",
    good: "text-amber-300",
    excellent: "text-emerald-300",
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* 3-tier strength meter: Poor / Good / Excellent */}
          <div className="mt-2 grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-colors ${
                  i < strength.fill ? tierColor[strength.tier] : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={`font-medium ${tierLabelColor[strength.tier]}`}>
              {password ? strength.label : "Password strength"}
            </span>
            <span className="text-muted-foreground">{strength.hint}</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting || !acceptable}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] text-sm font-medium text-white shadow-glow-sm transition-all hover:bg-[position:100%_50%] hover:shadow-glow disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Creating account" : "Create account"}
        </motion.button>
      </form>
    </AuthShell>
  );
}
