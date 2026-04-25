"use client";

import { useId } from "react";

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "url(#sparkGrad)",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  if (data.length === 0) {
    return (
      <svg width={width} height={height} aria-hidden>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 3" />
      </svg>
    );
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={`sparkGrad-${id}`} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6ea8ff" />
          <stop offset="0.55" stopColor="#b88aff" />
          <stop offset="1" stopColor="#57e0ff" />
        </linearGradient>
        <linearGradient id={`sparkArea-${id}`} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6ea8ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#6ea8ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkArea-${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color === "url(#sparkGrad)" ? `url(#sparkGrad-${id})` : color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
