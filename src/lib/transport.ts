export type TransportMode = "walk" | "mrt" | "bus" | "taxi" | "ubike";

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export type TransportNoteKey = "walkTooFar" | "ubikeTooFar";

export type TransportEstimate = {
  fareTwd: number;
  minutes: number;
  feasible: boolean;
  noteKey?: TransportNoteKey;
};

export function estimateTransport(
  distanceKm: number,
  mode: TransportMode
): TransportEstimate {
  switch (mode) {
    case "walk": {
      const minutes = Math.round((distanceKm / 5) * 60);
      return {
        fareTwd: 0,
        minutes,
        feasible: distanceKm <= 5,
        noteKey: distanceKm > 5 ? "walkTooFar" : undefined,
      };
    }
    case "ubike": {
      const minutes = Math.round((distanceKm / 15) * 60);
      const first30 = 10;
      const extra = Math.max(0, minutes - 30);
      const fare = first30 + Math.ceil(extra / 30) * 20;
      return {
        fareTwd: fare,
        minutes,
        feasible: distanceKm <= 15,
        noteKey: distanceKm > 15 ? "ubikeTooFar" : undefined,
      };
    }
    case "mrt": {
      const fare = Math.min(65, Math.max(20, 20 + Math.floor(distanceKm / 1.5) * 5));
      const minutes = Math.round((distanceKm / 35) * 60) + 8;
      return { fareTwd: fare, minutes, feasible: true };
    }
    case "bus": {
      const segments = Math.ceil(distanceKm / 8);
      const fare = segments * 15;
      const minutes = Math.round((distanceKm / 18) * 60) + 5;
      return { fareTwd: fare, minutes, feasible: true };
    }
    case "taxi": {
      const base = 85;
      const extraKm = Math.max(0, distanceKm - 1.25);
      const extraFare = Math.ceil((extraKm * 1000) / 200) * 5;
      const minutes = Math.round((distanceKm / 28) * 60);
      return { fareTwd: base + extraFare, minutes, feasible: true };
    }
  }
}

export function nearbyAttractions<T extends { lat: number; lng: number }>(
  origin: { lat: number; lng: number },
  list: T[],
  topN = 5
): (T & { distanceKm: number })[] {
  return list
    .map((a) => ({ ...a, distanceKm: haversineKm(origin, a) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, topN);
}

export type RouteTag = "fastest" | "cheapest" | "balanced";

export type RouteSegment = {
  mode: TransportMode;
  km: number;
  minutes: number;
  fare: number;
};

export type Route = {
  id: string;
  segments: RouteSegment[];
  totalKm: number;
  totalMinutes: number;
  totalFare: number;
  tags: RouteTag[];
};

function makeSegment(mode: TransportMode, km: number): RouteSegment {
  const e = estimateTransport(km, mode);
  return { mode, km, minutes: e.minutes, fare: e.fareTwd };
}

function buildRoute(id: string, segments: RouteSegment[]): Route {
  return {
    id,
    segments,
    totalKm: segments.reduce((s, x) => s + x.km, 0),
    totalMinutes: segments.reduce((s, x) => s + x.minutes, 0),
    totalFare: segments.reduce((s, x) => s + x.fare, 0),
    tags: [],
  };
}

export function planRoutes(distanceKm: number): Route[] {
  if (distanceKm <= 0) return [];
  const routes: Route[] = [];

  if (distanceKm <= 3) {
    routes.push(buildRoute("walk", [makeSegment("walk", distanceKm)]));
  }
  if (distanceKm >= 0.5 && distanceKm <= 10) {
    routes.push(buildRoute("ubike", [makeSegment("ubike", distanceKm)]));
  }
  if (distanceKm >= 1.5) {
    const wA = 0.5;
    const wB = 0.5;
    const mrtKm = Math.max(0.5, distanceKm - wA - wB);
    routes.push(
      buildRoute("mrt", [
        makeSegment("walk", wA),
        makeSegment("mrt", mrtKm),
        makeSegment("walk", wB),
      ])
    );
  }
  if (distanceKm >= 0.8) {
    const w = 0.2;
    const busKm = Math.max(0.5, distanceKm - 2 * w);
    routes.push(
      buildRoute("bus", [
        makeSegment("walk", w),
        makeSegment("bus", busKm),
        makeSegment("walk", w),
      ])
    );
  }
  routes.push(buildRoute("taxi", [makeSegment("taxi", distanceKm)]));

  if (routes.length === 0) return routes;

  const fastest = [...routes].sort((a, b) => a.totalMinutes - b.totalMinutes)[0];
  fastest.tags.push("fastest");

  const cheapest = [...routes].sort((a, b) => a.totalFare - b.totalFare)[0];
  if (cheapest.id !== fastest.id) cheapest.tags.push("cheapest");

  const maxT = Math.max(...routes.map((r) => r.totalMinutes)) || 1;
  const maxF = Math.max(...routes.map((r) => r.totalFare)) || 1;
  const balanced = [...routes].sort(
    (a, b) =>
      a.totalMinutes / maxT + a.totalFare / maxF -
      (b.totalMinutes / maxT + b.totalFare / maxF)
  )[0];
  if (
    !balanced.tags.includes("fastest") &&
    !balanced.tags.includes("cheapest")
  ) {
    balanced.tags.push("balanced");
  }

  return routes;
}

export const MODE_ICON: Record<TransportMode, string> = {
  walk: "🚶",
  ubike: "🚲",
  mrt: "🚇",
  bus: "🚌",
  taxi: "🚕",
};

// Hex color + dash style per transport mode for map polylines
export const MODE_STYLE: Record<
  TransportMode,
  { color: string; dashArray?: string; weight: number }
> = {
  walk: { color: "#34d399", weight: 4, dashArray: "2 8" },
  ubike: { color: "#a3e635", weight: 5, dashArray: "8 4" },
  mrt: { color: "#ef4444", weight: 6 },
  bus: { color: "#3b82f6", weight: 5, dashArray: "10 6" },
  taxi: { color: "#f59e0b", weight: 5 },
};
