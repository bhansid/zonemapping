// KEEP YOUR IMPORTS SAME
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

/* AUTO ZOOM HELPER */
function AutoZoom({ latest }: any) {
  const map = useMap();

  useEffect(() => {
    if (!latest) return;

    const lat = Number(latest.Latitude);
    const lng = Number(latest.Longitude);

    setTimeout(() => {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    }, 500);
  }, [latest]);

  return null;
}

/* ================= MAIN ================= */

export default function AdminMapView({
  retailers,
  zonesMode,
}: {
  retailers: any[];
  zonesMode: boolean;
}) {
  const [loadingMap, setLoadingMap] = useState(true);

  const valid = retailers.filter(r => r.Latitude && r.Longitude);
  const latest = valid.length ? valid[valid.length - 1] : null;

  useEffect(() => {
    if (retailers.length > 0) {
      setTimeout(() => setLoadingMap(false), 1000);
    }
  }, [retailers]);

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <MapContainer
        center={
          latest
            ? [Number(latest.Latitude), Number(latest.Longitude)]
            : [0.0236, 37.9062]
        }
        zoom={latest ? 15 : 6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <AutoZoom latest={latest} />

        {valid.map((r, i) => (
          <Marker key={i} position={[+r.Latitude, +r.Longitude]}>
            <Popup>
              <strong>{r.Retailer_Name}</strong>
              <br />
              {r.Area}, {r.City}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loadingMap && (
        <div style={mapOverlay}>
          Loading Map…
        </div>
      )}
    </div>
  );
}

const mapOverlay = {
  position: "absolute" as const,
  inset: 0,
  background: "rgba(255,255,255,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  fontWeight: 600,
  zIndex: 9999,
};
