import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import JsonViewer from "../components/JsonViewer";

const help = { color: "#9aa4b2", fontSize: 13 };

export default function Issue() {
  const card: React.CSSProperties = { background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16, flex: "1 1 320px" };
  const input = { background: "#0f1420", border: "1px solid #273046", color: "#e6edf3", padding: 10, borderRadius: 10, width: "100%" };

  const [connections, setConnections] = useState<any[]>([]);
  const [connectionId, setConnectionId] = useState("");
  const [credDefId, setCredDefId] = useState("");
  const [protocolVersion, setProtocolVersion] = useState<"v1" | "v2">("v2");
  const [attributes, setAttributes] = useState([
    { name: "Name", value: "" },
    { name: "Email ID", value: "" },
    { name: "Organisation Name", value: "" },
    { name: "Organisation ID", value: "" },
    { name: "Role", value: "" },
  ]);

  const [offerRes, setOfferRes] = useState<any>(null);
  const [bobCreds, setBobCreds] = useState<any[]>([]);
  const [accepted, setAccepted] = useState<any>(null); // Only shows JSON after accept

  useEffect(() => { (async () => {
    const a = await api.connections("acme");
    setConnections((a as any).data || a);
  })(); }, []);

  const addAttr = () => setAttributes((prev) => [...prev, { name: "", value: "" }]);
  const updateAttr = (i: number, k: "name" | "value", v: string) => setAttributes((prev) => prev.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const offer = async () => {
    const payload = { protocolVersion, connectionId, credentialDefinitionId: credDefId, attributes };
    const r = await api.offerCred(payload);
    setOfferRes((r as any).data || r);
  };

  const refreshBob = async () => { const r = await api.creds("bob"); setBobCreds((r as any).data || r); };
  const accept = async (credentialRecordId: string) => { const r = await api.acceptCred(credentialRecordId); setAccepted((r as any).data || r); };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={card}>
        <h3>Offer Credential (Acme → Bob)</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={help as any}>Connection</label>
          <select value={connectionId} onChange={(e) => setConnectionId(e.target.value)} style={input as any}>
            <option value="">Select connection…</option>
            {connections.map((c) => <option key={c.id} value={c.id}>{c.theirLabel || c.id}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}><label style={help as any}>Credential Definition ID</label><input value={credDefId} onChange={(e) => setCredDefId(e.target.value)} style={input as any} /></div>
        <div style={{ marginBottom: 12 }}>
          <label style={help as any}>Protocol</label>
          <select value={protocolVersion} onChange={(e) => setProtocolVersion(e.target.value as any)} style={input as any}>
            <option value="v1">v1</option><option value="v2">v2</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={help as any}>Attributes</label>
          {attributes.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input placeholder="name" value={row.name} onChange={(e) => updateAttr(i, "name", e.target.value)} style={input as any} />
              <input placeholder="value" value={row.value} onChange={(e) => updateAttr(i, "value", e.target.value)} style={input as any} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={addAttr} style={{ background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>Add attribute</button>
          </div>
        </div>
        <button onClick={offer} disabled={!connectionId || !credDefId} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>Offer Credential</button>
        {offerRes && <p style={help as any}>Offer state: <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #5a4b1a", background: "#2b2410", color: "#f8e6b0" }}>{offerRes.state}</span> · recordId: <code>{offerRes.credentialRecordId}</code></p>}
      </div>

      <div style={card}>
        <h3>Bob – Pending Credentials</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={refreshBob} style={{ background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>Refresh</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Record ID</th><th>State</th><th>Action</th></tr></thead>
          <tbody>
            {bobCreds.map((c: any) => (
              <tr key={c.id}>
                <td style={{ fontFamily: "ui-monospace" }}>{c.id}</td>
                <td><span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #5a4b1a", background: "#2b2410", color: "#f8e6b0" }}>{c.state}</span></td>
                <td>{c.state === "offer-received" && <button onClick={() => accept(c.id)} style={{ background: "#1e3a2f", border: "1px solid #195a3c", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>Accept</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ flex: "1 1 320px" }}>
        {accepted && <JsonViewer title="Issued Verifiable Credential (record)" data={accepted} filename="credential.json" />}
      </div>
    </div>
  );
}
