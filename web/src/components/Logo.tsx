import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  withWordmark?: boolean;
  size?: number;
}

export function Logo({
  className,
  href = "/",
  withWordmark = true,
  size = 30,
}: LogoProps) {
  // Two interlocking chain-link arcs forming an "S" shape with a glowing
  // cyan dot at the meeting point — recreated from the brand reference.
  const inner = (
    <span className={cn("flex items-center gap-2.5 group/logo", className)}>
      <svg
        width={size}
        height={(size * 5) / 4}
        viewBox="0 0 40 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="drop-shadow-[0_0_14px_rgba(110,168,255,0.45)] transition-transform group-hover/logo:rotate-[6deg]"
      >
        <defs>
          <linearGradient id="ly-link-grad" x1="4" y1="2" x2="36" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3b82ff" />
            <stop offset="0.55" stopColor="#7a4cff" />
            <stop offset="1" stopColor="#9b5cff" />
          </linearGradient>
          <radialGradient id="ly-dot-grad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#d6fbff" />
            <stop offset="0.45" stopColor="#5cf2ff" />
            <stop offset="1" stopColor="#00d4ff" />
          </radialGradient>
          <filter id="ly-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top chain link — open oval that wraps from middle-right up and around to lower-middle */}
        <path
          d="M 22 26 C 8 26 6 8 18 5 C 32 2 38 14 32 21 C 28 25 24 26 22 26 Z"
          stroke="url(#ly-link-grad)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Bottom chain link — mirrored oval, completing the S */}
        <path
          d="M 18 24 C 32 24 34 42 22 45 C 8 48 2 36 8 29 C 12 25 16 24 18 24 Z"
          stroke="url(#ly-link-grad)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Glowing cyan dot at the meeting point */}
        <circle cx="20" cy="25" r="3.4" fill="url(#ly-dot-grad)" filter="url(#ly-dot-glow)" />
      </svg>

      {withWordmark && (
        <span className="font-semibold tracking-tight text-lg leading-none">
          short<span className="text-[#00d4ff] drop-shadow-[0_0_8px_rgba(0,212,255,0.65)]">.</span>ly
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
