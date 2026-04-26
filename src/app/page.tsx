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
  MODE_STYLE,
  haversineKm,
  nearbyAttractions,
  planRoutes,
  type Route,
  type RouteTag,
  type TransportMode,
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

const isApiKeyMissingError = (msg: string) =>
  /ANTHROPIC_API_KEY/i.test(msg) || /API key/i.test(msg);

function ApiKeyMissingCard({ lang }: { lang: Lang }) {
  return (
    <div className="rounded-md bg-amber-500/10 ring-1 ring-amber-500/40 p-3 mt-2">
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0">🔑</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-amber-200">
            {t("apiKeyMissingTitle", lang)}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            {t("apiKeyMissingBody", lang)}
          </p>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[11px] font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2"
          >
            {t("apiKeyGetIt", lang)} ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({
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
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function Page() {
  const [lang, setLang] = useState<Lang>("zh");
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [destId, setDestId] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["origin", "dest"])
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
      setWarning(t("gpsUnsupported", lang));
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
      (err) => {
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

  // Auto-open relevant sections when a destination is picked
  useEffect(() => {
    if (destId) {
      setOpenSections((prev) => new Set([...prev, "ticket", "routes"]));
    }
  }, [destId]);

  // Auto-select best route when route list changes (priority: balanced > fastest > cheapest > first)
  useEffect(() => {
    if (routes.length === 0) {
      setSelectedRouteId(null);
      return;
    }
    if (selectedRouteId && routes.some((r) => r.id === selectedRouteId)) return;
    const byPriority =
      routes.find((r) => r.tags.includes("balanced")) ??
      routes.find((r) => r.tags.includes("fastest")) ??
      routes.find((r) => r.tags.includes("cheapest")) ??
      routes[0];
    setSelectedRouteId(byPriority.id);
  }, [routes, selectedRouteId]);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? null,
    [routes, selectedRouteId]
  );

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
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 text-xl font-black text-slate-950 shadow-lg shadow-sky-500/30">
              北
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-sky-200 via-white to-violet-200 bg-clip-text text-transparent">
                {t("brand", lang)}
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                {t("brandTagline", lang)}
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg bg-slate-800/60 p-1 ring-1 ring-slate-700">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
                  lang === l
                    ? "bg-sky-600 text-white shadow shadow-sky-500/30"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-4 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("appTitle", lang)}
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-1">
            {t("subtitle", lang)}
          </p>
        </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="space-y-5">
          <Section
            id="origin"
            title={<span className="text-slate-200">📍 {t("origin", lang)}</span>}
            accent="bg-slate-900/70 ring-slate-800"
            openSet={openSections}
            onToggle={toggleSection}
          >
            <button
              onClick={requestGps}
              className="w-full rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-3 py-2 text-sm font-semibold gps-pulse transition"
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
          </Section>

          <Section
            id="dest"
            title={<span className="text-slate-200">🎯 {t("destination", lang)}</span>}
            accent="bg-slate-900/70 ring-slate-800"
            badge={
              destination ? (
                <span className="text-xs text-slate-400 max-w-[140px] truncate">
                  {attractionName(destination, lang)}
                </span>
              ) : null
            }
            openSet={openSections}
            onToggle={toggleSection}
          >
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
          </Section>

          {destination && (
            <Section
              id="ticket"
              title={
                <span className="text-amber-100">🎟️ {t("ticketInfo", lang)}</span>
              }
              accent="bg-gradient-to-br from-amber-900/40 to-orange-900/30 ring-amber-700/40"
              badge={
                <span
                  className={`text-sm font-bold ${
                    destination.ticket === 0 ? "text-emerald-300" : "text-amber-200"
                  }`}
                >
                  {destination.ticket === 0
                    ? t("free", lang)
                    : `NT$ ${destination.ticket}`}
                </span>
              }
              openSet={openSections}
              onToggle={toggleSection}
            >
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
            </Section>
          )}

          <Section
            id="routes"
            title={
              <span className="text-slate-200">🛣️ {t("recommendedRoutes", lang)}</span>
            }
            accent="bg-slate-900/70 ring-slate-800"
            badge={
              distanceKm != null ? (
                <span className="text-xs text-slate-400">
                  {distanceKm.toFixed(2)} {t("km", lang)}
                </span>
              ) : null
            }
            openSet={openSections}
            onToggle={toggleSection}
          >
            {origin && destination && distanceKm != null && routes.length > 0 ? (
              <div className="space-y-3">
              {routes.map((r) => {
                const isSelected = selectedRouteId === r.id;
                return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`cursor-pointer rounded-lg bg-slate-800/60 p-3 ring-1 transition card-hover ${
                    isSelected
                      ? "route-selected ring-sky-500"
                      : "ring-slate-700 hover:ring-slate-500"
                  }`}
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
                    <div className="flex gap-1 items-center">
                      {isSelected && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40">
                          🗺️ {t("selectedOnMap", lang)}
                        </span>
                      )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDetail(r);
                    }}
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
                    isApiKeyMissingError(details[r.id].error) ? (
                      <ApiKeyMissingCard lang={lang} />
                    ) : (
                      <p className="mt-2 text-xs text-rose-400">
                        {details[r.id].error}
                      </p>
                    )
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
                );
              })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t("fillFirst", lang)}</p>
            )}
          </Section>

          <Section
            id="ai"
            title={<span className="text-slate-100">✨ {t("askAi", lang)}</span>}
            accent="bg-gradient-to-br from-violet-900/50 to-fuchsia-900/30 ring-violet-700/40"
            openSet={openSections}
            onToggle={toggleSection}
          >
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
                  isApiKeyMissingError(aiError) ? (
                    <ApiKeyMissingCard lang={lang} />
                  ) : (
                    <p className="mt-2 text-xs text-rose-400">{aiError}</p>
                  )
                )}
                {aiAnswer && (
                  <div className="mt-3 rounded-md bg-slate-900/60 p-3 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {aiAnswer}
                  </div>
                )}
              </>
            )}
          </Section>

          {destination && nearby.length > 0 && (
            <Section
              id="nearby"
              title={
                <span className="text-slate-200">📍 {t("nearby", lang)}</span>
              }
              accent="bg-slate-900/70 ring-slate-800"
              badge={
                <span className="text-xs text-slate-400">
                  {nearby.length}
                </span>
              }
              openSet={openSections}
              onToggle={toggleSection}
            >
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
            </Section>
          )}
        </section>

        <section className="h-[60vh] lg:h-[calc(100vh-180px)] lg:sticky lg:top-[88px] rounded-xl overflow-hidden ring-1 ring-slate-800 shadow-2xl shadow-slate-950/50 relative">
          <MapView
            origin={origin}
            destination={destination}
            nearby={nearby}
            selectedRoute={selectedRoute}
            lang={lang}
            onMapClick={handleMapClick}
          />
          {selectedRoute && (
            <div className="absolute top-3 left-3 z-[400] rounded-lg bg-slate-900/85 backdrop-blur-sm ring-1 ring-slate-700 px-3 py-2 text-xs space-y-1 max-w-[240px]">
              <div className="font-semibold text-slate-200 mb-1">
                {t("legend", lang)}
              </div>
              {selectedRoute.segments.map((s, i) => {
                const style = MODE_STYLE[s.mode as TransportMode];
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="inline-block h-1 w-6 rounded"
                      style={{
                        background: style.color,
                        opacity: style.dashArray ? 0.7 : 1,
                      }}
                    />
                    <span>
                      {MODE_ICON[s.mode as TransportMode]} {t(s.mode as TransportMode, lang)} ·{" "}
                      {s.km.toFixed(1)} km
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

        <footer className="mt-12 pt-6 border-t border-white/5 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} 台北找樂 · YTP 2026 · Powered by{" "}
          <span className="text-slate-400">Claude Opus 4.7</span> ·{" "}
          <span className="text-slate-400">Leaflet</span> ·{" "}
          <span className="text-slate-400">OpenStreetMap</span>
        </footer>
      </div>
    </main>
  );
}
