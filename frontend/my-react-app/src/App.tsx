import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Connections from "./pages/Connections";
import DidManagement from "./pages/DidManagement";
import Issue from "./pages/Issue";
import Verification from "./pages/Verification";
import Records from "./pages/Records";

const S = {
  app: { display: "flex", height: "100vh", color: "#e6edf3", background: "#0b0d12", fontFamily: "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial" },
  sidebar: { width: 240, background: "#121621", borderRight: "1px solid #232a3a", padding: "16px 12px" },
  sideBtn: (active: boolean): React.CSSProperties => ({
    width: "100%", textAlign: "left", background: active ? "#21406a" : "transparent",
    color: active ? "#fff" : "#9aa4b2", border: "none", padding: "10px 8px",
    borderRadius: 8, marginBottom: 6, cursor: "pointer"
  }),
  main: { flex: 1, padding: 24, overflowY: "auto" as const },
  help: { color: "#9aa4b2", fontSize: 13 }
};

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const pages = ["Dashboard", "Connections", "DID Management", "Issue Credential", "Verification", "Records"] as const;

  const API_BASE = (typeof window !== "undefined" && (window as any).VITE_API_BASE_URL) || "http://localhost:3000";

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>SOUL App</h2>
        {pages.map((page) => (
          <button key={page} onClick={() => setTab(page)} style={S.sideBtn(tab === page)}>
            {page}
          </button>
        ))}
        <p style={{ ...(S.help as any), marginTop: 16 }}>
          API base: <code>{API_BASE}</code>
        </p>
      </div>
      <div style={S.main}>
        {tab === "Dashboard" && <Dashboard />}
        {tab === "Connections" && <Connections />}
        {tab === "DID Management" && <DidManagement />}
        {tab === "Issue Credential" && <Issue />}
        {tab === "Verification" && <Verification />}
        {tab === "Records" && <Records />}
      </div>
    </div>
  );
}
