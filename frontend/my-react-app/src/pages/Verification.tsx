import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import JsonViewer from "../components/JsonViewer";

const help = { color: "#9aa4b2", fontSize: 13 };

export default function Verification() {
  const card: React.CSSProperties = { background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16, flex: "1 1 320px" };
  const input = { background: "#0f1420", border: "1px solid #273046", color: "#e6edf3", padding: 10, borderRadius: 10, width: "100%" };

  const [connections, setConnections] = useState<any[]>([]);
  const [connectionId, setConnectionId] = useState("");
  const [credDefId, setCredDefId] = useState("");

  const [proofReq, setProofReq] = useState<any>(null);
  const [bobProofs, setBobProofs] = useState<any[]>([]);
  const [presented, setPresented] = useState<any>(null);
  const [verified, setVerified] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const a = await api.connections("acme");
      setConnections((a as any).data || a);
    })();
  }, []);

  const request = async () => {
    const r = await api.requestProof({ connectionId, credentialDefId: credDefId });
    setProofReq((r as any).data || r);
  };
  const refreshBob = async () => {
    const r = await api.proofRecords("bob");
    setBobProofs((r as any).data || r);
  };
  const present = async (id: string) => {
    const r = await api.acceptPresent(id);
    setPresented((r as any).data || r);
  };
  const verifyNow = async (id: string) => {
    const r = await api.verify(id);
    setVerified((r as any).data || r);
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={card}>
        <h3>Request Proof (Acme)</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={help as any}>Connection</label>
          <select value={connectionId} onChange={(e) => setConnectionId(e.target.value)} style={input as any}>
            <option value="">Select connection…</option>
            {connections.map((c) => <option key={c.id} value={c.id}>{c.theirLabel || c.id}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={help as any}>Credential Definition ID</label>
          <input value={credDefId} onChange={(e) => setCredDefId(e.target.value)} style={input as any} />
        </div>
        <button
          onClick={request}
          disabled={!connectionId || !credDefId}
          style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}
        >
          Request Proof
        </button>
        {proofReq && (
          <p style={help as any}>
            Proof record: <code>{proofReq.proofRecordId}</code> · state:{" "}
            <span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #5a4b1a", background: "#2b2410", color: "#f8e6b0" }}>
              {proofReq.state}
            </span>
          </p>
        )}
      </div>

      <div style={card}>
        <h3>Bob – Proof Requests</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={refreshBob} style={{ background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>Refresh</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Proof ID</th><th>State</th><th>Actions</th></tr></thead>
          <tbody>
            {bobProofs.map((p: any) => (
              <tr key={p.id}>
                <td style={{ fontFamily: "ui-monospace" }}>{p.id}</td>
                <td><span style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid #2a3446", background: "#1b2232" }}>{p.state}</span></td>
                <td>
                  {p.state === "request-received" && (
                    <button onClick={() => present(p.id)} style={{ background: "#1e3a2f", border: "1px solid #195a3c", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
                      Present
                    </button>
                  )}
                  {p.state === "presentation-sent" && (
                    <button onClick={() => verifyNow(p.id)} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ flex: "1 1 320px" }}>
        {presented && <JsonViewer title="Presented Proof" data={presented} filename="presentation.json" />}
        <div style={{ height: 12 }} />
        {verified && <JsonViewer title="Verification Result" data={verified} filename="verification.json" />}
      </div>
    </div>
  );
}
