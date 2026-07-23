"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { PullMapItem } from "./pull-map";

const SOLO_CENTER: [number, number] = [-7.5666, 110.8167];

const itemIcon = L.divIcon({
  className: "",
  html: '<div style="width:34px;height:34px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:#0e9855;border:3px solid #fff;box-shadow:0 8px 18px rgba(5,79,42,.28);display:grid;place-items:center"><span style="width:8px;height:8px;border-radius:999px;background:#fff;display:block"></span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 30],
  popupAnchor: [0, -30],
});

const userIcon = L.divIcon({
  className: "",
  html: '<div style="width:24px;height:24px;border-radius:999px;background:#2684f3;border:4px solid #fff;box-shadow:0 0 0 3px rgba(38,132,243,.25),0 6px 16px rgba(20,80,160,.25)"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapController({
  items,
  focusRequest,
  userPosition,
}: {
  items: PullMapItem[];
  focusRequest: number;
  userPosition: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const positions = [userPosition, ...items.map((item) => item.coordinates)];
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [44, 44], maxZoom: 13 });
    } else {
      map.setView(userPosition, 13);
    }
  }, [items, map, userPosition]);

  useEffect(() => {
    if (focusRequest) map.flyTo(userPosition, 14, { duration: 0.7 });
  }, [focusRequest, map, userPosition]);

  return null;
}

export default function PullMapInner({
  items,
  radius,
  focusRequest,
  onSelectItem,
}: {
  items: PullMapItem[];
  radius: number;
  focusRequest: number;
  onSelectItem: (id: string) => void;
}) {
  const [userPosition, setUserPosition] = useState<[number, number]>(SOLO_CENTER);
  const [hasUserPosition, setHasUserPosition] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition([coords.latitude, coords.longitude]);
        setHasUserPosition(true);
      },
      () => setHasUserPosition(false),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8_000 },
    );
  }, []);

  return (
    <MapContainer
      center={SOLO_CENTER}
      zoom={13}
      scrollWheelZoom
      className="h-full min-h-[620px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={userPosition}
        radius={radius * 1000}
        pathOptions={{
          color: "#5d9f65",
          fillColor: "#84b778",
          fillOpacity: 0.12,
          weight: 1,
        }}
      />
      <Marker position={userPosition} icon={userIcon}>
        <Popup>{hasUserPosition ? "Lokasimu" : "Pusat peta · Solo (lokasi perangkat belum tersedia)"}</Popup>
      </Marker>
      {items.map((item) => (
        <Marker
          key={item.id}
          position={item.coordinates}
          icon={itemIcon}
          eventHandlers={{ click: () => onSelectItem(item.id) }}
        >
          <Popup>
            <button
              type="button"
              onClick={() => onSelectItem(item.id)}
              className="min-w-44 text-left"
            >
              <strong className="block text-sm">{item.title}</strong>
              <span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span>
              {item.value ? (
                <span className="mt-2 block text-sm font-bold text-emerald-700">{item.value}</span>
              ) : null}
            </button>
          </Popup>
        </Marker>
      ))}
      <MapController items={items} focusRequest={focusRequest} userPosition={userPosition} />
    </MapContainer>
  );
}
