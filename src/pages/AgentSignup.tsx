import { useRef, useState } from "react";
import Header from "../components/Header";

const API = "https://script.google.com/macros/s/AKfycbwcSAM75mzot0MPQT3Fu2qnryIcMY4ZacYF34yjrBIIwMHoaZ-qhtDa61eMTjynhI5axA/exec";

export default function AgentSignup() {
  const [form, setForm] = useState<any>({
    name: "",
    phone: "",
    id_number: "",
    agreement: false,
  });

  const [idImage, setIdImage] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState("");
  const [selfiePreview, setSelfiePreview] = useState("");

  const [signature, setSignature] = useState("");
  const [signModal, setSignModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const idUploadRef = useRef<HTMLInputElement>(null);
  const idCameraRef = useRef<HTMLInputElement>(null);
  const selfieUploadRef = useRef<HTMLInputElement>(null);
  const selfieCameraRef = useRef<HTMLInputElement>(null);

  const today = new Date().toLocaleDateString();

  function update(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function toBase64(file: File) {
    return new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
  }

  async function submit() {
    if (!form.agreement) return alert("Accept agreement");
    if (!signature) return alert("Signature required");

    setLoading(true);

    await fetch(API, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "save_agent",
        ...form,
        id_image: idImage ? await toBase64(idImage) : "",
        selfie: selfie ? await toBase64(selfie) : "",
        signature,
      }),
    });

    setLoading(false);
    setSuccess(true);
  }

  return (
    <>
   
      <div style={wrap}>
        <h2>Agent Registration</h2>

        <input placeholder="Full Name" value={form.name}
          onChange={(e)=>update("name", e.target.value)} />

        <input placeholder="Phone Number" value={form.phone}
          onChange={(e)=>update("phone", e.target.value)} />

        <input placeholder="ID Number" value={form.id_number}
          onChange={(e)=>update("id_number", e.target.value)} />

        {/* FULL CONTRACT */}
        <div style={contractBox} onScroll={(e:any)=>{
          const el=e.target;
          if(el.scrollTop+el.clientHeight>=el.scrollHeight-10){
            setScrolledToBottom(true);
          }
        }}>
          <h3>LEGAL SALES AGENT AGREEMENT – {today}</h3>

          <p><b>1. Nature of Engagement:</b><br/>
          The Agent acknowledges that they are entering into this agreement as an independent contractor and not as an employee, partner, or representative in any formal employment capacity. This agreement does not establish any employer-employee relationship, and the Agent fully understands that they are operating independently at their own discretion and risk.</p>

          <p><b>2. Commission Structure and Payment Terms:</b><br/>
          The Agent agrees that compensation shall be strictly commission-based for an initial period of six (6) months. Payments shall be calculated based on verified sales recorded within the official system and disbursed daily via M-Pesa. No fixed salary, retainer, or guaranteed earnings shall be provided under any circumstances.</p>

          <p><b>3. No Salary, Benefits or Reimbursements:</b><br/>
          The Agent acknowledges that they are not entitled to any salary, allowances, insurance, transport reimbursement, communication costs, or any employment-related benefits. All expenses incurred while performing duties shall be borne entirely by the Agent.</p>

          <p><b>4. Performance Monitoring and Enforcement:</b><br/>
          The Agent understands that all activities are digitally monitored through the application. Failure to meet expected daily or weekly performance benchmarks may result in immediate warnings, temporary suspension, or permanent deactivation without prior notice.</p>

          <p><b>5. Termination Clause:</b><br/>
          The Company reserves the absolute and unilateral right to terminate this agreement at any time due to underperformance, misconduct, or breach of operational standards. Upon termination, the Agent shall only be entitled to commissions that have already been earned and recorded.</p>

          <p><b>6. Liability and Responsibility:</b><br/>
          The Agent assumes full responsibility for all company assets, inventory, or materials provided. Any loss, damage, or misuse shall be recoverable from the Agent and may result in immediate termination and legal action if necessary.</p>

          <p><b>7. Anti-Fraud and Ethical Conduct:</b><br/>
          The Agent is strictly prohibited from engaging in fraudulent activities including overcharging customers, misrepresentation, accepting unauthorized payments, or soliciting bribes. Any such actions will result in immediate blacklisting and forfeiture of all dues.</p>

          <p><b>8. Data Protection and Consent:</b><br/>
          The Agent consents to the collection, storage, and processing of their personal information in accordance with the Kenya Data Protection Act. This includes identity verification, payment processing, and operational monitoring.</p>

          <p><b>Declaration:</b><br/>
          By proceeding, the Agent confirms that they have read, understood, and voluntarily agreed to all terms outlined above and accept full responsibility for their actions under this agreement.</p>

          <b>Scroll to bottom to enable agreement</b>
        </div>

        <label style={{opacity:scrolledToBottom?1:0.5}}>
          <input type="checkbox"
            disabled={!scrolledToBottom}
            checked={form.agreement}
            onChange={(e)=>update("agreement", e.target.checked)} />
          I AGREE
        </label>

        {/* ID */}
        <label>ID Upload</label>
        <div style={row}>
          <button onClick={()=>idUploadRef.current?.click()}>Upload</button>
          <button onClick={()=>idCameraRef.current?.click()}>Click</button>
        </div>

        <input ref={idUploadRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{
            const f=e.target.files?.[0];
            if(f){setIdImage(f);setIdPreview(URL.createObjectURL(f));}
          }} />

        <input ref={idCameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
          onChange={e=>{
            const f=e.target.files?.[0];
            if(f){setIdImage(f);setIdPreview(URL.createObjectURL(f));}
          }} />

        {idPreview && <img src={idPreview} style={{width:120}} />}

        {/* SELFIE */}
        <label>Selfie</label>
        <div style={row}>
          <button onClick={()=>selfieUploadRef.current?.click()}>Upload</button>
          <button onClick={()=>selfieCameraRef.current?.click()}>Click</button>
        </div>

        <input ref={selfieUploadRef} type="file" accept="image/*" style={{display:"none"}}
          onChange={e=>{
            const f=e.target.files?.[0];
            if(f){setSelfie(f);setSelfiePreview(URL.createObjectURL(f));}
          }} />

        <input ref={selfieCameraRef} type="file" accept="image/*" capture="user" style={{display:"none"}}
          onChange={e=>{
            const f=e.target.files?.[0];
            if(f){setSelfie(f);setSelfiePreview(URL.createObjectURL(f));}
          }} />

        {selfiePreview && <img src={selfiePreview} style={{width:120}} />}

        {/* SIGN */}
        <button onClick={()=>setSignModal(true)}>Sign Now</button>
        {signature && <img src={signature} style={{width:150}} />}

        <button onClick={submit}>Submit</button>
      </div>

      {/* FULLSCREEN LOADER */}
      {loading && (
        <div style={overlay}>
          <div>Signing legal bond...</div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {success && (
        <div style={overlay}>
          <div style={successBox}>
            <h2>✅ Agreement Signed</h2>
            <button onClick={()=>window.location.href="/collect"}>
              Open Form
            </button>
          </div>
        </div>
      )}

     {signModal && (
  <SignatureModal
    onClose={() => setSignModal(false)}
    onSave={(data: string) => {
      setSignature(data);
      setSignModal(false); // ✅ CLOSE MODAL AFTER SAVE
    }}
  />
)}
    </>
  );
}

/* SIGNATURE MODAL */
function SignatureModal({ onClose, onSave }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function start(e: any) {
    drawing.current = true;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();

    const rect = canvasRef.current!.getBoundingClientRect();

    const x =
      (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y =
      (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.moveTo(x, y);
  }

  function move(e: any) {
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

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ✅ Prevent empty signature
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;

    if (canvas.toDataURL() === blank.toDataURL()) {
      alert("Please sign first");
      return;
    }

    const data = canvas.toDataURL("image/png");
    onSave(data); // parent will close modal
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div style={overlay}>
      <div style={modalBox}>
        <h3>Signature</h3>

        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            touchAction: "none",
          }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={clear}>Clear</button>
          <button onClick={save}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */
const wrap={maxWidth:420,margin:"0 auto",padding:16,display:"flex",flexDirection:"column",gap:12};
const contractBox={maxHeight:260,overflowY:"auto",background:"#f3f4f6",padding:12};
const row={display:"flex",gap:10};
const overlay={position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,color:"#fff"};
const successBox={background:"#16a34a",padding:20,borderRadius:10,color:"#fff"};
const modalBox={background:"#fff",padding:20};