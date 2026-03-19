import { useEffect, useState } from "react";
import AdminMapView from "./AdminMapView";
import AdminListView from "./AdminListView";
import AdminAgentsView from "./AdminAgentsView";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

type View = "map" | "list" | "zones" | "agents";

const ADMIN_PASSWORD = "ubonadmin";

export default function Admin() {
  const [view, setView] = useState<View>("map");
  const [retailers, setRetailers] = useState<any[]>([]);
  const [authed, setAuthed] = useState(
    sessionStorage.getItem("ubon_admin_auth") === "yes"
  );
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authed) return;

    fetch(`${API}?action=retailers`)
      .then(r => r.json())
      .then(d => setRetailers(d.data || []));
  }, [authed]);

  function login() {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("ubon_admin_auth", "yes");
      setAuthed(true);
    } else {
      alert("Wrong password");
    }
  }

  if (!authed) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 10,
            width: 320,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <h2 style={{ marginBottom: 12 }}>Admin Login</h2>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 12 }}
          />
          <button
            onClick={login}
            style={{
              width: "100%",
              padding: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: "#f3f4f6",
          borderRight: "1px solid #e5e7eb",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          UBON Admin
        </div>

        <button onClick={() => setView("map")} style={btn(view === "map")}>
          Map
        </button>
        <button onClick={() => setView("list")} style={btn(view === "list")}>
          List
        </button>
        <button onClick={() => setView("zones")} style={btn(view === "zones")}>
          Zones
        </button>
        <button onClick={() => setView("agents")} style={btn(view === "agents")}>
           Agents
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => {
            sessionStorage.removeItem("ubon_admin_auth");
            location.reload();
          }}
          style={{
            padding: 10,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, position: "relative" }}>
        {view === "map" && (
          <AdminMapView retailers={retailers} zonesMode={false} />
        )}
        {view === "zones" && (
          <AdminMapView retailers={retailers} zonesMode={true} />
        )}
        {view === "list" && (
          <AdminListView retailers={retailers} />
        )}
        {view === "agents" && (
  <AdminAgentsView retailers={retailers} />
)}
      </main>
    </div>
  );
}

function btn(active: boolean) {
  return {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: active ? "#e5e7eb" : "#fff",
    cursor: "pointer",
    textAlign: "left" as const,
    fontWeight: active ? 600 : 500,
  };
}
