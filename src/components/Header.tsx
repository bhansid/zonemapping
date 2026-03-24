import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div style={header}>
      <img
        src="/logo.png"
        alt="Logo"
        style={logo}
        onClick={() => navigate("/")}
      />
    </div>
  );
}

const header = {
  width: "100%",
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid #eee",
  background: "#fff",
  position: "sticky" as const,
  top: 0,
  zIndex: 999,
};

const logo = {
  height: 40,
  cursor: "pointer",
};