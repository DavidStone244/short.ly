"use client";

import { useEffect, useState } from "react";

interface Line {
  prefix: string;
  highlight: string;
  suffix: string;
}

interface TypewriterHeadlineProps {
  lines: Line[];
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Pause after the last character before completing. */
  endPause?: number;
}

/**
 * Renders a multi-line headline that appears to be typed character-by-character
 * with a blinking caret at the cursor. Once typing is complete, the caret keeps
 * blinking at the end of the last line.
 */
export function TypewriterHeadline({
  lines,
  className = "",
  speed = 55,
  endPause = 200,
}: TypewriterHeadlineProps) {
  // Pre-compute total character count + a per-character map so we can render
  // the correct prefix/highlight/suffix segments at every step.
  const segments = lines.flatMap((l, lineIdx) => [
    { lineIdx, kind: "prefix" as const, text: l.prefix },
    { lineIdx, kind: "highlight" as const, text: l.highlight },
    { lineIdx, kind: "suffix" as const, text: l.suffix },
  ]);
  const total = segments.reduce((acc, s) => acc + s.text.length, 0);

  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (count >= total) {
      const t = setTimeout(() => setDone(true), endPause);
      return () => clearTimeout(t);
    }
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, total, speed, endPause]);

  // Walk segments, slicing each one against the running counter.
  const rendered: { lineIdx: number; nodes: React.ReactNode[] }[] = lines.map(
    (_, i) => ({ lineIdx: i, nodes: [] }),
  );

  let remaining = count;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (remaining <= 0) break;
    const take = Math.min(remaining, seg.text.length);
    const slice = seg.text.slice(0, take);
    if (slice.length === 0) continue;
    if (seg.kind === "highlight") {
      rendered[seg.lineIdx].nodes.push(
        <span key={`h-${i}`} className="text-gradient neon-text">
          {slice}
        </span>,
      );
    } else {
      rendered[seg.lineIdx].nodes.push(<span key={`t-${i}`}>{slice}</span>);
    }
    remaining -= take;
  }

  // The caret follows the last *visible* line (i.e. whichever line still has
  // characters being typed, or the last line when finished).
  let activeLineIdx = lines.length - 1;
  let cumulative = 0;
  for (let i = 0; i < lines.length; i++) {
    cumulative += lines[i].prefix.length + lines[i].highlight.length + lines[i].suffix.length;
    if (count < cumulative) {
      activeLineIdx = i;
      break;
    }
  }

  return (
    <h1 className={className} aria-label={lines.map((l) => l.prefix + l.highlight + l.suffix).join(" ")}>
      {rendered.map(({ lineIdx, nodes }) => (
        <span key={lineIdx} className="block">
          {nodes}
          {lineIdx === activeLineIdx && (
            <span
              aria-hidden
              className={`ml-1 inline-block w-[3px] translate-y-[0.08em] self-center bg-foreground/90 align-middle ${
                done ? "animate-caret-blink h-[0.85em]" : "h-[0.85em]"
              }`}
              style={{ verticalAlign: "-0.05em" }}
            />
          )}
        </span>
      ))}
    </h1>
  );
}
