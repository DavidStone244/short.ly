"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export function CopyButton({ value, label = "Copy", className, iconOnly }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Failed to copy");
        }
      }}
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 text-xs transition-all",
        "hover:border-primary/40 hover:bg-card/70 hover:shadow-glow-sm",
        copied && "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
        className,
      )}
      aria-label={copied ? "Copied" : label}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Check className="h-3.5 w-3.5" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Copy className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
      {!iconOnly && <span className="hidden sm:inline">{copied ? "Copied" : label}</span>}
    </button>
  );
}
