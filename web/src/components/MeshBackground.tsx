"use client";

import { motion } from "framer-motion";

/** Animated multi-color mesh gradient blob layer for hero / auth backgrounds. */
export function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-[-20%] h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(closest-side, #3b82ff, transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.6, 0.4, 0.6] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute right-[-10%] top-1/3 h-[560px] w-[560px] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(closest-side, #9b5cff, transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute left-1/3 bottom-[-25%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(closest-side, #00e5ff, transparent)" }}
      />
    </div>
  );
}
