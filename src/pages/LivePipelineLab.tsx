import { useState } from "react";
import { ArrowRight, Check, Cpu, Database, GitBranch, Loader2, Network, Radio, RotateCcw, ShieldCheck, ThumbsDown, ThumbsUp, Wand2, X } from "lucide-react";
import { Link } from "react-router-dom";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import {
  buildOpportunityFromPlaid,
  PLAID_FIXTURE_PRIMACY,
  PLAID_FIXTURE_ROLLOVER,
  type PlaidTransaction,
  type DetectedOpportunity,
} from "@/lib/plaid";
import { applyLoop, computeWeights, summarizeLearning, type Feedback, type SignalWeight } from "@/lib/loop";
import type { SignalType } from "@/lib/plaid";

const NAVY = "#012169";
const GREEN = "#0B6B43";
const BLUE = "#0073CF";
const AMBER = "#b45309";
const RED = "#E31837";
const INTERNAL_EVAL_ENABLED = import.meta.env.VITE_ENABLE_INTERNAL_EVAL === "true";

const REHEARSAL_URL = ((import.meta.env.VITE_REHEARSAL_URL as string | undefined) ?? "").trim();

type Source = { key: "primacy" | "rollover" | "plaid"; label: string; txns: PlaidTransaction[] };

const FIXTURE_SOURCES: Source[] = [
  { key: "primacy", label: "Checking-primacy sample", txns: PLAID_FIXTURE_PRIMACY },
  { key: "rollover", label: "Rollover sample", txns: PLAID_FIXTURE_ROLLOVER },
];

