import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Records() {
  const card: React.CSSProperties = { background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16 };
  const [agent, setAgent] = useState<"acme" | "bob">("acme");
  const [connections, setConnections] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);

  const load = async () => {
    const a = await api.connections(agent); setConnections((a as any).data || a);
    const c = await api.creds(agent); setCredentials((c as any).data || c);
    const p = await api.proofRecords(agent); setProofs((p as any).data || p);
  };
  useEffect(() => { load(); }, [agent]);

  const input = { background: "#0f1420", border: "1px solid #273046", color: "#e6edf3", padding: 10, borderRadius: 10 };
  const help = { color: "#9aa4b2", fontSize: 13 };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Records</h3>
        <div>
          <label style={{ ...(help as any), marginRight: 8 }}>Agent</label>
          <select value={agent} onChange={(e) => setAgent(e.target.value as any)} style={input as any}>
            <option value="acme">Acme</option>
            <option value="bob">Bob</option>
          </select>
          <button onClick={load} style={{ marginLeft: 8, background: "#1f2635", border: "1px solid #2a3446", color: "#e6edf3", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>Refresh</button>
        </div>
      </div>

      <h4>Connections</h4>
      <SimpleTable rows={connections} cols={["id", "theirLabel", "state", "updatedAt"]} />
      <h4>Credentials</h4>
      <SimpleTable rows={credentials} cols={["id", "connectionId", "state", "credentialDefinitionId", "updatedAt"]} />
      <h4>Proofs</h4>
      <SimpleTable rows={proofs} cols={["id", "connectionId", "state", "isVerified", "updatedAt"]} />
    </div>
  );
}

function SimpleTable({ rows, cols }: { rows: any[]; cols: string[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>{cols.map((c) => (<th key={c}>{c}</th>))}</tr>
      </thead>
      <tbody>
        {rows?.map((r: any, i: number) => (
          <tr key={r.id || i}>
            {cols.map((c) => (<td key={c}>{String(r[c] ?? "")}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
