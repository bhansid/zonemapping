import { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

export default function Collect() {
  const [agents, setAgents] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);

  const [status, setStatus] =
    useState<"idle" | "saving" | "success">("idle");

  const [locationError, setLocationError] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

  const [form, setForm] = useState<any>({
    Retailer_Name: "",
    Owner_Name: "",
    Phone: "",
    Shop_Type: "",
    Shop_Type_Other: "",
    Area: "",
    City: "",
    State: "",
    Pincode: "",
    Latitude: "",
    Longitude: "",
    Assigned_Agent: "",
    Shop_Status: "",
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

  function getLocation(): Promise<{ lat: string; lng: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported on this device.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            lat: pos.coords.latitude.toString(),
            lng: pos.coords.longitude.toString(),
          });
        },
        err => {
          if (err.code === 1) reject("Location permission denied.");
          else if (err.code === 2) reject("Location unavailable.");
          else reject("Unable to fetch location.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function fetchLocationAndContinue() {
    try {
      const { lat, lng } = await getLocation();
      update("Latitude", lat);
      update("Longitude", lng);
      setLocationError(null);

      if (pendingSave) {
        setPendingSave(false);
        await proceedSave(lat, lng);
      }
    } catch (err: any) {
      setLocationError(err);
    }
  }

  async function toBase64(file: File) {
    return new Promise<string>(res => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
  }

  async function proceedSave(lat: string, lng: string) {
    const imgs = await Promise.all(
      [image1, image2]
        .filter(Boolean)
        .map((f: any) => toBase64(f))
    );

    await fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        ...form,
        Latitude: lat,
        Longitude: lng,
        images: imgs,
      }),
    });

    setStatus("success");

    setTimeout(() => {
      setStatus("idle");
      setImage1(null);
      setImage2(null);

      setForm({
        Retailer_Name: "",
        Owner_Name: "",
        Phone: "",
        Shop_Type: "",
        Shop_Type_Other: "",
        Area: "",
        City: "",
        State: "",
        Pincode: "",
        Latitude: "",
        Longitude: "",
        Assigned_Agent: "",
        Shop_Status: "",
        Remarks: "",
      });
    }, 1500);
  }

  async function submit() {
    if (!image1 && !image2) {
      alert("Please upload at least one shop image before submitting.");
      return;
    }

    setStatus("saving");

    try {
      const { lat, lng } = await getLocation();
      await proceedSave(lat, lng);
    } catch (err: any) {
      setStatus("idle");
      setLocationError(err);
      setPendingSave(true);
    }
  }

  return (
    <>
      {loadingAgents && (
        <div style={overlay}>Loading Agents…</div>
      )}

      <div style={formWrap}>
        <h2>City Mapping</h2>

        <select
          disabled={loadingAgents}
          value={form.Assigned_Agent}
          onChange={e => update("Assigned_Agent", e.target.value)}
        >
          <option value="">Select Agent</option>
          {agents.map(a => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <input
          placeholder="Shop name"
          value={form.Retailer_Name}
          disabled={loadingAgents}
          onChange={e => update("Retailer_Name", e.target.value)}
        />

        <input
          placeholder="Owner name"
          value={form.Owner_Name}
          disabled={loadingAgents}
          onChange={e => update("Owner_Name", e.target.value)}
        />

        <input
          placeholder="Owner number"
          value={form.Phone}
          disabled={loadingAgents}
          onChange={e => update("Phone", e.target.value)}
        />

        <input
          placeholder="Address"
          value={form.Area}
          disabled={loadingAgents}
          onChange={e => update("Area", e.target.value)}
        />

        <select
          value={form.Shop_Type}
          disabled={loadingAgents}
          onChange={e => update("Shop_Type", e.target.value)}
        >
          <option value="">Select Shop Type</option>
          <option>Mobile and accessories</option>
          <option>Electronics</option>
          <option>Mpesa agent</option>
          <option>General store</option>
          <option>Kiosk</option>
          <option>Other</option>
        </select>

        {form.Shop_Type === "Other" && (
          <input
            placeholder="Define shop type"
            value={form.Shop_Type_Other}
            disabled={loadingAgents}
            onChange={e => update("Shop_Type_Other", e.target.value)}
          />
        )}

        <select
          value={form.Shop_Status}
          disabled={loadingAgents}
          onChange={e => update("Shop_Status", e.target.value)}
        >
          <option value="">Shop Status</option>
          <option>Existing Client</option>
          <option>Potential Lead</option>
        </select>

        {form.Latitude && (
          <div>Lat: {form.Latitude}, Lng: {form.Longitude}</div>
        )}

        <label>Upload shop pictures</label>

        <div style={imageRow}>
          <div style={{ width: "100%" }}>
            <input
              style={{ width: "100%" }}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={loadingAgents}
              onChange={e => setImage1(e.target.files?.[0] || null)}
            />
          </div>

          <div style={{ width: "100%" }}>
            <input
              style={{ width: "100%" }}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={loadingAgents}
              onChange={e => setImage2(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {!image1 && !image2 && (
          <p style={{ color: "red", fontSize: 12 }}>
            At least one image is required
          </p>
        )}

        <button
          disabled={loadingAgents || status === "saving" || (!image1 && !image2)}
          onClick={submit}
        >
          Save Retailer
        </button>
      </div>

      {status === "saving" && (
        <div style={overlay}>Fetching location & Saving…</div>
      )}

      {status === "success" && (
        <div style={overlay}>✔ Saved</div>
      )}

      {locationError && (
        <div style={modal}>
          <div style={modalBox}>
            <h3>Location Required</h3>
            <p>{locationError}</p>

            <button onClick={fetchLocationAndContinue}>
              Retry Fetch Location
            </button>

            <button
              style={{ marginTop: 8 }}
              onClick={() => {
                setLocationError(null);
                setPendingSave(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
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

const imageRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  width: "100%",
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

const modal = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
};

const modalBox = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  width: 300,
  textAlign: "center" as const,
};