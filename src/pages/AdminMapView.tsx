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

/* ================= UTIL ================= */

// Ray-casting point-in-polygon
function pointInPolygon(point: L.LatLng, vs: L.LatLng[]) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].lng,
      yi = vs[i].lat;
    const xj = vs[j].lng,
      yj = vs[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

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
  retailers,
  onSelectZone,
}: {
  zones: any[];
  retailers: any[];
  onSelectZone: (zone: any | null, count: number) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!layerRef.current) {
      layerRef.current = L.layerGroup().addTo(map);
    }

    layerRef.current.clearLayers();

    zones.forEach(zone => {
      const color = zone.color || "#2563eb";
      let shape: any = null;

      if (zone.type === "polygon") {
        shape = L.polygon(zone.data, {
          color,
          weight: 3,
          fillColor: color,
          fillOpacity: 0.35,
        });
      }

      if (zone.type === "circle") {
        shape = L.circle(zone.data.center, {
          radius: zone.data.radius,
          color,
          weight: 3,
          fillColor: color,
          fillOpacity: 0.35,
        });
      }

      if (!shape) return;

      const handler = () => {
        const cnt = countRetailersInZone(zone, retailers);
        onSelectZone(zone, cnt);
      };

      shape.on("click", handler);
      shape.on("mouseover", handler);

      shape.addTo(layerRef.current!);
      shape.bringToFront();
      shape.options.interactive = true;
    });

    map.on("click", e => {
      const t = (e as any).originalEvent?.target;
      if (t && t.classList?.contains("leaflet-container")) {
        onSelectZone(null, 0);
      }
    });

    setTimeout(() => map.invalidateSize(), 100);
  }, [zones, retailers]);

  return null;
}

/* ================= DRAW CONTROLS ================= */

function DrawControls({
  enabled,
  onCreateZone,
}: {
  enabled: boolean;
  onCreateZone: (zone: any) => void;
}) {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    if (!controlRef.current) {
      const control = new (L.Control as any).Draw({
        position: "topright",
        draw: {
          polygon: true,
          circle: true,
          rectangle: false,
          polyline: false,
          marker: false,
          circlemarker: false,
        },
      });

      map.addControl(control);
      controlRef.current = control;
    }

    map.on(L.Draw.Event.CREATED, e => {
      const layer = e.layer;

      if (layer instanceof L.Circle) {
        onCreateZone({
          type: "circle",
          data: {
            center: layer.getLatLng(),
            radius: layer.getRadius(),
          },
        });
      }

      if (layer instanceof L.Polygon) {
        onCreateZone({
          type: "polygon",
          data: layer.getLatLngs(),
        });
      }
    });
  }, [enabled]);

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
  const [zones, setZones] = useState<any[]>([]);
  const [agents, setAgents] = useState<string[]>([]);

  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [zoneCount, setZoneCount] = useState(0);

  const [newZone, setNewZone] = useState<any | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneColor, setZoneColor] = useState("#2563eb");
  const [zoneAgent, setZoneAgent] = useState("");

  const [saving, setSaving] = useState(false);

  const valid = retailers.filter(r => r.Latitude && r.Longitude);
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

  function saveNewZone() {
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
    setSaving(true);

    fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "save_zones",
        zones: updated,
      }),
    }).finally(() => setSaving(false));

    setNewZone(null);
    setZoneName("");
    setZoneColor("#2563eb");
    setZoneAgent("");
  }

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
        whenCreated={map =>
          setTimeout(() => map.invalidateSize(), 100)
        }
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {valid.map((r, i) => (
          <Marker key={i} position={[+r.Latitude, +r.Longitude]}>
            <Popup>
              <strong>{r.Retailer_Name}</strong>
              <br />
              {r.Area}, {r.City}
            </Popup>
          </Marker>
        ))}

        <ZonesLayer
          zones={zones}
          retailers={retailers}
          onSelectZone={(z, c) => {
            setSelectedZone(z);
            setZoneCount(c);
          }}
        />

        {zonesMode && (
          <DrawControls
            enabled={zonesMode}
            onCreateZone={setNewZone}
          />
        )}
      </MapContainer>

      {/* ZONE INFO CARD */}
      {selectedZone && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            background: "#fff",
            padding: "14px 18px",
            borderRadius: 10,
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            minWidth: 240,
            zIndex: 9999,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            {selectedZone.name}
          </div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            Assigned Agent:{" "}
            <strong>
              {selectedZone.agent || "Unassigned"}
            </strong>
          </div>
          <div style={{ fontSize: 13 }}>
            Retailers in zone:{" "}
            <strong>{zoneCount}</strong>
          </div>
        </div>
      )}

      {/* CREATE ZONE MODAL */}
      {newZone && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              width: 340,
              borderRadius: 10,
            }}
          >
            <h3>Create Zone</h3>

            <input
              placeholder="Zone name"
              value={zoneName}
              onChange={e => setZoneName(e.target.value)}
              style={{ width: "100%", marginBottom: 10 }}
            />

            <select
              value={zoneAgent}
              onChange={e => setZoneAgent(e.target.value)}
              style={{ width: "100%", marginBottom: 10 }}
            >
              <option value="">Assign agent (optional)</option>
              {agents.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <input
              type="color"
              value={zoneColor}
              onChange={e => setZoneColor(e.target.value)}
            />

            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button
                onClick={() => setNewZone(null)}
                style={{ marginRight: 8 }}
              >
                Cancel
              </button>
              <button
                disabled={!zoneName}
                onClick={saveNewZone}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVING OVERLAY */}
      {saving && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 600,
            zIndex: 2000,
          }}
        >
          Saving zones…
        </div>
      )}
    </div>
  );
}
