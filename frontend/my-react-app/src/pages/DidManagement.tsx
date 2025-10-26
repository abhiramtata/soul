import React, { useMemo, useState } from "react";
import { api } from "../lib/api";
import CopyButton from "../components/CopyButton";

const help = { color: "#9aa4b2", fontSize: 13 };

export default function DidManagement() {
  const card: React.CSSProperties = { background: "#131722", border: "1px solid #232a3a", borderRadius: 14, padding: 16, flex: "1 1 420px" };
  const input = { background: "#0f1420", border: "1px solid #273046", color: "#e6edf3", padding: 10, borderRadius: 10, width: "100%" };

  const [err, setErr] = useState<string | null>(null);

  // Step outputs
  const [didRes, setDidRes] = useState<any>(null);
  const [schemaRes, setSchemaRes] = useState<any>(null);
  const [credDefRes, setCredDefRes] = useState<any>(null);

  // Step 1 inputs
  const [method, setMethod] = useState("indy");
  const [namespace, setNamespace] = useState("bcovrin:test");
  const [seed, setSeed] = useState("wo000000000000000000000000000000"); // 32 chars
  const [did, setDid] = useState("NE4nswJEi6zT3yApJbXcqh");           // short DID

  const computedIssuerDid = useMemo(() => (did ? `did:${method}:${namespace}:${did}` : ""), [did, method, namespace]);
  const [issuerId, setIssuerId] = useState("");

  // Step 2 output (Schema ID)
  const [schemaId, setSchemaId] = useState("");

  // Step 3 output (Cred Def ID)
  const [credDefId, setCredDefId] = useState("");

  // Helpers to pull IDs from various backend shapes
  function pickSchemaId(data: any): string {
    return data?.schemaState?.schemaId || data?.schemaId || data?.id || "";
  }
  function pickCredDefId(data: any): string {
    return (
      data?.credentialDefinitionState?.credentialDefinitionId ||
      data?.credentialDefinitionId ||
      data?.claimDefId ||
      data?.id ||
      ""
    );
  }

  // STEP 1
  const genDid = async () => {
    setErr(null);
    try {
      if (seed.length !== 32) throw new Error("Seed must be exactly 32 characters.");
      // Call backend (so keys are registered/imported)
      const r = await api.didGenerate({ method, namespace, did, seed });
      const data = (r as any).data || r;

      // Our canonical Issuer DID (works even if backend response is minimal)
      const issuer = computedIssuerDid || data?.ledgerDid || data?.did || data?.issuerId || "";
      setDidRes(data);
      setIssuerId(issuer);
    } catch (e: any) {
      setErr(`Step 1 failed: ${e.message || String(e)}`);
    }
  };

  // STEP 2
  const regSchema = async () => {
    setErr(null);
    try {
      const useIssuer = issuerId || computedIssuerDid;
      if (!useIssuer) throw new Error("Issuer DID required. Complete Step 1.");
      const r = await api.registerSchema({ issuerId: useIssuer });
      const data = (r as any).data || r;
      const sid = pickSchemaId(data);
      if (!sid) throw new Error("Backend did not return schemaId.");
      setSchemaRes(data);
      setSchemaId(sid);
    } catch (e: any) {
      setErr(`Step 2 failed: ${e.message || String(e)}`);
    }
  };

  // STEP 3
  const regCredDef = async () => {
    setErr(null);
    try {
      const useIssuer = issuerId || computedIssuerDid;
      if (!useIssuer || !schemaId) throw new Error("Issuer DID and Schema ID are required.");
      const r = await api.registerCredDef({ issuerId: useIssuer, schemaId });
      const data = (r as any).data || r;
      const cid = pickCredDefId(data);
      if (!cid) throw new Error("Backend did not return credentialDefinitionId.");
      setCredDefRes(data);
      setCredDefId(cid);
    } catch (e: any) {
      setErr(`Step 3 failed: ${e.message || String(e)}`);
    }
  };

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {/* Step 1 */}
      <div style={card}>
        <h3>1) Generate / Import DID</h3>
        <div style={{ marginBottom: 12 }}><label style={help as any}>Method</label><input value={method} onChange={(e) => setMethod(e.target.value)} style={input as any} /></div>
        <div style={{ marginBottom: 12 }}><label style={help as any}>Namespace</label><input value={namespace} onChange={(e) => setNamespace(e.target.value)} style={input as any} /></div>
        <div style={{ marginBottom: 12 }}><label style={help as any}>DID (bcovrin)</label><input value={did} onChange={(e) => setDid(e.target.value)} style={input as any} /></div>
        <div style={{ marginBottom: 12 }}><label style={help as any}>Seed (32 chars)</label><input value={seed} onChange={(e) => setSeed(e.target.value)} style={input as any} /></div>

        <button onClick={genDid} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
          Produce Issuer DID
        </button>

        <div style={{ marginTop: 12 }}>
          <label style={help as any}>Issuer DID (output)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={issuerId || computedIssuerDid} onChange={(e) => setIssuerId(e.target.value)} style={input as any} placeholder="did:indy:bcovrin:test:<did>" />
            {(issuerId || computedIssuerDid) && <CopyButton text={issuerId || computedIssuerDid} label="Copy" />}
          </div>
        </div>

        {didRes && <Dump title="DID Result (backend)" data={didRes} />}
      </div>

      {/* Step 2 */}
      <div style={card}>
        <h3>2) Register Schema</h3>
        <div style={{ marginBottom: 12 }}><label style={help as any}>Issuer DID</label><input value={issuerId || computedIssuerDid} onChange={(e) => setIssuerId(e.target.value)} style={input as any} /></div>
        <button onClick={regSchema} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
          Register Schema
        </button>

        <div style={{ marginTop: 12 }}>
          <label style={help as any}>Schema ID (output)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={schemaId} onChange={(e) => setSchemaId(e.target.value)} style={input as any} placeholder="did:indy:.../annoncreds/v0/SCHEMA/CDB_Login/1.0" />
            {schemaId && <CopyButton text={schemaId} label="Copy" />}
          </div>
        </div>

        {schemaRes && <Dump title="Schema Result (backend)" data={schemaRes} />}
      </div>

      {/* Step 3 */}
      <div style={{ ...card, flexBasis: "100%" }}>
        <h3>3) Register Credential Definition</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={help as any}>Issuer DID</label><input value={issuerId || computedIssuerDid} onChange={(e) => setIssuerId(e.target.value)} style={input as any} /></div>
          <div><label style={help as any}>Schema ID</label><input value={schemaId} onChange={(e) => setSchemaId(e.target.value)} style={input as any} /></div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={regCredDef} style={{ background: "#21406a", border: "1px solid #30588f", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}>
            Register Cred Def
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={help as any}>Credential Definition ID (output)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={credDefId} onChange={(e) => setCredDefId(e.target.value)} style={input as any} placeholder="did:indy:.../annoncreds/v0/CLAIM_DEF/..." />
            {credDefId && <CopyButton text={credDefId} label="Copy" />}
          </div>
        </div>

        {credDefRes && <Dump title="Cred Def Result (backend)" data={credDefRes} />}
      </div>

      {err && <p style={{ ...help, color: "#ffb4b4" }}>{err}</p>}
    </div>
  );
}

function Dump({ title, data }: { title: string; data: any }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ background: "#0f1420", border: "1px solid #273046", padding: 12, borderRadius: 10, overflow: "auto" }}>
        <h4 style={{ marginTop: 0 }}>{title}</h4>
        <pre style={{ margin: 0 }}><code>{JSON.stringify(data, null, 2)}</code></pre>
      </div>
    </div>
  );
}
