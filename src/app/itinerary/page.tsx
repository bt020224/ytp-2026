"use client";

import { useMemo, useState } from "react";
import {
  TAIPEI_ATTRACTIONS,
  attractionCategory,
  attractionName,
  kkdayTicketUrl,
  type Attraction,
} from "@/lib/attractions";
import { haversineKm } from "@/lib/transport";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import {
  ApiKeyMissingCard,
  isApiKeyMissingError,
} from "@/components/ApiKeyMissingCard";
import { AttractionImage } from "@/components/AttractionImage";

type Stop = { attractionId: string; reasoning?: string };

const THEMES = ["food", "family", "culture", "hidden", "shopping", "perf"] as const;
type Theme = (typeof THEMES)[number];

const THEME_LABEL_KEY: Record<Theme, "themeFood" | "themeFamily" | "themeCulture" | "themeHidden" | "themeShopping" | "themePerf"> = {
  food: "themeFood",
  family: "themeFamily",
  culture: "themeCulture",
  hidden: "themeHidden",
  shopping: "themeShopping",
  perf: "themePerf",
};

const THEME_ICON: Record<Theme, string> = {
  food: "🍜",
  family: "👨‍👩‍👧",
  culture: "🎨",
  hidden: "⛰️",
  shopping: "🛍️",
  perf: "🎭",
};

