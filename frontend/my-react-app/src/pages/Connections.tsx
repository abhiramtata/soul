// src/pages/Connections.tsx
import React, { useState } from "react";
import { api } from "../lib/api";
import CopyButton from "../components/CopyButton";

const help = { color: "#9aa4b2", fontSize: 13 };

type Status = { type: "success" | "error" | "info"; text: string } | null;

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 10,
    marginTop: 12,
    border: "1px solid",
  };
  const styles: Record<NonNullable<Status>["type"], React.CSSProperties> = {
    success: { ...base, background: "#143326", borderColor: "#185c3f", color: "#b6f3c9" },
    error: { ...base, background: "#3a1a1a", borderColor: "#6a2b2b", color: "#ffb4b4" },
    info: { ...base, background: "#1b2232", borderColor: "#2a3446", color: "#e6edf3" },
  };
  return <div style={styles[status.type]}>{status.text}</div>;
}

function validateInvite(u: string): string | null {
  if (!u) return "Please paste the full invitation URL.";
  if (!/^https?:\/\//i.test(u)) return "Invitation must be a full URL (starts with http/https).";
  if (!/[?&](oob|c_i)=/i.test(u)) return "URL must contain an 'oob=' (or 'c_i=') parameter.";
  return null;
}

export default function Connections() {
  const [oob, setOob] = useState<any>(null);
  const [invUrl, setInvUrl] = useState("");
  const [receiveRes, setReceiveRes] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const card: React.CSSProperties = { background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16, flex: "1 1 520px" };
  const input = { background: "#0f1420", border: "1px solid #273046", color: "#e6edf3", padding: 10, borderRadius: 10, width: "100%" };

  const create = async () => {
    setStatus(null);
    setReceiveRes(null);
    setBusy(true);
    try {
      const r = await api.createInvitation();
      const data = (r as any).data || r;
      setOob(data);
      setStatus({ type: "info", text: "Invitation created. Copy the URL and paste it below." });
    } catch (e: any) {
      setStatus({ type: "error", text: `Create invitation failed: ${e.message || String(e)}` });
    } finally {
      setBusy(false);
    }
  };

  const receive = async () => {
    setReceiveRes(null);
    const url = invUrl.trim();

    const v = validateInvite(url);
    setStatus(v ? { type: "error", text: v } : { type: "info", text: "Processing invitation…" });

    setBusy(true);
    try {
      const r = await api.receiveInvitationFlexible(url);
      const data = (r as any).data || r;
      setReceiveRes(data);

      // Heuristic: many stacks return a `state` (e.g., 'completed', 'done', 'response-sent', etc.)
      const state = (data && (data.state || data.status || data.connection?.state)) || "";
      const connId = data?.connectionId || data?.id || data?.connection?.id;

      // Try to confirm on Bob’s agent
      let established = /complete|active|done/i.test(state);
      try {
        const list = await api.connections("bob");
        const items = (list as any).data || list || [];
        const found = Array.isArray(items)
          ? items.find((c: any) => c.id === connId || /complete|active/i.test(c?.state || ""))
          : null;
        if (found) established = /complete|active/i.test(found.state || "") || !!found.id;
      } catch {
        // ignore listing errors
      }

      if (established) {
        setStatus({
          type: "success",
          text: `Connection established${connId ? ` (id: ${connId})` : ""}.`,
        });
      } else {
        setStatus({
          type: "info",
          text: `Invitation received. Current state: ${state || "unknown"}. Wait for it to complete or try again.`,
        });
      }
    } catch (e: any) {
      setStatus({ type: "error", text: `Failed to receive invitation: ${e.message || String(e)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={card}>
        <h3>Create Invitation (Acme)</h3>
        <button disabled={busy} onClick={create} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
          {busy ? "Working..." : "Create Invitation"}
        </button>
        {oob?.invitationUrl && (
          <div style={{ marginTop: 12 }}>
            <div style={{ background: "#0f1420", border: "1px dashed #2c3650", borderRadius: 10, padding: 12, fontFamily: "ui-monospace, Menlo", wordBreak: "break-all" }}>
              <strong>invitationUrl</strong><br />{oob.invitationUrl}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}><CopyButton text={oob.invitationUrl} /></div>
          </div>
        )}
        <StatusBanner status={status} />
      </div>

      <div style={card}>
        <h3>Receive Invitation (Bob)</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={help as any}>Invitation URL</label>
          <textarea rows={5} value={invUrl} onChange={(e) => setInvUrl(e.target.value)} style={input as any} placeholder="Paste the full URL containing ?oob=..." />
        </div>
        <button disabled={busy} onClick={receive} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
          {busy ? "Working..." : "Receive & Accept"}
        </button>

        {receiveRes?.state && <p style={help as any}>State: {receiveRes.state}</p>}
        <StatusBanner status={status} />
      </div>
    </div>
  );
}
