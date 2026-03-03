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

// FIX: Leaflet marker icons for Vite + TS
const markerIcon2x = new URL(
  "leaflet/dist/images/marker-icon-2x.png",
  import.meta.url
).href;

const markerIcon = new URL(
  "leaflet/dist/images/marker-icon.png",
  import.meta.url
).href;

const markerShadow = new URL(
  "leaflet/dist/images/marker-shadow.png",
  import.meta.url
).href;

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

/* ================= AUTO ZOOM ================= */

function AutoZoom({ latest }: any) {
  const map = useMap();

  useEffect(() => {
    if (!latest) return;
    setTimeout(() => {
      map.flyTo(
        [+latest.Latitude, +latest.Longitude],
        15,
        { duration: 1.2 }
      );
    }, 600);
  }, [latest]);

  return null;
}

/* ================= GEO HELPERS ================= */

function pointInPolygon(point: L.LatLng, vs: L.LatLng[]) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].lng;
    const yi = vs[i].lat;
    const xj = vs[j].lng;
    const yj = vs[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng <
        ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

function countRetailersInZone(zone: any, retailers: any[]) {
  return retailers.filter(r => {
    if (!r.Latitude || !r.Longitude) return false;
    const p = L.latLng(+r.Latitude, +r.Longitude);

    if (zone.type === "circle") {
      return (
        L.latLng(zone.data.center).distanceTo(p) <=
        zone.data.radius
      );
    }

    if (zone.type === "polygon") {
      const pts = zone.data[0] || zone.data;
      return pointInPolygon(p, pts);
    }
    return false;
  }).length;
}

/* ================= ZONES LAYER ================= */

function ZonesLayer({
  zones,
  selectedZone,
  onSelect,
  disabled,
}: any) {
  const map = useMap();
  const ref = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!ref.current) {
      ref.current = L.layerGroup().addTo(map);
    }

    ref.current.clearLayers();
    if (disabled) return;

    zones.forEach((z: any) => {
      if (!z.type || !z.data) return;

      const isSelected = selectedZone?.id === z.id;
      const color = isSelected ? "#ef4444" : z.color || "#2563eb";

      const shape =
        z.type === "circle"
          ? L.circle(z.data.center, {
              radius: z.data.radius,
              color,
              weight: isSelected ? 4 : 3,
              fillOpacity: 0.35,
            })
          : L.polygon(z.data, {
              color,
              weight: isSelected ? 4 : 3,
              fillOpacity: 0.35,
            });

      shape.on("click", () => onSelect(z));
      shape.addTo(ref.current!);
    });
  }, [zones, selectedZone, disabled]);

  return null;
}

/* ================= MEASURE TOOL ================= */

function MeasureTool({
  enabled,
  onDistance,
}: {
  enabled: boolean;
  onDistance: (d: number) => void;
}) {
  const map = useMap();
  const points = useRef<L.LatLng[]>([]);
  const line = useRef<L.Polyline | null>(null);
  const dots = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!enabled) {
      if (line.current) map.removeLayer(line.current);
      dots.current.forEach(d => map.removeLayer(d));
      points.current = [];
      dots.current = [];
      onDistance(0);
      map.getContainer().style.cursor = "";
      return;
    }

    map.getContainer().style.cursor = "crosshair";

    if (!map.getPane("measurePane")) {
      map.createPane("measurePane");
      map.getPane("measurePane")!.style.zIndex = "650";
    }

    const click = (e: any) => {
      points.current.push(e.latlng);

      const dot = L.circleMarker(e.latlng, {
        radius: 5,
        color: "#ef4444",
        fillOpacity: 1,
        pane: "measurePane",
      }).addTo(map);

      dots.current.push(dot);

      if (!line.current) {
        line.current = L.polyline(points.current, {
          color: "#ef4444",
          weight: 3,
          pane: "measurePane",
        }).addTo(map);
      } else {
        line.current.setLatLngs(points.current);
      }

      let d = 0;
      for (let i = 1; i < points.current.length; i++) {
        d += points.current[i - 1].distanceTo(
          points.current[i]
        );
      }
      onDistance(d);
    };

    map.on("click", click);
    return () => map.off("click", click);
  }, [enabled]);

  return null;
}

