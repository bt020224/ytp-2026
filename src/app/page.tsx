"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  TAIPEI_ATTRACTIONS,
  TAIPEI_CENTER,
  attractionCategory,
  attractionName,
  isWithinTaipei,
  kkdayTicketUrl,
  type Attraction,
} from "@/lib/attractions";
import {
  MODE_ICON,
  haversineKm,
  nearbyAttractions,
  planRoutes,
  type Route,
  type RouteTag,
} from "@/lib/transport";
import { LANG_LABELS, t, type Lang } from "@/lib/i18n";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-400">
      Loading map…
    </div>
  ),
});

type Coords = { lat: number; lng: number };

const LANGS: Lang[] = ["zh", "en", "ja", "ko"];

const TAG_STYLE: Record<RouteTag, string> = {
  fastest: "bg-amber-500/20 text-amber-300 ring-amber-500/40",
  cheapest: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  balanced: "bg-sky-500/20 text-sky-300 ring-sky-500/40",
};

const TAG_LABEL_KEY: Record<RouteTag, "tagFastest" | "tagCheapest" | "tagBalanced"> = {
  fastest: "tagFastest",
  cheapest: "tagCheapest",
  balanced: "tagBalanced",
};

export default function Page() {
  const [lang, setLang] = useState<Lang>("zh");
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [destId, setDestId] = useState<string>("");
  const [warning, setWarning] = useState<string>("");

  // AI Q&A state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Per-route AI detail state — keyed by route id
  type DetailState = { loading: boolean; text: string; error: string };
  const [details, setDetails] = useState<Record<string, DetailState>>({});

  const destination: Attraction | null = useMemo(
    () => TAIPEI_ATTRACTIONS.find((a) => a.id === destId) ?? null,
    [destId]
  );

  const distanceKm = useMemo(
    () => (origin && destination ? haversineKm(origin, destination) : null),
    [origin, destination]
  );

  const routes: Route[] = useMemo(
    () => (distanceKm != null ? planRoutes(distanceKm) : []),
    [distanceKm]
  );

  const nearby = useMemo(() => {
    if (!destination) return [];
    return nearbyAttractions(
      destination,
      TAIPEI_ATTRACTIONS.filter((a) => a.id !== destination.id),
      5
    );
  }, [destination]);

  const requestGps = () => {
    setWarning("");
    if (!navigator.geolocation) {
      setWarning(t("gpsDenied", lang));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        let { latitude: lat, longitude: lng } = pos.coords;
        if (!isWithinTaipei(lat, lng)) {
          setWarning(t("notInTaipei", lang));
          lat = TAIPEI_CENTER.lat;
          lng = TAIPEI_CENTER.lng;
        }
        setOrigin({ lat, lng });
        setLatInput(lat.toFixed(5));
        setLngInput(lng.toFixed(5));
      },
      () => setWarning(t("gpsDenied", lang))
    );
  };

  const applyManual = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    if (!isWithinTaipei(lat, lng)) {
      setWarning(t("notInTaipei", lang));
      setOrigin(TAIPEI_CENTER);
      return;
    }
    setWarning("");
    setOrigin({ lat, lng });
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!isWithinTaipei(lat, lng)) {
      setWarning(t("notInTaipei", lang));
      return;
    }
    setWarning("");
    setOrigin({ lat, lng });
    setLatInput(lat.toFixed(5));
    setLngInput(lng.toFixed(5));
  };

  // Reset detail panels when origin or destination changes
  useEffect(() => {
    setDetails({});
  }, [origin, destId]);

  const loadDetail = async (route: Route) => {
    if (!origin || !destination) return;
    setDetails((d) => ({
      ...d,
      [route.id]: { loading: true, text: "", error: "" },
    }));
    try {
      const res = await fetch("/api/route-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLat: origin.lat,
          originLng: origin.lng,
          destinationId: destination.id,
          route: { id: route.id, segments: route.segments },
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDetails((d) => ({
          ...d,
          [route.id]: {
            loading: false,
            text: "",
            error: data.error || t("askError", lang),
          },
        }));
      } else {
        setDetails((d) => ({
          ...d,
          [route.id]: { loading: false, text: data.detail, error: "" },
        }));
      }
    } catch {
      setDetails((d) => ({
        ...d,
        [route.id]: { loading: false, text: "", error: t("askError", lang) },
      }));
    }
  };

  const toggleDetail = (route: Route) => {
    const cur = details[route.id];
    if (cur?.text) {
      setDetails((d) => {
        const next = { ...d };
        delete next[route.id];
        return next;
      });
    } else if (!cur?.loading) {
      loadDetail(route);
    }
  };

  const askAi = async () => {
    if (!destination || !aiQuestion.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attractionId: destination.id,
          question: aiQuestion.trim(),
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || t("askError", lang));
      } else {
        setAiAnswer(data.answer || "");
      }
    } catch {
      setAiError(t("askError", lang));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("appTitle", lang)}
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-1">
            {t("subtitle", lang)}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-800/60 p-1 ring-1 ring-slate-700">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
                lang === l
                  ? "bg-sky-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="space-y-5">
          <div className="rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">
              {t("origin", lang)}
            </h2>
            <button
              onClick={requestGps}
              className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-medium"
            >
              📍 {t("useGps", lang)}
            </button>
            <p className="mt-3 text-xs text-slate-400">{t("manualLatLng", lang)}</p>
            <div className="mt-2 flex gap-2">
              <input
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="lat"
                className="w-1/2 rounded bg-slate-800 px-2 py-1.5 text-sm outline-none ring-1 ring-slate-700 focus:ring-sky-500"
              />
              <input
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="lng"
                className="w-1/2 rounded bg-slate-800 px-2 py-1.5 text-sm outline-none ring-1 ring-slate-700 focus:ring-sky-500"
              />
            </div>
            <button
              onClick={applyManual}
              className="mt-2 w-full rounded-md bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-sm"
            >
              ✓
            </button>
            <p className="mt-2 text-xs text-slate-500">{t("pickOnMap", lang)}</p>
            {warning && (
              <p className="mt-2 text-xs text-amber-400">{warning}</p>
            )}
          </div>

          <div className="rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">
              {t("destination", lang)}
            </h2>
            <select
              value={destId}
              onChange={(e) => {
                setDestId(e.target.value);
                setAiAnswer("");
                setAiError("");
              }}
              className="w-full rounded bg-slate-800 px-2 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-sky-500"
            >
              <option value="">{t("pickDest", lang)}</option>
              {TAIPEI_ATTRACTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {attractionName(a, lang)}
                </option>
              ))}
            </select>
          </div>

          {destination && (
            <div className="rounded-xl bg-gradient-to-br from-amber-900/40 to-orange-900/30 p-4 ring-1 ring-amber-700/40">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-amber-100">
                  🎟️ {t("ticketInfo", lang)}
                </h2>
                <span
                  className={`text-base font-bold ${
                    destination.ticket === 0 ? "text-emerald-300" : "text-amber-200"
                  }`}
                >
                  {destination.ticket === 0
                    ? t("free", lang)
                    : `NT$ ${destination.ticket}`}
                </span>
              </div>
              {destination.ticket === 0 ? (
                <p className="text-xs text-slate-300">
                  {t("freeNoTicket", lang)}
                </p>
              ) : (
                <>
                  <a
                    href={kkdayTicketUrl(destination, lang)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-md bg-amber-500 hover:bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 text-center"
                  >
                    {t("buyTicket", lang)} ↗
                  </a>
                  <p className="mt-2 text-[11px] text-slate-400">
                    {t("buyTicketNote", lang)}
                  </p>
                </>
              )}
            </div>
          )}

          {origin && destination && distanceKm != null && routes.length > 0 ? (
            <div className="rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">
                  {t("recommendedRoutes", lang)}
                </h2>
                <span className="text-xs text-slate-400">
                  {distanceKm.toFixed(2)} {t("km", lang)}
                </span>
              </div>
              {routes.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg bg-slate-800/60 p-3 ring-1 ring-slate-700"
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      {r.segments.map((s, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-slate-500">›</span>}
                          <span className="text-base">{MODE_ICON[s.mode]}</span>
                          <span className="text-xs text-slate-300">
                            {s.km.toFixed(1)}
                          </span>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {r.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${TAG_STYLE[tag]}`}
                        >
                          {t(TAG_LABEL_KEY[tag], lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      {r.totalMinutes} {t("minutes", lang)}
                    </span>
                    <span className="font-semibold text-slate-100">
                      {r.totalFare === 0 ? t("free", lang) : `NT$ ${r.totalFare}`}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDetail(r)}
                    disabled={details[r.id]?.loading}
                    className="mt-2 w-full rounded-md bg-slate-700/70 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 px-2 py-1.5 text-xs font-medium transition"
                  >
                    {details[r.id]?.loading
                      ? `⏳ ${t("loadingDetail", lang)}`
                      : details[r.id]?.text
                      ? `✕ ${t("hideDetail", lang)}`
                      : `📋 ${t("detailedDirections", lang)}`}
                  </button>
                  {details[r.id]?.error && (
                    <p className="mt-2 text-xs text-rose-400">
                      {details[r.id].error}
                    </p>
                  )}
                  {details[r.id]?.text && (
                    <div className="mt-2 rounded-md bg-slate-900/70 p-3 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed ring-1 ring-slate-700">
                      {details[r.id].text}
                      <p className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
                        {t("detailDisclaimer", lang)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900/40 p-4 ring-1 ring-slate-800 text-sm text-slate-400">
              {t("fillFirst", lang)}
            </div>
          )}

          <div className="rounded-xl bg-gradient-to-br from-violet-900/50 to-fuchsia-900/30 p-4 ring-1 ring-violet-700/40">
            <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
              ✨ {t("askAi", lang)}
            </h2>
            {!destination ? (
              <p className="text-xs text-slate-400">{t("askPickFirst", lang)}</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !aiLoading) askAi();
                    }}
                    placeholder={t("askPlaceholder", lang)}
                    disabled={aiLoading}
                    className="flex-1 rounded bg-slate-800 px-2.5 py-1.5 text-sm outline-none ring-1 ring-slate-700 focus:ring-violet-500 disabled:opacity-60"
                  />
                  <button
                    onClick={askAi}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="rounded-md bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 px-3 py-1.5 text-sm font-medium"
                  >
                    {t("askButton", lang)}
                  </button>
                </div>
                {aiLoading && (
                  <p className="mt-2 text-xs text-violet-300 animate-pulse">
                    {t("askLoading", lang)}
                  </p>
                )}
                {aiError && (
                  <p className="mt-2 text-xs text-rose-400">{aiError}</p>
                )}
                {aiAnswer && (
                  <div className="mt-3 rounded-md bg-slate-900/60 p-3 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {aiAnswer}
                  </div>
                )}
              </>
            )}
          </div>

          {destination && nearby.length > 0 && (
            <div className="rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-800">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">
                {t("nearby", lang)}
              </h2>
              <ul className="space-y-2">
                {nearby.map((n) => (
                  <li
                    key={n.id}
                    className="flex justify-between items-center rounded-md bg-slate-800/60 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {attractionName(n, lang)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {attractionCategory(n, lang)} ·{" "}
                        {n.distanceKm.toFixed(2)} {t("km", lang)}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        n.ticket === 0 ? "text-emerald-400" : "text-amber-300"
                      }`}
                    >
                      {n.ticket === 0 ? t("free", lang) : `NT$${n.ticket}`}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="h-[60vh] lg:h-[80vh] rounded-xl overflow-hidden ring-1 ring-slate-800">
          <MapView
            origin={origin}
            destination={destination}
            nearby={nearby}
            lang={lang}
            onMapClick={handleMapClick}
          />
        </section>
      </div>

      <footer className="mt-8 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} 台北找樂 · YTP 2026
      </footer>
    </main>
  );
}
