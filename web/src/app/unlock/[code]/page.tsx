"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Lock, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { MeshBackground } from "@/components/MeshBackground";
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { Logo } from "@/components/Logo";

interface PageProps {
  params: { code: string };
}

export default function UnlockPage({ params }: PageProps) {
  const { code } = params;
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const { target_url } = await api.unlock(code, password);
      window.location.href = target_url;
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Failed to unlock";
      toast.error(msg);
      setError(true);
      setSubmitting(false);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
      <CursorSpotlight color="rgba(255, 92, 240, 0.15)" />

      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="border-gradient relative w-full overflow-hidden rounded-3xl bg-card/70 p-8 backdrop-blur-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <div className="flex justify-center">
            <Link href="/" className="inline-flex">
              <Logo withWordmark={false} size={32} href="" />
            </Link>
          </div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
            className="relative mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-brand-gradient shadow-glow"
          >
            <motion.div
              aria-hidden
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 30px 6px rgba(155,92,255,0.45)",
              }}
            />
            <Lock className="relative h-7 w-7 text-white" />
          </motion.div>

          <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
            Password required
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            The link <span className="font-mono text-foreground">/{code}</span> is protected.
            Enter the password to continue.
          </p>

          <motion.form
            onSubmit={handleSubmit}
            animate={error ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:200%_200%] text-sm font-medium text-white shadow-glow-sm transition-all hover:bg-[position:100%_50%] hover:shadow-glow disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {submitting ? "Unlocking" : "Unlock & continue"}
            </motion.button>
          </motion.form>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            Argon2-hashed. We never see your password.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
