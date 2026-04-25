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
import { AuthShell, SocialButtons, Divider } from "@/components/AuthShell";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
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
      <SocialButtons />
      <Divider>or sign up with email</Divider>
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
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Strength meter */}
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-colors ${
                  i < strength.score
                    ? strength.score <= 1
                      ? "bg-red-500/70"
                      : strength.score === 2
                      ? "bg-amber-400/80"
                      : strength.score === 3
                      ? "bg-emerald-400/80"
                      : "bg-emerald-400"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{strength.label}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] text-sm font-medium text-white shadow-glow-sm transition-all hover:bg-[position:100%_50%] hover:shadow-glow disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Creating account" : "Create account"}
        </motion.button>
      </form>
    </AuthShell>
  );
}

function passwordStrength(p: string): { score: number; label: string } {
  if (!p) return { score: 0, label: "Use 8+ characters with a mix of letters and numbers." };
  let score = 0;
  if (p.length >= 8) score += 1;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  return { score, label: labels[score] };
}
