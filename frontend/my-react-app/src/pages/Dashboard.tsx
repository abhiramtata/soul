import React, { useState } from "react";
import { api } from "../lib/api";

const help = { color: "#9aa4b2", fontSize: 13 };

function Badge({ ok, text }: { ok: boolean; text: string }) {
  const base: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #2a3446",
    background: ok ? "#143326" : "#1b2232",
    color: ok ? "#b6f3c9" : "#e6edf3",
  };
  return <span style={base}>{text}</span>;
}

export default function Dashboard() {
  const [acmeOk, setAcmeOk] = useState(false);
  const [bobOk, setBobOk] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const init = async (who: "acme" | "bob") => {
    setMsg(null);
    try {
      if (who === "acme") {
        await api.initAcme();
        setAcmeOk(true);
        setMsg("Acme initialized");
      } else {
        await api.initBob();
        setBobOk(true);
        setMsg("Bob initialized");
      }
    } catch (e: any) {
      // Many backends return 409 when already initialized → treat as success
      if (String(e.message || "").includes("409") || /already/i.test(e.message || "")) {
        if (who === "acme") setAcmeOk(true);
        else setBobOk(true);
        setMsg(`${who === "acme" ? "Acme" : "Bob"} already initialized (409)`);
      } else {
        setMsg(`Init ${who} failed: ${e.message || String(e)}`);
      }
    }
  };

  const card: React.CSSProperties = { background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16, flex: "1 1 320px" };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={card}>
        <h3>Agents</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div>Acme: <Badge ok={acmeOk} text={acmeOk ? "online" : "not initialized"} /></div>
          <div>Bob: <Badge ok={bobOk} text={bobOk ? "online" : "not initialized"} /></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => init("acme")} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
            Initialize Acme
          </button>
          <button onClick={() => init("bob")} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
            Initialize Bob
          </button>
        </div>
        {msg && <p style={{ ...help, marginTop: 10 }}>{msg}</p>}
      </div>
    </div>
  );
}
