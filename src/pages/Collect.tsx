import { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

export default function Collect() {
  const [agents, setAgents] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [images, setImages] = useState<File[]>([]);
  const [status, setStatus] =
    useState<"idle" | "saving" | "success">("idle");

  const [form, setForm] = useState<any>({
    Retailer_Name: "",
    Owner_Name: "",
    Phone: "",
    Area: "",
    City: "",
    State: "",
    Pincode: "",
    Latitude: "",
    Longitude: "",
    Assigned_Agent: "",
    Remarks: "",
  });

  useEffect(() => {
    fetch(`${API}?action=agents`)
      .then(r => r.json())
      .then(d => {
        setAgents(d.data || []);
        setLoadingAgents(false);
      });
  }, []);

  function update(k: string, v: string) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  function captureLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
      update("Latitude", pos.coords.latitude.toString());
      update("Longitude", pos.coords.longitude.toString());
    });
  }

  async function toBase64(file: File) {
    return new Promise<string>(res => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
  }

  async function submit() {
    setStatus("saving");
    const imgs = await Promise.all(images.map(toBase64));

    await fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ ...form, images: imgs }),
    });

    setStatus("success");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <>
      {loadingAgents && (
        <div style={overlay}>
          Loading Agents…
        </div>
      )}

      <div style={formWrap}>
        <h2>MLife City Mapping</h2>

        <select
          disabled={loadingAgents}
          onChange={e => update("Assigned_Agent", e.target.value)}
        >
          <option value="">Select Agent</option>
          {agents.map(a => (
            <option key={a}>{a}</option>
          ))}
        </select>

        {["Retailer_Name","Owner_Name","Phone","Area","City","State","Pincode"].map(f=>(
          <input
            key={f}
            placeholder={f}
            disabled={loadingAgents}
            onChange={e => update(f, e.target.value)}
          />
        ))}

        <button disabled={loadingAgents} onClick={captureLocation}>
          📍 Capture Location
        </button>

        {form.Latitude && (
          <div>Lat: {form.Latitude}, Lng: {form.Longitude}</div>
        )}

        <input
          type="file"
          multiple
          disabled={loadingAgents}
          onChange={e => setImages(Array.from(e.target.files || []))}
        />

        <button disabled={loadingAgents} onClick={submit}>
          Save Retailer
        </button>
      </div>

      {status === "saving" && (
        <div style={overlay}>Processing…</div>
      )}

      {status === "success" && (
        <div style={overlay}>✔ Saved</div>
      )}
    </>
  );
}

const formWrap = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 16,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(255,255,255,0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  fontWeight: 600,
  zIndex: 9999,
};
