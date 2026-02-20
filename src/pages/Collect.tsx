import { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

export default function Collect() {
  const [agents, setAgents] = useState<string[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [images, setImages] = useState<File[]>([]);
  const [status, setStatus] =
    useState<"idle" | "saving" | "success">("idle");

  const [locationError, setLocationError] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

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
          if (err.code === 1) {
            reject("Location permission denied.");
          } else if (err.code === 2) {
            reject("Location unavailable.");
          } else {
            reject("Unable to fetch location.");
          }
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
    const imgs = await Promise.all(images.map(toBase64));

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
      setImages([]);
      setForm({
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
    }, 1500);
  }

  async function submit() {
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
        <h2>MLife City Mapping</h2>

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

        {["Retailer_Name","Owner_Name","Phone","Area","City","State","Pincode"].map(f=>(
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            disabled={loadingAgents}
            onChange={e => update(f, e.target.value)}
          />
        ))}

        {form.Latitude && (
          <div>Lat: {form.Latitude}, Lng: {form.Longitude}</div>
        )}

        <input
          type="file"
          multiple
          disabled={loadingAgents}
          onChange={e => setImages(Array.from(e.target.files || []))}
        />

        <button disabled={loadingAgents || status==="saving"} onClick={submit}>
          Save Retailer
        </button>
      </div>

      {status === "saving" && (
        <div style={overlay}>Fetching location & Saving…</div>
      )}

      {status === "success" && (
        <div style={overlay}>✔ Saved</div>
      )}

      {/* LOCATION ERROR MODAL */}
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

// import { useEffect, useState } from "react";

// const API =
//   "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

// export default function Collect() {
//   const [agents, setAgents] = useState<string[]>([]);
//   const [loadingAgents, setLoadingAgents] = useState(true);

//   const [images, setImages] = useState<File[]>([]);
//   const [status, setStatus] =
//     useState<"idle" | "saving" | "success">("idle");

//   const [form, setForm] = useState<any>({
//     Retailer_Name: "",
//     Owner_Name: "",
//     Phone: "",
//     Area: "",
//     City: "",
//     State: "",
//     Pincode: "",
//     Latitude: "",
//     Longitude: "",
//     Assigned_Agent: "",
//     Remarks: "",
//   });

//   useEffect(() => {
//     fetch(`${API}?action=agents`)
//       .then(r => r.json())
//       .then(d => {
//         setAgents(d.data || []);
//         setLoadingAgents(false);
//       });
//   }, []);

//   function update(k: string, v: string) {
//     setForm((f: any) => ({ ...f, [k]: v }));
//   }

//   function captureLocation() {
//     navigator.geolocation.getCurrentPosition(pos => {
//       update("Latitude", pos.coords.latitude.toString());
//       update("Longitude", pos.coords.longitude.toString());
//     });
//   }

//   async function toBase64(file: File) {
//     return new Promise<string>(res => {
//       const r = new FileReader();
//       r.onload = () => res(r.result as string);
//       r.readAsDataURL(file);
//     });
//   }

//   async function submit() {
//     setStatus("saving");
//     const imgs = await Promise.all(images.map(toBase64));

//     await fetch(API, {
//       method: "POST",
//       mode: "no-cors",
//       body: JSON.stringify({ ...form, images: imgs }),
//     });

//     setStatus("success");
//     setTimeout(() => setStatus("idle"), 1500);
//   }

//   return (
//     <>
//       {loadingAgents && (
//         <div style={overlay}>
//           Loading Agents…
//         </div>
//       )}

//       <div style={formWrap}>
//         <h2>MLife City Mapping</h2>

//         <select
//           disabled={loadingAgents}
//           onChange={e => update("Assigned_Agent", e.target.value)}
//         >
//           <option value="">Select Agent</option>
//           {agents.map(a => (
//             <option key={a}>{a}</option>
//           ))}
//         </select>

//         {["Retailer_Name","Owner_Name","Phone","Area","City","State","Pincode"].map(f=>(
//           <input
//             key={f}
//             placeholder={f}
//             disabled={loadingAgents}
//             onChange={e => update(f, e.target.value)}
//           />
//         ))}

//         <button disabled={loadingAgents} onClick={captureLocation}>
//           📍 Capture Location
//         </button>

//         {form.Latitude && (
//           <div>Lat: {form.Latitude}, Lng: {form.Longitude}</div>
//         )}

//         <input
//           type="file"
//           multiple
//           disabled={loadingAgents}
//           onChange={e => setImages(Array.from(e.target.files || []))}
//         />

//         <button disabled={loadingAgents} onClick={submit}>
//           Save Retailer
//         </button>
//       </div>

//       {status === "saving" && (
//         <div style={overlay}>Processing…</div>
//       )}

//       {status === "success" && (
//         <div style={overlay}>✔ Saved</div>
//       )}
//     </>
//   );
// }

// const formWrap = {
//   maxWidth: 420,
//   margin: "0 auto",
//   padding: 16,
//   display: "flex",
//   flexDirection: "column" as const,
//   gap: 10,
// };

// const overlay = {
//   position: "fixed" as const,
//   inset: 0,
//   background: "rgba(255,255,255,0.9)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: 22,
//   fontWeight: 600,
//   zIndex: 9999,
// };