function StepCard({ n, icon: Icon, title, children, done }: { n: number; icon: typeof Cpu; title: string; children: React.ReactNode; done?: boolean }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-[11px] font-bold text-white" style={{ backgroundColor: done ? GREEN : NAVY }}>
          {done ? <Check className="h-3.5 w-3.5" /> : n}
        </span>
        <Icon className="h-4 w-4" style={{ color: NAVY }} />
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function LivePipelineLabContent() {
  const [source, setSource] = useState<Source["key"]>("primacy");
  const [txns, setTxns] = useState<PlaidTransaction[] | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string>("");
  const [opp, setOpp] = useState<DetectedOpportunity | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [decided, setDecided] = useState<"accept" | "reject" | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptRoute, setReceiptRoute] = useState<"salesforce" | "mock" | null>(null);
  const [delivering, setDelivering] = useState(false);

  const weights = computeWeights(feedback);
  const learning = summarizeLearning(weights);

  // Real ingestion: try live Plaid, fall back to the Plaid-schema fixture. Same pipeline downstream.
  const load = async () => {
    setLoading(true);
    setOpp(null);
    setDecided(null);
    setReceipt(null);
    setReceiptUrl(null);
    setReceiptRoute(null);
    let loaded: PlaidTransaction[] = FIXTURE_SOURCES.find((s) => s.key === source)?.txns ?? PLAID_FIXTURE_PRIMACY;
    let isLive = false;
    let msg = "Plaid-schema fixture";
    if (source === "plaid") {
      try {
        const res = await fetch("/api/plaid-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = (await res.json()) as { transactions?: PlaidTransaction[]; env?: string };
          if (data.transactions?.length) {
            loaded = data.transactions;
            isLive = true;
            msg = `Live Plaid · ${data.env ?? "sandbox"} · ${data.transactions.length} transactions`;
          } else {
            msg = "Plaid returned no transactions — showing fixture";
            loaded = PLAID_FIXTURE_PRIMACY;
          }
        } else {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          msg = `Plaid not configured (${err.error ?? res.status}) — showing fixture`;
          loaded = PLAID_FIXTURE_PRIMACY;
        }
      } catch {
        msg = "Plaid unreachable — showing fixture";
        loaded = PLAID_FIXTURE_PRIMACY;
      }
    }
    setTxns(loaded);
    setLive(isLive);
    setNote(msg);
    // Run the deterministic evaluation pipeline synchronously — enrich → detect → decide.
    setOpp(buildOpportunityFromPlaid(loaded));
    setLoading(false);
  };

  const signalTypes: SignalType[] = opp?.signals.map((s) => s.type) ?? [];
  const loopResult = opp ? applyLoop(opp.confidence, signalTypes, weights) : null;

  const decide = (decision: "accept" | "reject") => {
    if (!opp) return;
    setDecided(decision);
    setFeedback((prev) => [...prev, ...signalTypes.map((t) => ({ signalType: t, decision, converted: decision === "accept" }))]);
  };

  // Delivery route preference: the REAL Salesforce connector first (creates an actual
  // Task record and returns its Lightning URL), then the mock sandbox receiver, then an
  // honest "not configured" note. The audience sees which route it took.
  const deliver = async () => {
    if (!opp) return;
    setDelivering(true);
    try {
      const res = await fetch("/api/salesforce-deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
        body: JSON.stringify({
          subject: `${opp.type} — ${opp.action}`,
          description: `${opp.reason}\nSignals: ${opp.signals.map((s) => s.label).join(" · ")}\nConfidence: ${opp.confidence}%`,
          source: live ? "plaid-live" : "plaid-fixture",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string; url?: string };
        if (data.id) {
          setReceipt(`Task ${data.id}`);
          setReceiptUrl(data.url ?? null);
          setReceiptRoute("salesforce");
          setDelivering(false);
          return;
        }
      }
    } catch {
      // fall through to the mock receiver
    }
    if (REHEARSAL_URL) {
      try {
        const res = await fetch(REHEARSAL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-ventus-client": "web-app" },
          body: JSON.stringify({ caseId: opp.type, system: opp.destination, action: opp.action, source: live ? "plaid" : "fixture" }),
        });
        const data = res.ok ? ((await res.json()) as { receiptId?: string }) : {};
        setReceipt(data.receiptId ?? `HTTP ${res.status}`);
        setReceiptRoute("mock");
      } catch {
        setReceipt("receiver unreachable");
      }
    } else {
      setReceipt("no delivery route configured (SF_* or VITE_REHEARSAL_URL)");
    }
    setDelivering(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">
              <Radio className="h-3 w-3" /> Connected pipeline lab · evaluation only
            </span>
          </div>
          <Link to="/internal/capabilities" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            Capability register →
          </Link>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: NAVY }}>Raw transactions in. A ranked action out.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          A deterministic evaluation pipeline over Plaid-schema data. Ingest and delivery can use live sandbox connections; classification remains inspectable rule logic until model evaluation clears its gates.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div className="space-y-4">
            {/* 1 · Ingest */}
            <StepCard n={1} icon={Database} title="Ingest" done={!!txns}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {[...FIXTURE_SOURCES, { key: "plaid" as const, label: "Live Plaid", txns: [] }].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSource(s.key)}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${source === s.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" style={{ backgroundColor: NAVY }}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />} Load transactions
                </button>
                {note && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={live ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                    {live && <Radio className="h-3 w-3" />} {note}
                  </span>
                )}
              </div>
              {txns && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-slate-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    <span>Transaction</span><span>Amount</span><span>Category</span>
                  </div>
                  {txns.slice(0, 6).map((t) => (
                    <div key={t.transaction_id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-slate-100 px-3 py-1.5 text-[11px]">
                      <span className="truncate font-mono text-slate-700">{t.name}</span>
                      <span className={`font-semibold ${t.amount < 0 ? "text-emerald-700" : "text-slate-500"}`}>{t.amount < 0 ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}</span>
                      <span className="truncate text-slate-400">{t.personal_finance_category?.primary ?? "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </StepCard>

            {/* 2 · Enrich */}
            {opp && (
              <StepCard n={2} icon={Cpu} title="Enrich" done>
                <p className="text-[11px] text-slate-500">Plaid fields normalized into Ventus pillars and rails by transparent deterministic rules.</p>
                <div className="mt-2 space-y-1.5">
                  {opp.enriched.slice(0, 5).map((e) => (
                    <div key={e.raw} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px]">
                      <span className="w-40 flex-none truncate font-mono text-slate-500">{e.merchant}</span>
                      <ArrowRight className="h-3 w-3 flex-none text-slate-300" />
                      <span className="font-semibold text-slate-800">{e.tag}</span>
                      <span className="ml-auto flex-none rounded bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">{e.src}</span>
                      <span className="flex-none rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: `${BLUE}14`, color: BLUE }}>{Math.round(e.conf * 100)}%</span>
                    </div>
                  ))}
                </div>
              </StepCard>
            )}

            {/* 3 · Detect */}
            {opp && (
              <StepCard n={3} icon={Network} title="Detect signals" done>
                <div className="space-y-2">
                  {opp.signals.map((s) => (
                    <div key={s.type} className="flex items-center gap-3">
                      <span className="w-44 flex-none text-[11px] font-semibold text-slate-700">{s.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${Math.round(s.strength * 100)}%`, backgroundColor: GREEN }} />
                      </div>
                      <span className="w-8 flex-none text-right text-[10px] font-bold text-slate-500">{Math.round(s.strength * 100)}</span>
                    </div>
                  ))}
                </div>
              </StepCard>
            )}

            {/* 4 · Decide */}
            {opp && loopResult && (
              <StepCard n={4} icon={Wand2} title="Decide" done={decided !== null}>
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">{opp.type}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-700">{opp.reason}</p>
                    </div>
                    <div className="flex-none text-right">
                      <p className="text-2xl font-bold" style={{ color: NAVY }}>{loopResult.score}</p>
                      <p className="text-[9px] font-bold uppercase text-slate-400">score</p>
                      {loopResult.delta !== 0 && (
                        <p className="text-[10px] font-bold" style={{ color: loopResult.delta > 0 ? GREEN : AMBER }}>
                          {loopResult.delta > 0 ? "+" : ""}{loopResult.delta} from learning
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
                    <span className="text-xs font-semibold text-slate-900">{opp.action}</span>
                    <span className="text-[10px] font-semibold text-slate-500">→ {opp.destination}</span>
                  </div>
                  {decided === null ? (
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => decide("accept")} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: GREEN }}>
                        <ThumbsUp className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button onClick={() => decide("reject")} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        <ThumbsDown className="h-3.5 w-3.5" /> Reject
                      </button>
                      <span className="text-[10px] text-slate-400">Your decision teaches the loop.</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={decided === "accept" ? { backgroundColor: `${GREEN}14`, color: GREEN } : { backgroundColor: `${AMBER}1a`, color: AMBER }}>
                        {decided === "accept" ? <ThumbsUp className="h-3 w-3" /> : <ThumbsDown className="h-3 w-3" />} {decided === "accept" ? "Accepted — signals reinforced" : "Rejected — signals dampened"}
                      </span>
                      {decided === "accept" && (
                        <button onClick={deliver} disabled={delivering || !!receipt} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60" style={{ backgroundColor: NAVY }}>
                          {delivering ? <Loader2 className="h-3 w-3 animate-spin" /> : <Network className="h-3 w-3" />} Deliver
                        </button>
                      )}
                      {receipt && (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-emerald-700">
                          {receiptRoute === "salesforce" && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase not-italic tracking-wide">Salesforce · live</span>}
                          {receiptRoute === "mock" && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">sandbox receiver</span>}
                          {receipt}
                          {receiptUrl && (
                            <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="underline">
                              open in Salesforce →
                            </a>
                          )}
                        </span>
                      )}
                      <button onClick={load} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"><RotateCcw className="h-3 w-3" /> Run again</button>
                    </div>
                  )}
                </div>
              </StepCard>
            )}
          </div>

          {/* Learning panel */}
          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" style={{ color: NAVY }} />
                <h2 className="text-sm font-bold text-slate-900">What the loop has learned</h2>
              </div>
              {feedback.length === 0 ? (
                <p className="mt-3 rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[11px] text-slate-400">
                  No feedback yet. Accept or reject a decision — signal trust updates here and the score reflects it next run.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {(Object.values(weights) as SignalWeight[])
                    .sort((a, b) => b.weight - a.weight)
                    .map((w) => (
                      <div key={w.signalType} className="rounded-lg bg-slate-50 p-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">{w.signalType.replace(/_/g, " ")}</span>
                          <span className="font-bold" style={{ color: w.weight > 1.02 ? GREEN : w.weight < 0.98 ? AMBER : "#64748b" }}>×{w.weight.toFixed(2)}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full" style={{ width: `${(w.weight / 1.8) * 100}%`, backgroundColor: w.weight >= 1 ? GREEN : AMBER }} />
                        </div>
                        <p className="mt-1 text-[9px] text-slate-400">{w.accepts}✓ / {w.rejects}✗{w.conversions ? ` · ${w.conversions} converted` : ""}</p>
                      </div>
                    ))}
                </div>
              )}
              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-slate-400">
                <ShieldCheck className="mt-0.5 h-3 w-3 flex-none" style={{ color: GREEN }} />
                v1 loop — re-weights signal trust from real outcomes. Model retraining is a separate, gated capability.
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-500">
              <p className="font-bold text-slate-700">Real connections</p>
              <p className="mt-1">Ingest calls <span className="font-mono">/api/plaid-transactions</span> (live with <span className="font-mono">PLAID_CLIENT_ID/SECRET</span>).</p>
              <p className="mt-1">Delivery tries <span className="font-mono">/api/salesforce-deliver</span> first (real Task via <span className="font-mono">SF_CLIENT_ID/SECRET</span>), then <span className="font-mono">VITE_REHEARSAL_URL</span> {REHEARSAL_URL ? <span className="font-semibold text-emerald-700">— configured</span> : "— unset (run scripts/mock-cew-sandbox.mjs)"}.</p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function LivePipelineLab() {
  if (!INTERNAL_EVAL_ENABLED) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Internal evaluation is disabled</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Enable the internal evaluation build flag only in an approved test environment.</p>
        </section>
      </main>
    );
  }
  return (
    <SimplePasswordGate tagline="Live pipeline lab" allowDemoBypass={false}>
      <LivePipelineLabContent />
    </SimplePasswordGate>
  );
}
