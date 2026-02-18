import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: "#f3f4f6",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          padding: 16,
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 18,
            marginBottom: 24,
          }}
        >
          UBON Admin
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button>Map</button>
          <button>List</button>
          <button>Zones</button>
          <button>Save Zones</button>
        </nav>

        <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.6 }}>
          Admin Panel
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          marginLeft: 240,
          width: "calc(100vw - 240px)",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
