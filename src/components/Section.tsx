"use client";

import type React from "react";

export function Section({
  id,
  title,
  accent,
  badge,
  openSet,
  onToggle,
  children,
}: {
  id: string;
  title: React.ReactNode;
  accent: string;
  badge?: React.ReactNode;
  openSet: Set<string>;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const open = openSet.has(id);
  return (
    <div className={`rounded-xl ring-1 ${accent}`}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex justify-between items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition rounded-xl"
      >
        <div className="text-sm font-semibold flex-1">{title}</div>
        <div className="flex items-center gap-3 shrink-0">
          {badge}
          <span
            className={`text-slate-400 text-xs transition-transform inline-block ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▼
          </span>
        </div>
      </button>
      {open && <div className="px-4 pb-4 section-content">{children}</div>}
    </div>
  );
}
