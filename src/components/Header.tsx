import React from "react";

export default function Header() {
  return (
    <div style={header}>
      <img
        src="/logo.png" // place logo in public folder
        alt="Logo"
        style={logo}
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
};