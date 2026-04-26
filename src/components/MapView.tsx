"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Attraction } from "@/lib/attractions";
import { TAIPEI_CENTER, attractionName } from "@/lib/attractions";
import { MODE_STYLE, type Route } from "@/lib/transport";
import type { Lang } from "@/lib/i18n";

const icon = (color: string, size = 18) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const ORIGIN_ICON = icon("#22c55e", 20);
const DEST_ICON = icon("#ef4444", 20);
const NEAR_ICON = icon("#f59e0b", 14);

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

function FitBounds({
  origin,
  destination,
}: {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ).pad(0.3);
      map.fitBounds(bounds, { animate: true, duration: 0.7 });
    }
  }, [origin, destination, map]);
  return null;
}

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type LatLng = [number, number];

// Linear-interpolate waypoints along origin → destination, by segment km share.
function buildRouteWaypoints(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  route: Route
): LatLng[] {
  const total = route.totalKm || 1;
  const points: LatLng[] = [[origin.lat, origin.lng]];
  let acc = 0;
  for (const seg of route.segments) {
    acc += seg.km;
    const t = Math.min(1, acc / total);
    points.push([
      origin.lat + (destination.lat - origin.lat) * t,
      origin.lng + (destination.lng - origin.lng) * t,
    ]);
  }
  // Ensure exact endpoint
  points[points.length - 1] = [destination.lat, destination.lng];
  return points;
}

type Props = {
  origin: { lat: number; lng: number } | null;
  destination: Attraction | null;
  nearby: (Attraction & { distanceKm: number })[];
  selectedRoute: Route | null;
  lang: Lang;
  onMapClick: (lat: number, lng: number) => void;
};

export default function MapView({
  origin,
  destination,
  nearby,
  selectedRoute,
  lang,
  onMapClick,
}: Props) {
  const center = origin ?? TAIPEI_CENTER;

  let segmentLines: { points: LatLng[]; segIndex: number }[] = [];
  if (origin && destination && selectedRoute) {
    const waypoints = buildRouteWaypoints(origin, destination, selectedRoute);
    segmentLines = selectedRoute.segments.map((_, i) => ({
      points: [waypoints[i], waypoints[i + 1]],
      segIndex: i,
    }));
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: 12 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onMapClick} />

      {origin && (
        <>
          <Marker position={[origin.lat, origin.lng]} icon={ORIGIN_ICON}>
            <Popup>
              {lang === "zh"
                ? "我的位置"
                : lang === "ja"
                ? "現在地"
                : lang === "ko"
                ? "내 위치"
                : "My Location"}
            </Popup>
          </Marker>
          <FlyTo lat={origin.lat} lng={origin.lng} />
        </>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={DEST_ICON}>
          <Popup>{attractionName(destination, lang)}</Popup>
        </Marker>
      )}

      {origin && destination && <FitBounds origin={origin} destination={destination} />}

      {/* Selected-route colored segments */}
      {origin &&
        destination &&
        selectedRoute &&
        segmentLines.map((line, i) => {
          const seg = selectedRoute.segments[line.segIndex];
          const style = MODE_STYLE[seg.mode];
          return (
            <Polyline
              key={`${selectedRoute.id}-${i}`}
              positions={line.points}
              pathOptions={{
                color: style.color,
                weight: style.weight,
                dashArray: style.dashArray,
                opacity: 0.92,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          );
        })}

      {/* Fallback when no route selected: faint straight line */}
      {origin && destination && !selectedRoute && (
        <Polyline
          positions={[
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ]}
          pathOptions={{
            color: "#60a5fa",
            weight: 3,
            dashArray: "4 8",
            opacity: 0.5,
          }}
        />
      )}

      {nearby.map((n) => (
        <Marker key={n.id} position={[n.lat, n.lng]} icon={NEAR_ICON}>
          <Popup>
            <div style={{ fontWeight: 600 }}>{attractionName(n, lang)}</div>
            <div>
              {n.distanceKm.toFixed(2)} km ·{" "}
              {n.ticket === 0
                ? lang === "zh"
                  ? "免費"
                  : lang === "ja"
                  ? "無料"
                  : lang === "ko"
                  ? "무료"
                  : "Free"
                : `NT$${n.ticket}`}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
