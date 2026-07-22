// Local evaluation ledger used by the prototype.
//
// Events are appended to an in-memory integrity chain:
// signal detected → enriched → scored → policy-gated → decision → activation →
// human accept/reject → customer outcome → control counterfactual → skill lifecycle.
// This detects accidental mutation in a demo session. It is not a persistent,
// cryptographically signed, tenant-isolated production audit store.

export type LedgerKind =
  | "signal" // a change in financial state was detected
  | "enrich" // raw transactions classified into signal
  | "score" // opportunity scored / confidence assigned
  | "gate" // policy pack evaluated
  | "decision" // a recommendation was made / chosen / dismissed
  | "policy" // human-facing policy verdict recorded
  | "activation" // written to a bank system of record
  | "outcome" // measured customer outcome
  | "counterfactual" // held-out control comparison
  | "skill"; // skill authored / promoted / versioned

// Pipeline events are the machine trail; decision/activation/outcome are the "money" events.
export const PIPELINE_KINDS: readonly LedgerKind[] = ["signal", "enrich", "score", "gate"];
export const isPipelineKind = (k: LedgerKind): boolean => PIPELINE_KINDS.includes(k);

export type LedgerDraft = {
  eventKey?: string; // stable idempotency key supplied by the originating workflow
  kind: LedgerKind;
  title: string;
  detail: string;
  ref?: string; // household token or skill slug
  skill?: string; // owning skill slug, when applicable
  value?: number; // $ at stake, for portfolio rollups
  status?: "pending" | "confirmed" | "simulated";
};

export type LedgerEvent = LedgerDraft & {
  id: string;
  seq: number;
  ts: string;
  hash: string;
  prevHash: string;
};

// Deterministic 32-bit FNV-1a. This is an integrity checksum for local evaluation,
// not a cryptographic proof suitable for a regulated system of record.
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function canonicalEvent(prevHash: string, seq: number, ts: string, event: LedgerDraft): string {
  return JSON.stringify({
    prevHash,
    seq,
    ts,
    eventKey: event.eventKey ?? "",
    kind: event.kind,
    title: event.title,
    detail: event.detail,
    ref: event.ref ?? "",
    skill: event.skill ?? "",
    value: event.value ?? null,
    status: event.status ?? "",
  });
}

export function appendEvents(prev: LedgerEvent[], drafts: LedgerDraft[]): LedgerEvent[] {
  const out = prev.slice();
  let prevHash = prev.length ? prev[prev.length - 1].hash : "genesis0";
  const existingKeys = new Set(prev.map((event) => event.eventKey).filter(Boolean));
  drafts.forEach((d) => {
    if (d.eventKey && existingKeys.has(d.eventKey)) return;
    const seq = out.length + 1;
    const ts = new Date().toISOString();
    const hash = fnv1a(canonicalEvent(prevHash, seq, ts, d));
    out.push({ ...d, id: `le_${seq}_${hash.slice(0, 5)}`, seq, ts, hash, prevHash });
    if (d.eventKey) existingKeys.add(d.eventKey);
    prevHash = hash;
  });
  return out;
}

export function verifyChain(events: LedgerEvent[]): boolean {
  let prevHash = "genesis0";
  for (const e of events) {
    const expect = fnv1a(canonicalEvent(prevHash, e.seq, e.ts, e));
    if (expect !== e.hash || e.prevHash !== prevHash) return false;
    prevHash = e.hash;
  }
  return true;
}

export function ledgerRollup(events: LedgerEvent[]) {
  return {
    total: events.length,
    decisions: events.filter((e) => e.kind === "decision").length,
    activations: events.filter((e) => e.kind === "activation").length,
    measuring: events.filter((e) => e.kind === "outcome" && e.status === "pending").length,
    valueInMotion: events.filter((e) => e.kind === "activation").reduce((s, e) => s + (e.value ?? 0), 0),
  };
}
