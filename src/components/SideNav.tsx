"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LANG_LABELS, t, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

const LANGS: Lang[] = ["zh", "en", "ja", "ko"];

const ITEMS = [
  { href: "/", icon: "🏠", labelKey: "navHome" as const },
  { href: "/plan", icon: "🛣️", labelKey: "navPlan" as const },
  { href: "/itinerary", icon: "📋", labelKey: "navItinerary" as const },
];

export function SideNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useLang();

  return (
    <>
      {/* Slim rail (always visible on lg+, mobile uses overlay) */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-slate-950/90 backdrop-blur-xl border-r border-white/5 transition-all duration-200 ${
          open ? "w-64" : "w-14"
        } flex flex-col`}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-14 flex items-center justify-center hover:bg-white/5 transition border-b border-white/5"
          aria-label="Toggle navigation"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>

        <div className="flex h-12 items-center justify-center border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 text-base font-black text-slate-950 shadow shadow-sky-500/30">
              北
            </span>
            {open && (
              <span className="text-sm font-bold tracking-tight">
                {t("brand", lang)}
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 py-3 space-y-1 px-2">
          {ITEMS.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/40"
                    : "text-slate-300 hover:bg-white/5"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="text-lg shrink-0">{it.icon}</span>
                {open && (
                  <span className="text-sm font-medium">
                    {t(it.labelKey, lang)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/5">
          {open ? (
            <div className="flex gap-1 rounded-lg bg-slate-800/60 p-1 ring-1 ring-slate-700">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                    lang === l
                      ? "bg-sky-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`w-8 h-7 rounded text-[11px] font-medium transition ${
                    lang === l
                      ? "bg-sky-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop when expanded on small screens */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}
    </>
  );
}
