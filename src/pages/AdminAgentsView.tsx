import { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

export default function AdminAgentsView({ retailers }: any) {
  const [agents, setAgents] = useState<any[]>([]);
  const [kyc, setKyc] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`${API}?action=agents_full`)
      .then(r => r.json())
      .then(d => {
        setAgents(Array.isArray(d.data) ? d.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= SAFE STATS ================= */
  function getStats(agentName: string) {
    if (!Array.isArray(retailers)) return { total: 0, today: 0 };

    const total = retailers.filter(
      (r: any) => r?.Assigned_Agent === agentName
    );

    const today = total.filter((r: any) => {
      const val = r?.["Added On"];
      if (!val) return false;

      const d = new Date(val);
      if (isNaN(d.getTime())) return false;

      return d.toDateString() === new Date().toDateString();
    });

    return {
      total: total.length,
      today: today.length,
    };
  }

  /* ================= DRIVE IMAGE FIX ================= */
  function getDriveImage(url: string) {
    if (!url) return "";

    let match = url.match(/\/d\/(.*?)\//);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;

    match = url.match(/id=([^&]+)/);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;

    return url;
  }

  /* ================= SAFE SEARCH (CRASH FIX) ================= */
  const filteredAgents = agents.filter((a: any) => {
    const s = (search || "").toLowerCase();

    const name = String(a?.Agent_Name || "").toLowerCase();
    const phone = String(a?.Phone || "");
    const id = String(a?.Agent_ID || "").toLowerCase();

    return (
      name.includes(s) ||
      phone.includes(s) ||
      id.includes(s)
    );
  });

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div style={overlay}>
        <div style={loader}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Agents</h2>

      {/* SEARCH */}
      <input
        placeholder="Search agent by name, phone or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchBox}
      />

      {/* LIST */}
      {filteredAgents.map((a: any, i: number) => {
        if (!a) return null;

        const stats = getStats(a.Agent_Name);

        return (
          <div key={String(a?.Agent_ID || i)} style={rowCard}>
            {/* PROFILE IMAGE */}
            <img
              src={getDriveImage(a?.Selfie || "")}
              style={avatar}
              onClick={() =>
                setPreviewImage(getDriveImage(a?.Selfie || ""))
              }
              onError={(e: any) => {
                e.target.src =
                  "https://via.placeholder.com/40?text=👤";
              }}
            />

            {/* NAME */}
            <div style={name}>
              {String(a?.Agent_Name || "-")}
            </div>

            {/* STATS */}
            <div style={stat}>Total: {stats.total}</div>
            <div style={stat}>Today: {stats.today}</div>

            {/* KYC */}
            <button onClick={() => setKyc(a)} style={kycBtn}>
              KYC Documents
            </button>
          </div>
        );
      })}

      {/* EMPTY */}
      {filteredAgents.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          No agents found
        </div>
      )}

      {/* ================= KYC MODAL ================= */}
      {kyc && (
        <div style={overlay}>
          <div style={modal}>
            <h3>KYC Documents</h3>

            <button onClick={() => window.open(kyc.ID_Image)}>
              Open ID Image
            </button>

            <button onClick={() => window.open(kyc.Selfie)}>
              Open Selfie
            </button>

            <button onClick={() => window.open(kyc.Signature)}>
              Open Signature
            </button>

            <button onClick={() => setKyc(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ================= IMAGE PREVIEW ================= */}
      {previewImage && (
        <div style={overlay}>
          <div style={imageModal}>
            <button
              onClick={() => setPreviewImage(null)}
              style={closeBtn}
            >
              ✖
            </button>

            <img
              src={previewImage}
              style={{ maxWidth: "90vw", maxHeight: "80vh" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const searchBox = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const rowCard = {
  display: "grid",
  gridTemplateColumns: "50px 1fr 100px 100px 140px",
  alignItems: "center",
  gap: 10,
  border: "1px solid #e5e7eb",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};

const avatar = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  objectFit: "cover" as const,
  cursor: "pointer",
};

const name = {
  fontWeight: 600,
};

const stat = {
  fontSize: 13,
};

const kycBtn = {
  padding: 8,
  background: "#111",
  color: "#fff",
  borderRadius: 6,
  cursor: "pointer",
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const imageModal = {
  position: "relative" as const,
};

const closeBtn = {
  position: "absolute" as const,
  top: -10,
  right: -10,
  background: "#fff",
  borderRadius: "50%",
  padding: "6px 10px",
  cursor: "pointer",
};

const loader = {
  width: 40,
  height: 40,
  border: "4px solid #ddd",
  borderTop: "4px solid #111",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};