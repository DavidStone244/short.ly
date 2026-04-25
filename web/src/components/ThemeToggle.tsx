"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : "dark";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-9 w-9 rounded-full border border-border bg-card/60 backdrop-blur transition-all hover:shadow-glow-sm hover:border-primary/40"
    >
      <motion.span
        key={String(isDark)}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute inset-0 grid place-items-center"
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-foreground/80" />
        ) : (
          <Sun className="h-4 w-4 text-foreground/80" />
        )}
      </motion.span>
    </button>
  );
}
