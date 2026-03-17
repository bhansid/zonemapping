import { useRef, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

export default function AgentSignup() {
  const [form, setForm] = useState<any>({
    name: "",
    phone: "",
    id_number: "",
    agreement: false,
  });

  const [idImage, setIdImage] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const [status, setStatus] =
    useState<"idle" | "saving" | "done">("idle");

  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const today = new Date().toLocaleDateString();

  function update(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  /* ================= SIGNATURE ================= */

  function startDraw(e: any) {
    drawing.current = true;
    draw(e);
  }

  function endDraw() {
    drawing.current = false;
  }

  function draw(e: any) {
    if (!drawing.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const x =
      (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y =
      (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getSignatureBase64() {
    return canvasRef.current?.toDataURL("image/png") || "";
  }

  /* ================= HELPERS ================= */

  async function toBase64(file: File) {
    return new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
  }

  async function submit() {
    if (!form.agreement) {
      alert("You must agree to the terms");
      return;
    }

    setStatus("saving");

    const payload = {
      action: "save_agent",
      ...form,
      id_image: idImage ? await toBase64(idImage) : "",
      selfie: selfie ? await toBase64(selfie) : "",
      signature: getSignatureBase64(),
    };

    await fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });

    setStatus("done");
  }

  return (
    <div style={wrap}>
      <h2>Agent Registration</h2>

      <input
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />

      <input
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
      />

      <input
        placeholder="ID Number"
        value={form.id_number}
        onChange={(e) => update("id_number", e.target.value)}
      />

      {/* CONTRACT */}
      <div
        style={contractBox}
        onScroll={(e: any) => {
          const el = e.target;
          if (
            el.scrollTop + el.clientHeight >=
            el.scrollHeight - 10
          ) {
            setScrolledToBottom(true);
          }
        }}
      >
        <h3>Sales Agent Contract, {today}</h3>

        <p>
          This short-form version is designed for mobile readability while maintaining strict legal intent.
        </p>

        <h4>M-Life Kenya: Terms of Partnership</h4>

        <p><b>1. Performance & Daily Pay:</b><br/>
        100% commission-only role for first 6 months. Paid daily via M-Pesa based on app records.</p>

        <p><b>2. Independent Status:</b><br/>
        No salary, no reimbursements. All operational costs are your responsibility.</p>

        <p><b>3. Strict Monitoring:</b><br/>
        Activity tracked via app. Failure to meet targets leads to immediate deactivation.</p>

        <p><b>4. Voluntary Agreement & Liability:</b><br/>
        You join voluntarily and waive claims for salary or benefits. Responsible for stock and company property.</p>

        <p><b>5. One-Sided Termination:</b><br/>
        Company may terminate anytime. Only earned commission payable.</p>

        <p><b>6. Anti-Fraud Clause:</b><br/>
        No extra charges, no bribes. Violation leads to blacklisting.</p>

        <p><b>7. Data Privacy (ODPC):</b><br/>
        You consent to M-Life Kenya processing your personal data under the Data Protection Act.</p>

        <p><b>Declaration of Intent:</b><br/>
        I confirm I have read and understood all terms and choose to join as an Independent Contractor.</p>

        <p style={{ fontWeight: 600 }}>
          Scroll to bottom to enable agreement
        </p>
      </div>

      <label style={{ opacity: scrolledToBottom ? 1 : 0.5 }}>
        <input
          type="checkbox"
          disabled={!scrolledToBottom}
          checked={form.agreement}
          onChange={(e) =>
            update("agreement", e.target.checked)
          }
        />
        I AGREE to the terms
      </label>

      {/* FILES */}
      <label>Upload ID</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) =>
          setIdImage(e.target.files?.[0] || null)
        }
      />

      <label>Selfie</label>
      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) =>
          setSelfie(e.target.files?.[0] || null)
        }
      />

      {/* SIGNATURE */}
      <label>Signature</label>
      <canvas
        ref={canvasRef}
        width={300}
        height={120}
        style={canvasStyle}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      <button onClick={clearSignature}>
        Clear Signature
      </button>

      <button
        onClick={submit}
        disabled={status === "saving"}
      >
        Submit
      </button>

      {status === "saving" && <p>Submitting...</p>}
      {status === "done" && (
        <p>✅ Registered Successfully</p>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const wrap = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 16,
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};

const contractBox = {
  maxHeight: 240,
  overflowY: "auto" as const,
  background: "#f9fafb",
  padding: 12,
  borderRadius: 8,
  fontSize: 13,
};

const canvasStyle = {
  border: "1px solid #ccc",
  borderRadius: 6,
};