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
  size = 28,
}: LogoProps) {
  const inner = (
    <span className={cn("flex items-center gap-2.5 group/logo", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="drop-shadow-[0_0_14px_rgba(110,168,255,0.4)] transition-transform group-hover/logo:rotate-[8deg]"
      >
        <defs>
          <linearGradient id="lyGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3b82ff" />
            <stop offset="0.55" stopColor="#9b5cff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
        {/* Outer rounded square */}
        <rect x="1" y="1" width="30" height="30" rx="9" stroke="url(#lyGrad)" strokeWidth="1.5" />
        {/* Stylized S as two interlocking link arcs */}
        <path
          d="M21 11.5a4.5 4.5 0 0 0-4.5-4.5h-3a4.5 4.5 0 0 0 0 9h3"
          stroke="url(#lyGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M11 20.5a4.5 4.5 0 0 0 4.5 4.5h3a4.5 4.5 0 0 0 0-9h-3"
          stroke="url(#lyGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Dot emphasis */}
        <circle cx="25" cy="25" r="2.2" fill="url(#lyGrad)" />
      </svg>
      {withWordmark && (
        <span className="font-semibold tracking-tight text-lg leading-none">
          short<span className="text-gradient">.</span>ly
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
