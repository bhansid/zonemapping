import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={wrap}>
      <h1>Retailer Management</h1>

      <div style={grid}>
        <button style={btn} onClick={() => navigate("/collect")}>
          Map a Shop
        </button>

        <button style={btn} onClick={() => navigate("/agent-signup")}>
          Register Agent
        </button>

        <button style={btn} onClick={() => navigate("/admin")}>
          Admin Panel
        </button>
      </div>
    </div>
  );
}

const wrap = {
  maxWidth: 420,
  margin: "40px auto",
  padding: 20,
  textAlign: "center" as const,
};

const grid = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 14,
  marginTop: 20,
};

const btn = {
  padding: "14px 16px",
  fontSize: 16,
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};