/* ================= DRAW CONTROLS ================= */

function DrawControls({ enabled, onCreate }: any) {
  const map = useMap();
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    if (!ref.current) {
      ref.current = new (L.Control as any).Draw({
        draw: {
          polygon: true,
          circle: true,
          rectangle: false,
          polyline: false,
          marker: false,
          circlemarker: false,
        },
        edit: false,
      });
      map.addControl(ref.current);
    }

    const handler = (e: any) => {
      const layer = e.layer;

      if (layer instanceof L.Circle) {
        onCreate({
          type: "circle",
          data: {
            center: layer.getLatLng(),
            radius: layer.getRadius(),
          },
        });
      } else if (layer instanceof L.Polygon) {
        onCreate({
          type: "polygon",
          data: layer.getLatLngs(),
        });
      }
    };

    map.on(L.Draw.Event.CREATED, handler);
    return () => map.off(L.Draw.Event.CREATED, handler);
  }, [enabled]);

  return null;
}

/* ================= MAIN ================= */

export default function AdminMapView({
  retailers,
  zonesMode,
}: any) {
  const [zones, setZones] = useState<any[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [zoneCount, setZoneCount] = useState(0);

  const [newZone, setNewZone] = useState<any | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneColor, setZoneColor] = useState("#2563eb");
  const [zoneAgent, setZoneAgent] = useState("");

  const [measureOn, setMeasureOn] = useState(false);
  const [distance, setDistance] = useState(0);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  const valid = retailers.filter(
    (r: any) => r.Latitude && r.Longitude
  );
  const latest = valid.length ? valid[valid.length - 1] : null;

  /* LOAD ZONES */
  useEffect(() => {
    fetch(`${API}?action=zones`)
      .then(r => r.json())
      .then(d => {
        const zs = (d.data || []).map((z: any) => ({
          id: z.Zone_ID,
          name: z.Zone_Name,
          type: z.Zone_Type,
          data: z.Zone_Data,
          color: z.Color || "#2563eb",
          agent: z.Assigned_Agent || "",
        }));
        setZones(zs);
      });
  }, []);

  /* LOAD AGENTS */
  useEffect(() => {
    fetch(`${API}?action=agents`)
      .then(r => r.json())
      .then(d => setAgents(d.data || []));
  }, []);

  useEffect(() => {
    if (retailers.length) {
      setTimeout(() => setLoadingMap(false), 600);
    }
  }, [retailers]);

  /* SAVE ZONE */
  function saveZone() {
    setSaving(true);

    const updated = [
      ...zones,
      {
        id: Date.now().toString(),
        name: zoneName,
        type: newZone.type,
        data: newZone.data,
        color: zoneColor,
        agent: zoneAgent,
      },
    ];

    setZones(updated);

    fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "save_zones",
        zones: updated,
      }),
    }).finally(() => {
      setSaving(false);
      setToast("Zone saved successfully");
    });

    setNewZone(null);
    setZoneName("");
    setZoneAgent("");
    setZoneColor("#2563eb");
  }

  /* DELETE ZONE */
  function deleteZone() {
    if (!selectedZone) return;

    setSaving(true);

    const updated = zones.filter(z => z.id !== selectedZone.id);
    setZones(updated);
    setSelectedZone(null);
    setZoneCount(0);

    fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "save_zones",
        zones: updated,
      }),
    }).finally(() => {
      setSaving(false);
      setToast("Zone deleted");
    });
  }

  return (
    <div style={{ height: "100%", position: "relative" }}>
     <MapContainer
  center={
    latest
      ? [+latest.Latitude, +latest.Longitude]
      : [0.0236, 37.9062]
  }
  zoom={latest ? 15 : 6}
  minZoom={3}
  maxZoom={19}
  scrollWheelZoom={true}
  zoomControl={true}
  style={{ height: "100%", width: "100%" }}
>
      <TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  maxZoom={20}
/>
        <AutoZoom latest={latest} />

        {!measureOn &&
          valid.map((r: any, i: number) => (
            <Marker key={i} position={[+r.Latitude, +r.Longitude]}>
             <Popup>
  <div style={{ minWidth: 180 }}>
    <strong>{r.Retailer_Name}</strong>
    <br />
    Owner: {r.Owner_Name || "-"}
    <br />
    Phone: {r.Phone || "-"}
    <br />
    {r.Area}, {r.City}
  </div>
</Popup>
            </Marker>
          ))}

        <ZonesLayer
          zones={zones}
          selectedZone={selectedZone}
          disabled={measureOn}
          onSelect={(z: any) => {
            setSelectedZone(z);
            setZoneCount(countRetailersInZone(z, retailers));
          }}
        />

        {zonesMode && !measureOn && (
          <DrawControls enabled onCreate={setNewZone} />
        )}

        <MeasureTool enabled={measureOn} onDistance={setDistance} />
      </MapContainer>

      {/* MEASURE TOGGLE */}
      <button
        onClick={() => {
          setMeasureOn(v => !v);
          setDistance(0);
        }}
        style={measureBtn}
      >
        {measureOn ? "✖ Close Measure" : "📏 Measure"}
      </button>

      {/* DISTANCE */}
      {measureOn && distance > 0 && (
        <div style={distancePill}>
          {distance < 1000
            ? `${distance.toFixed(1)} m`
            : `${(distance / 1000).toFixed(2)} km`}
        </div>
      )}

      {/* ZONE INFO */}
      {selectedZone && (
        <div style={infoCard}>
          <div style={{ fontWeight: 700 }}>{selectedZone.name}</div>
          <div>Agent: {selectedZone.agent || "Unassigned"}</div>
          <div>Retailers: {zoneCount}</div>
          <button onClick={deleteZone} style={{ marginTop: 8 }}>
            Delete Zone
          </button>
        </div>
      )}

      {/* CREATE ZONE MODAL */}
      {newZone && (
        <div style={modal}>
          <div style={modalBox}>
            <h3>Create Zone</h3>
            <input
              placeholder="Zone name"
              value={zoneName}
              onChange={e => setZoneName(e.target.value)}
            />
            <select
              value={zoneAgent}
              onChange={e => setZoneAgent(e.target.value)}
            >
              <option value="">Assign agent</option>
              {agents.map(a => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <input
              type="color"
              value={zoneColor}
              onChange={e => setZoneColor(e.target.value)}
            />
            <button onClick={saveZone}>Save</button>
          </div>
        </div>
      )}

      {saving && <div style={overlay}>Processing…</div>}
      {toast && (
        <div style={toastStyle} onClick={() => setToast(null)}>
          {toast}
        </div>
      )}
      {loadingMap && <div style={overlay}>Loading Map…</div>}
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "absolute" as const,
  inset: 0,
  background: "rgba(255,255,255,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  fontWeight: 600,
  zIndex: 9999,
};

const infoCard = {
  position: "absolute" as const,
  bottom: 20,
  right: 20,
  background: "#fff",
  padding: 14,
  borderRadius: 10,
  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
  zIndex: 9999,
};

const modal = {
  position: "absolute" as const,
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};

const modalBox = {
  background: "#fff",
  padding: 20,
  width: 340,
  borderRadius: 10,
};

const measureBtn = {
  position: "absolute" as const,
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 9999,
};

const distancePill = {
  position: "absolute" as const,
  top: 16,
  right: 16,
  background: "#111",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 8,
  zIndex: 9999,
};

const toastStyle = {
  position: "absolute" as const,
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#16a34a",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 10,
  zIndex: 10001,
};
