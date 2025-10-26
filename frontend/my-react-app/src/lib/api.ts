// src/lib/api.ts
const API_BASE =
  (typeof window !== "undefined" && (window as any).VITE_API_BASE_URL) ||
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  "http://localhost:3000";

async function parseBody(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body = await parseBody(res);

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && ("message" in body || "error" in body))
        ? ((body as any).message || (body as any).error)
        : (typeof body === "string" && body.length ? body : `${res.status} ${res.statusText}`);
    throw new Error(msg);
  }

  return body as T;
}

export const api = {
  // Agents
  initAcme: () => request<any>("/acme-agent/initialize"),
  initBob: () => request<any>("/bob-agent/initialize"),

  // Connections
  createInvitation: () => request<any>("/connection/create-invitation", { method: "POST" }),
  // POST first (for long URLs), fallback GET
  async receiveInvitationFlexible(invitationUrl: string) {
    try {
      return await request<any>("/connection/receive-invitation-bob", {
        method: "POST",
        body: JSON.stringify({ invitationUrl }),
      });
    } catch {
      return await request<any>(
        `/connection/receive-invitation-bob?invitationUrl=${encodeURIComponent(invitationUrl)}`
      );
    }
  },
  // ✅ Add this helper to confirm final connection state
  connections: (agent: "acme" | "bob") =>
    request<any>(`/connection/connections?agent=${agent}`),

  // Ledger
  didGenerate: (payload: { method: string; namespace: string; did: string; seed: string }) =>
    request<any>("/ledger/did-generate", { method: "POST", body: JSON.stringify(payload) }),
  registerSchema: (payload: { issuerId: string }) =>
    request<any>("/ledger/schema", { method: "POST", body: JSON.stringify(payload) }),
  registerCredDef: (payload: { issuerId: string; schemaId: string }) =>
    request<any>("/ledger/credential-definition", { method: "POST", body: JSON.stringify(payload) }),

  // Issuance
  offerCred: (payload: {
    protocolVersion: "v1" | "v2";
    connectionId: string;
    credentialDefinitionId: string;
    attributes: Array<{ name: string; value: string }>;
  }) => request<any>("/issuance/offer-cred", { method: "POST", body: JSON.stringify(payload) }),
  acceptCred: (credentialRecordId: string) =>
    request<any>("/issuance/accept-cred", { method: "POST", body: JSON.stringify({ credentialRecordId }) }),
  creds: (agent: "acme" | "bob") => request<any>(`/issuance/credentials?agent=${agent}`),

  // Verification
  requestProof: (payload: { connectionId: string; credentialDefId: string }) =>
    request<any>("/verification/request-proof", { method: "POST", body: JSON.stringify(payload) }),
  acceptPresent: (proofRecordId: string) =>
    request<any>("/verification/accept-present-proof", { method: "POST", body: JSON.stringify({ proofRecordId }) }),
  verify: (proofRecordId: string) =>
    request<any>("/verification/verify-proof", { method: "POST", body: JSON.stringify({ proofRecordId }) }),
  proofRecords: (agent: "acme" | "bob") => request<any>(`/verification/all-proofrecords?agent=${agent}`),
};
