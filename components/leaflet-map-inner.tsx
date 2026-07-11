"use client";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const resolveAssetUrl = (asset: string | { src: string }) =>
  typeof asset === "string" ? asset : asset.src;

const markerIconAsset = new L.Icon({
  iconRetinaUrl: resolveAssetUrl(markerIcon2x),
  iconUrl: resolveAssetUrl(markerIcon),
  shadowUrl: resolveAssetUrl(markerShadow),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const center: [number, number] = [51.505, -0.09];

export default function LeafletMapInner() {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full min-h-[392px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={markerIconAsset}>
        <Popup>Leaflet is live inside the PWA shell.</Popup>
      </Marker>
    </MapContainer>
  );
}