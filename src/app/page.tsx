"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FEATURED_ATTRACTIONS,
  TAIPEI_ATTRACTIONS,
  TAIPEI_CENTER,
  attractionCategory,
  attractionName,
  isWithinTaipei,
  kkdayTicketUrl,
  type Attraction,
} from "@/lib/attractions";
import { nearbyAttractions } from "@/lib/transport";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import { AttractionImage } from "@/components/AttractionImage";

type WithDistance = Attraction & { distanceKm?: number };

export default function HomePage() {
  const [lang] = useLang();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);

  const list: WithDistance[] = useMemo(() => {
    if (origin) {
      return nearbyAttractions(origin, TAIPEI_ATTRACTIONS, 9);
    }
    return FEATURED_ATTRACTIONS;
  }, [origin]);

  const exploreNearby = () => {
    setWarning("");
    if (!navigator.geolocation) {
      setWarning(t("gpsUnsupported", lang));
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        let { latitude: lat, longitude: lng } = pos.coords;
        if (!isWithinTaipei(lat, lng)) {
          setWarning(t("notInTaipei", lang));
          lat = TAIPEI_CENTER.lat;
          lng = TAIPEI_CENTER.lng;
        }
        setOrigin({ lat, lng });
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setWarning(t("gpsDenied", lang));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setWarning(t("gpsUnavailable", lang));
        } else if (err.code === err.TIMEOUT) {
          setWarning(t("gpsTimeout", lang));
        } else {
          setWarning(t("gpsDenied", lang));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const headingKey = origin ? "homeNearbyHeading" : "homeFeaturedHeading";

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 30%, rgba(168,85,247,0.18), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-[1200px] px-4 md:px-8 pt-14 md:pt-20 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs font-medium text-slate-300 mb-5">
            <span className="text-emerald-300">●</span>
            YTP 2026 · Module 2 · AI 即時在地玩樂推播
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-sky-200 via-white to-violet-200 bg-clip-text text-transparent">
            {t("homeHeroTitle", lang)}
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            {t("homeHeroSubtitle", lang)}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={exploreNearby}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition"
            >
              {loading ? t("homeExploreLoading", lang) : t("homeExploreNearby", lang)}
            </button>
            <Link
              href="/itinerary"
              className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow shadow-violet-500/30 transition"
            >
              ✨ {t("homeStartItinerary", lang)}
            </Link>
          </div>
          {warning && (
            <p className="mt-3 text-xs text-amber-300">{warning}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 md:px-8 pb-12">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {t(headingKey, lang)}
          </h2>
          <Link
            href="/plan"
            className="text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2"
          >
            {t("homeAllAttractions", lang)} →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n) => (
            <div
              key={n.id}
              className="card-hover group rounded-xl bg-slate-900/70 ring-1 ring-slate-800 overflow-hidden flex flex-col"
            >
              <AttractionImage attraction={n} lang={lang} className="h-44 w-full" rounded="" />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 text-base leading-tight">
                      {attractionName(n, lang)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {attractionCategory(n, lang)}
                      {typeof n.distanceKm === "number" && (
                        <>
                          {" · "}
                          {n.distanceKm.toFixed(2)} {t("km", lang)}
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-bold ${
                      n.ticket === 0 ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {n.ticket === 0 ? t("free", lang) : `NT$${n.ticket}`}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/plan?dest=${n.id}${
                      origin ? `&lat=${origin.lat}&lng=${origin.lng}` : ""
                    }`}
                    className="flex-1 rounded-md bg-sky-600 hover:bg-sky-500 px-2.5 py-1.5 text-xs font-medium text-white text-center transition"
                  >
                    🛣️ {t("navPlan", lang)}
                  </Link>
                  {n.ticket > 0 && (
                    <a
                      href={kkdayTicketUrl(n, lang)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-amber-500 hover:bg-amber-400 px-2.5 py-1.5 text-xs font-medium text-slate-900 transition"
                    >
                      🎟️ KKday ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-[1200px] px-4 md:px-8 pb-8 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} 台北找樂 · YTP 2026 · Powered by{" "}
        <span className="text-slate-400">Claude Opus 4.7</span> · Photos ©{" "}
        <a
          href="https://commons.wikimedia.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-300 underline underline-offset-2"
        >
          Wikimedia Commons
        </a>
      </footer>
    </main>
  );
}
