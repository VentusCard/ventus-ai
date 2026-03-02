import { useEffect, useRef, useState, useCallback } from "react";

const FEED = [
  { raw: "TRADER JOE'S #113", amount: "$42.15", mcc: "5331", merchant: "Trader Joe's", cat: "Food & Dining", sub: "Grocery" },
  { raw: "UBER *TRIP CHICAGO", amount: "$28.50", mcc: "4121", merchant: "Uber", cat: "Travel & Transport", sub: "Ride Share" },
  { raw: "REI #045 CHICAGO", amount: "$124.99", mcc: "5941", merchant: "REI", cat: "Sports & Fitness", sub: "Hiking" },
  { raw: "PAYPAL *TITLEIST 58.00", amount: "$58.00", mcc: "5655", merchant: "Titleist", cat: "Sports & Fitness", sub: "Golf" },
  { raw: "TST* SWEETGREEN #028", amount: "$14.25", mcc: "5812", merchant: "Sweetgreen", cat: "Food & Dining", sub: "Quick Service" },
  { raw: "DELTA AIR LINES 00624188912", amount: "$450.00", mcc: "4511", merchant: "Delta Air Lines", cat: "Travel & Transport", sub: "Airlines" },
  { raw: "APPLPAY WHOLEFDS MKT 10256", amount: "$67.80", mcc: "5411", merchant: "Whole Foods", cat: "Food & Dining", sub: "Grocery" },
  { raw: "PAYPAL *LA FITNESS", amount: "$45.00", mcc: "7997", merchant: "LA Fitness", cat: "Sports & Fitness", sub: "Gym" },
];

const INTERVAL = 2500;
const MAX_FEED = 6;

interface Signal {
  category: string;
  spend: number;
  subs: Record<string, number>;
}

function formatDollar(n: number) {
  return "$" + n.toFixed(2);
}