export default function ItineraryPage() {
  const [lang] = useLang();
  const [theme, setTheme] = useState<Theme>("culture");
  const [numStops, setNumStops] = useState(4);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddPicker, setShowAddPicker] = useState(false);

  const stopsResolved = useMemo(
    () =>
      stops
        .map((s) => {
          const a = TAIPEI_ATTRACTIONS.find((x) => x.id === s.attractionId);
          return a ? { ...s, attraction: a } : null;
        })
        .filter((x): x is Stop & { attraction: Attraction } => x !== null),
    [stops]
  );

  const totalTickets = stopsResolved.reduce(
    (acc, s) => acc + s.attraction.ticket,
    0
  );

  const totalDistanceKm = useMemo(() => {
    let total = 0;
    for (let i = 1; i < stopsResolved.length; i++) {
      total += haversineKm(stopsResolved[i - 1].attraction, stopsResolved[i].attraction);
    }
    return total;
  }, [stopsResolved]);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          numStops,
          excludeIds: [],
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      setStops(data.itinerary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const removeStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStop = (from: number, to: number) => {
    if (to < 0 || to >= stops.length) return;
    setStops((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const addStop = (id: string) => {
    setStops((prev) => [...prev, { attractionId: id }]);
    setShowAddPicker(false);
  };

  const inItinerary = new Set(stops.map((s) => s.attractionId));

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            📋 {t("itineraryTitle", lang)}
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">
            {t("itinerarySubtitle", lang)}
          </p>
        </div>

        {/* Generator panel */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-900/40 to-slate-900/80 ring-1 ring-violet-700/30 p-5 mb-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t("themeLabel", lang)}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className={`rounded-md px-2 py-2 text-xs font-medium ring-1 transition ${
                      theme === th
                        ? "bg-violet-600 ring-violet-400 text-white"
                        : "bg-slate-800/60 ring-slate-700 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {THEME_ICON[th]} {t(THEME_LABEL_KEY[th], lang)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t("stopsCount", lang)}
              </label>
              <select
                value={numStops}
                onChange={(e) => setNumStops(parseInt(e.target.value))}
                className="rounded bg-slate-800 px-3 py-2 text-sm ring-1 ring-slate-700 focus:ring-violet-500 outline-none"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generate}
                disabled={loading}
                className="w-full md:w-auto rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 px-5 py-2.5 text-sm font-semibold text-white transition shadow shadow-violet-500/30"
              >
                {loading ? `⏳ ${t("itineraryGenerating", lang)}` : `✨ ${t("generateItinerary", lang)}`}
              </button>
            </div>
          </div>
          {error &&
            (isApiKeyMissingError(error) ? (
              <ApiKeyMissingCard lang={lang} />
            ) : (
              <p className="mt-3 text-xs text-rose-400">{error}</p>
            ))}
        </div>

        {/* Itinerary list */}
        {stopsResolved.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 ring-1 ring-slate-800 p-8 text-center text-slate-400 text-sm">
            {t("emptyItinerary", lang)}
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="rounded-xl bg-slate-900/70 ring-1 ring-slate-800 p-4 mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-slate-400">{t("totalStops", lang)}: </span>
                <span className="font-semibold">{stopsResolved.length}</span>
              </div>
              <div>
                <span className="text-slate-400">{t("distance", lang)}: </span>
                <span className="font-semibold">
                  {totalDistanceKm.toFixed(2)} {t("km", lang)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">{t("totalTickets", lang)}: </span>
                <span
                  className={`font-semibold ${
                    totalTickets === 0 ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {totalTickets === 0 ? t("free", lang) : `NT$ ${totalTickets}`}
                </span>
              </div>
            </div>

            {/* Stop cards */}
            <ol className="space-y-3">
              {stopsResolved.map((s, i) => (
                <li
                  key={`${s.attractionId}-${i}`}
                  className="rounded-xl bg-slate-900/70 ring-1 ring-slate-800 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 sm:shrink-0 relative">
                      <AttractionImage
                        attraction={s.attraction}
                        lang={lang}
                        className="h-32 sm:h-full w-full"
                        rounded=""
                      />
                      <div className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-500/40 ring-2 ring-slate-900">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-semibold text-slate-100">
                            {attractionName(s.attraction, lang)}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {attractionCategory(s.attraction, lang)} ·{" "}
                            {s.attraction.ticket === 0
                              ? t("free", lang)
                              : `NT$${s.attraction.ticket}`}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveStop(i, i - 1)}
                            disabled={i === 0}
                            className="rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-2 py-1 text-xs"
                            title={t("moveUp", lang)}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveStop(i, i + 1)}
                            disabled={i === stopsResolved.length - 1}
                            className="rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 px-2 py-1 text-xs"
                            title={t("moveDown", lang)}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeStop(i)}
                            className="rounded bg-rose-900/60 hover:bg-rose-800 px-2 py-1 text-xs text-rose-200"
                            title={t("removeStop", lang)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {s.reasoning && (
                        <div className="mt-3 rounded-md bg-violet-500/10 ring-1 ring-violet-500/30 p-2 text-xs text-violet-100">
                          <span className="font-semibold text-violet-300">
                            ✨ {t("aiReasoning", lang)}:{" "}
                          </span>
                          {s.reasoning}
                        </div>
                      )}
                      {s.attraction.ticket > 0 && (
                        <a
                          href={kkdayTicketUrl(s.attraction, lang)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-amber-300 hover:text-amber-200 underline underline-offset-2"
                        >
                          🎟️ {t("buyTicket", lang)} ↗
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Add stop button + picker */}
        <div className="mt-4">
          {!showAddPicker ? (
            <button
              onClick={() => setShowAddPicker(true)}
              className="w-full rounded-lg bg-slate-800/60 hover:bg-slate-700 ring-1 ring-slate-700 hover:ring-slate-600 px-4 py-3 text-sm font-medium transition"
            >
              {t("addStop", lang)}
            </button>
          ) : (
            <div className="rounded-xl bg-slate-900/80 ring-1 ring-slate-700 p-4">
              <div className="grid gap-2 md:grid-cols-2">
                {TAIPEI_ATTRACTIONS.filter(
                  (a) => !inItinerary.has(a.id)
                ).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => addStop(a.id)}
                    className="flex items-center justify-between gap-2 rounded-md bg-slate-800/60 hover:bg-slate-700 ring-1 ring-slate-700 px-3 py-2 text-left text-sm transition"
                  >
                    <span className="truncate">
                      {attractionName(a, lang)}
                      <span className="text-xs text-slate-400 ml-1">
                        · {attractionCategory(a, lang)}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        a.ticket === 0 ? "text-emerald-300" : "text-amber-300"
                      }`}
                    >
                      {a.ticket === 0 ? t("free", lang) : `NT$${a.ticket}`}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddPicker(false)}
                className="mt-3 text-xs text-slate-400 hover:text-slate-200"
              >
                ← {t("removeStop", lang)}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
