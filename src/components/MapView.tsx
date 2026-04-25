"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { Attraction } from "@/lib/attractions";
import { TAIPEI_CENTER, attractionName } from "@/lib/attractions";
import type { Lang } from "@/lib/i18n";

const icon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const ORIGIN_ICON = icon("#22c55e");
const DEST_ICON = icon("#ef4444");
const NEAR_ICON = icon("#f59e0b");

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

type Props = {
  origin: { lat: number; lng: number } | null;
  destination: Attraction | null;
  nearby: (Attraction & { distanceKm: number })[];
  lang: Lang;
  onMapClick: (lat: number, lng: number) => void;
};

export default function MapView({ origin, destination, nearby, lang, onMapClick }: Props) {
  const center = origin ?? TAIPEI_CENTER;
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

      {origin && destination && (
        <Polyline
          positions={[
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ]}
          pathOptions={{ color: "#60a5fa", weight: 4, dashArray: "6 6" }}
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