export default function VentusTransactionEnrichment() {
  const [feedRows, setFeedRows] = useState<typeof FEED>([]);
  const [processing, setProcessing] = useState<typeof FEED[0] | null>(null);
  const [enrichFields, setEnrichFields] = useState<string[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [lifeEvents, setLifeEvents] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [personaLabel, setPersonaLabel] = useState("");
  const [arrowPhase, setArrowPhase] = useState<0 | 1 | 2>(0); // 0=idle, 1=left arrow, 2=right arrow
  const cursorRef = useRef(0);
  const signalsRef = useRef<Signal[]>([]);
  const totalTxRef = useRef(0);

  const derivePersona = useCallback((sigs: Signal[]) => {
    const cats = sigs.map(s => s.category);
    if (cats.includes("Travel & Transport") && cats.includes("Sports & Fitness")) return "Active Urban Professional";
    if (cats.includes("Sports & Fitness")) return "Fitness Enthusiast";
    if (cats.includes("Travel & Transport")) return "Frequent Traveler";
    if (cats.includes("Food & Dining")) return "Urban Foodie";
    return "Standard Profile";
  }, []);

  const deriveLifeEvents = useCallback((sigs: Signal[]) => {
    const events: string[] = [];
    const sports = sigs.find(s => s.category === "Sports & Fitness");
    const travel = sigs.find(s => s.category === "Travel & Transport");
    if (sports && Object.values(sports.subs).reduce((a, b) => a + b, 0) >= 2) events.push("Active Lifestyle Detected");
    if (travel && Object.values(travel.subs).reduce((a, b) => a + b, 0) >= 2) events.push("High Mobility Pattern");
    return events;
  }, []);

  const processTransaction = useCallback((tx: typeof FEED[0]) => {
    // Phase 1: show in feed + arrow to engine
    setFeedRows(prev => {
      const next = [...prev, tx];
      return next.length > MAX_FEED ? next.slice(-MAX_FEED) : next;
    });
    setArrowPhase(1);

    // Phase 2: process in engine
    setTimeout(() => {
      setProcessing(tx);
      setEnrichFields([]);
      setArrowPhase(0);

      const fields = [
        `MCC DETECTED:     ${tx.mcc}`,
        `MERCHANT:         ${tx.merchant}`,
        `CATEGORY:         ${tx.cat}`,
        `SUB-CATEGORY:     ${tx.sub}`,
        `CONFIDENCE:       96%`,
      ];

      fields.forEach((f, i) => {
        setTimeout(() => setEnrichFields(prev => [...prev, f]), (i + 1) * 280);
      });

      // Phase 3: update persona after engine done
      setTimeout(() => {
        setArrowPhase(2);

        // Update signals
        const existing = signalsRef.current;
        let sig = existing.find(s => s.category === tx.cat);
        if (!sig) {
          sig = { category: tx.cat, spend: 0, subs: {} };
          existing.push(sig);
        }
        sig.spend += parseFloat(tx.amount.replace("$", ""));
        sig.subs[tx.sub] = (sig.subs[tx.sub] || 0) + 1;
        signalsRef.current = [...existing];
        setSignals([...existing]);

        totalTxRef.current++;
        const conf = Math.min(98, 60 + totalTxRef.current * 5);
        setConfidence(conf);
        setPersonaLabel(derivePersona(existing));
        setLifeEvents(deriveLifeEvents(existing));

        setTimeout(() => setArrowPhase(0), 600);
      }, fields.length * 280 + 400);
    }, 600);
  }, [derivePersona, deriveLifeEvents]);

  useEffect(() => {
    const runNext = () => {
      const tx = FEED[cursorRef.current % FEED.length];
      cursorRef.current++;
      processTransaction(tx);
    };

    // Reset on loop
    if (cursorRef.current === 0) {
      signalsRef.current = [];
      totalTxRef.current = 0;
      setSignals([]);
      setLifeEvents([]);
      setConfidence(0);
      setPersonaLabel("");
      setFeedRows([]);
      setProcessing(null);
      setEnrichFields([]);
    }

    const timeout = setTimeout(runNext, 800);
    const interval = setInterval(() => {
      if (cursorRef.current >= FEED.length) {
        clearInterval(interval);
        setTimeout(() => {
          cursorRef.current = 0;
          signalsRef.current = [];
          totalTxRef.current = 0;
          setSignals([]);
          setLifeEvents([]);
          setConfidence(0);
          setPersonaLabel("");
          setFeedRows([]);
          setProcessing(null);
          setEnrichFields([]);
          // restart
          setTimeout(() => {
            const tx = FEED[0];
            cursorRef.current = 1;
            processTransaction(tx);
            const iv2 = setInterval(() => {
              if (cursorRef.current >= FEED.length) { clearInterval(iv2); return; }
              const t = FEED[cursorRef.current % FEED.length];
              cursorRef.current++;
              processTransaction(t);
            }, INTERVAL);
          }, 1000);
        }, 4000);
        return;
      }
      runNext();
    }, INTERVAL);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        .pipeline-root {
          width: 100%;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .pipeline-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          gap: 0;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .pipeline-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
        .pipeline-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-height: 420px;
          overflow: hidden;
        }
        .pipeline-card.engine {
          background: #131c2e;
          border-color: #253553;
        }
        .pipeline-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pipeline-card-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3b82f6;
        }
        .pipeline-card-body {
          flex: 1;
          padding: 16px 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .pipeline-card-footer {
          padding: 10px 20px;
          border-top: 1px solid #1e293b;
          font-size: 10px;
          color: #475569;
          text-align: center;
        }

        /* Live dot */
        .pipe-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: pipe-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(74,222,128,0.5);
        }
        @keyframes pipe-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.7); }
        }

        /* Spinner for engine */
        .pipe-spinner {
          width: 14px; height: 14px;
          border: 2px solid #1e293b;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: pipe-spin 1s linear infinite;
        }
        @keyframes pipe-spin {
          to { transform: rotate(360deg); }
        }

        /* Feed rows */
        .feed-row {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11px;
          line-height: 1.3;
          padding: 6px 0;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #64748b;
          animation: feed-in 0.4s ease-out;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feed-row.newest {
          color: #e2e8f0;
          background: rgba(59,130,246,0.08);
          border-radius: 6px;
          padding: 6px 8px;
          margin: 0 -8px;
        }
        @keyframes feed-in {
          from { opacity:0; transform:translateY(8px); }
          to { opacity:1; transform:translateY(0); }
        }

        /* Arrow connector */
        .pipeline-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          position: relative;
        }
        @media (max-width: 900px) {
          .pipeline-arrow {
            width: 100%;
            height: 48px;
            transform: rotate(90deg);
          }
        }
        .arrow-line {
          width: 100%;
          height: 2px;
          background: #1e293b;
          position: relative;
          overflow: hidden;
        }
        .arrow-line::after {
          content: '';
          position: absolute;
          top: -3px;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 12px rgba(59,130,246,0.7);
          opacity: 0;
        }
        .arrow-line.active::after {
          opacity: 1;
          animation: arrow-travel 0.6s ease-in-out;
        }
        @keyframes arrow-travel {
          0% { left: 0%; opacity:0; }
          20% { opacity:1; }
          80% { opacity:1; }
          100% { left: calc(100% - 8px); opacity:0; }
        }
        .arrow-head {
          width: 0; height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 8px solid #1e293b;
          flex-shrink: 0;
        }
        .arrow-head.active {
          border-left-color: #3b82f6;
        }

        /* Engine fields */
        .engine-input {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11px;
          color: #94a3b8;
          padding: 8px 12px;
          background: rgba(30,41,59,0.5);
          border-radius: 8px;
          margin-bottom: 12px;
          border: 1px solid #1e293b;
        }
        .engine-input .raw-label {
          color: #475569;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          display: block;
        }
        .engine-input .raw-value {
          color: #e2e8f0;
        }
        .engine-field {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11px;
          line-height: 1.8;
          color: #64748b;
          animation: field-in 0.3s ease-out;
          white-space: pre;
        }
        .engine-field .resolved {
          color: #3b82f6;
          font-weight: 600;
        }
        @keyframes field-in {
          from { opacity:0; transform:translateX(-6px); }
          to { opacity:1; transform:translateX(0); }
        }

        /* Persona */
        .persona-name {
          font-size: 11px;
          color: #475569;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .persona-label {
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 16px;
          min-height: 27px;
        }
        .signal-section-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        .signal-row {
          border-left: 3px solid #3b82f6;
          padding: 6px 0 6px 12px;
          margin-bottom: 6px;
          display: flex;
          align-items: baseline;
          gap: 10px;
          animation: feed-in 0.3s ease-out;
        }
        .signal-cat {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          min-width: 120px;
        }
        .signal-spend {
          font-size: 13px;
          font-weight: 700;
          color: #e2e8f0;
          min-width: 70px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .signal-subs {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .signal-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(59,130,246,0.1);
          color: #60a5fa;
          font-size: 10px;
          font-weight: 500;
        }
        .signal-chip-count {
          opacity: 0.7;
          font-size: 9px;
        }
        .life-event-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #4ade80;
          margin-bottom: 4px;
        }
        .life-event-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #4ade80;
        }
        .confidence-bar-wrap {
          margin-top: 12px;
        }
        .confidence-label {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
          margin-bottom: 4px;
        }
        .confidence-label .val {
          color: #4ade80;
          font-weight: 700;
          font-family: ui-monospace, monospace;
        }
        .confidence-track {
          height: 6px;
          background: #1e293b;
          border-radius: 999px;
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #10b981, #34d399);
          transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .pipe-person-icon {
          width: 16px; height: 16px;
          color: #3b82f6;
        }

        .pipe-disclaimer {
          text-align: center;
          margin-top: 20px;
        }
        .pipe-disclaimer p {
          font-size: 11px;
          color: #64748b;
          margin: 0;
        }
      `}</style>

      <div className="pipeline-root">
        <div className="pipeline-grid">
          {/* CARD 1 — TRANSACTION FEED */}
          <div className="pipeline-card">
            <div className="pipeline-card-header">
              <span className="pipe-live-dot" />
              <span className="pipeline-card-label">Transaction Feed</span>
            </div>
            <div className="pipeline-card-body" style={{ justifyContent: "flex-end" }}>
              {feedRows.map((tx, i) => (
                <div
                  key={`${tx.raw}-${i}`}
                  className={`feed-row ${i === feedRows.length - 1 ? "newest" : ""}`}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tx.raw}</span>
                  <span style={{ flexShrink: 0, fontWeight: 600 }}>{tx.amount}</span>
                </div>
              ))}
            </div>
            <div className="pipeline-card-footer">Raw transaction strings — as received</div>
          </div>

          {/* ARROW 1 */}
          <div className="pipeline-arrow">
            <div className={`arrow-line ${arrowPhase === 1 ? "active" : ""}`} />
            <div className={`arrow-head ${arrowPhase === 1 ? "active" : ""}`} />
          </div>

          {/* CARD 2 — ENRICHMENT ENGINE */}
          <div className="pipeline-card engine">
            <div className="pipeline-card-header">
              <div className="pipe-spinner" />
              <span className="pipeline-card-label">Enrichment Engine</span>
            </div>
            <div className="pipeline-card-body">
              {processing ? (
                <>
                  <div className="engine-input">
                    <span className="raw-label">Input:</span>
                    <span className="raw-value">{processing.raw} · {processing.amount}</span>
                  </div>
                  <div>
                    {enrichFields.map((field, i) => {
                      const parts = field.split(/:\s+/);
                      return (
                        <div key={i} className="engine-field">
                          <span>{parts[0]}:     </span>
                          <span className="resolved">{parts[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ color: "#475569", fontSize: 12, fontStyle: "italic" }}>Awaiting transaction…</div>
              )}
            </div>
            <div className="pipeline-card-footer">20+ enrichment categories · sub-100ms processing</div>
          </div>

          {/* ARROW 2 */}
          <div className="pipeline-arrow">
            <div className={`arrow-line ${arrowPhase === 2 ? "active" : ""}`} />
            <div className={`arrow-head ${arrowPhase === 2 ? "active" : ""}`} />
          </div>

          {/* CARD 3 — CUSTOMER PERSONA */}
          <div className="pipeline-card">
            <div className="pipeline-card-header">
              <svg className="pipe-person-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="pipeline-card-label">Customer Persona</span>
            </div>
            <div className="pipeline-card-body">
              <div className="persona-name">Customer #4821</div>
              <div className="persona-label">{personaLabel || "—"}</div>

              {signals.length > 0 && (
                <>
                  <div className="signal-section-title">Signals</div>
                  {signals.map(sig => (
                    <div key={sig.category} className="signal-row">
                      <span className="signal-cat">{sig.category}</span>
                      <span className="signal-spend">{formatDollar(sig.spend)}</span>
                      <div className="signal-subs">
                        {Object.entries(sig.subs).sort((a, b) => b[1] - a[1]).map(([sub, count]) => (
                          <span key={sub} className="signal-chip">
                            {sub}
                            {count >= 2 && <span className="signal-chip-count">{count}x</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {lifeEvents.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="signal-section-title">Life Events</div>
                  {lifeEvents.map(e => (
                    <div key={e} className="life-event-row">
                      <span className="life-event-dot" />
                      {e}
                    </div>
                  ))}
                </div>
              )}

              {confidence > 0 && (
                <div className="confidence-bar-wrap">
                  <div className="confidence-label">
                    <span>Confidence Score</span>
                    <span className="val">{confidence}%</span>
                  </div>
                  <div className="confidence-track">
                    <div className="confidence-fill" style={{ width: `${confidence}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="pipeline-card-footer">Profile updates with every new transaction</div>
          </div>
        </div>

        <div className="pipe-disclaimer">
          <p>Example merchants and MCC codes shown for demonstration purposes. Actual merchant names and codes may differ.</p>
        </div>
      </div>
    </>
  );
}
