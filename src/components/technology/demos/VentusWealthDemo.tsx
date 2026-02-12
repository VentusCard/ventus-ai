import { useEffect, useRef, useCallback } from "react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const EVENT_ORDER = ['retirement', 'education', 'home_purchase', 'family_formation', 'elder_care'] as const;

const EVENT_CONFIG: Record<string, { label: string; icon: string; color: string; urgency: string; timing: string }> = {
  retirement: { label: 'Retirement Planning', icon: '🌅', color: '#f59e0b', urgency: 'Urgent', timing: 'Q1 2026' },
  education: { label: 'Education Funding', icon: '🎓', color: '#3b82f6', urgency: 'Soon', timing: 'Q3 2026' },
  home_purchase: { label: 'Home Purchase', icon: '🏠', color: '#22c55e', urgency: 'Urgent', timing: 'Q1 2026' },
  family_formation: { label: 'Family Formation', icon: '👶', color: '#ec4899', urgency: 'Upcoming', timing: 'Q2 2026' },
  elder_care: { label: 'Elder Care', icon: '❤️', color: '#ef4444', urgency: 'Soon', timing: 'Q1 2026' },
};

const TRANSACTIONS: Record<string, Array<{ merchant: string; amount: string; date: string; card: string; relevance: string }>> = {
  retirement: [
    { merchant: 'Fidelity Investments', amount: '$6,500', date: 'Jan 15', card: 'Platinum ...4532', relevance: '401k contribution increase' },
    { merchant: 'AARP Membership', amount: '$16', date: 'Dec 28', card: 'Cashback ...7891', relevance: 'Retirement association enrollment' },
    { merchant: 'Viking Cruises', amount: '$8,500', date: 'Jan 20', card: 'Travel Elite ...2234', relevance: 'Retirement travel planning' },
    { merchant: 'Estate Planning Attorney', amount: '$2,500', date: 'Jan 18', card: 'Checking ...5678', relevance: 'Estate planning consultation' },
    { merchant: 'Kiplinger Retirement Guide', amount: '$29', date: 'Jan 8', card: 'Platinum ...4532', relevance: 'Retirement planning research' },
  ],
  education: [
    { merchant: 'College Board', amount: '$98', date: 'Jan 12', card: 'Platinum ...4532', relevance: 'SAT registration fees' },
    { merchant: 'Princeton Review', amount: '$1,299', date: 'Dec 15', card: 'Platinum ...4532', relevance: 'Test prep course enrollment' },
    { merchant: 'Southwest Airlines', amount: '$450', date: 'Jan 18', card: 'Travel Elite ...2234', relevance: 'Campus visit travel' },
    { merchant: 'Ivy Coach Admissions', amount: '$3,500', date: 'Jan 5', card: 'Cashback ...7891', relevance: 'College admissions consulting' },
    { merchant: 'Niche.com Premium', amount: '$49', date: 'Dec 20', card: 'Platinum ...4532', relevance: 'College research subscription' },
  ],
  home_purchase: [
    { merchant: 'Home Depot', amount: '$2,340', date: 'Feb 1', card: 'Cashback ...7891', relevance: 'Home improvement supplies' },
    { merchant: "Lowe's", amount: '$567', date: 'Feb 3', card: 'Cashback ...7891', relevance: 'Renovation materials' },
    { merchant: 'U-Haul', amount: '$890', date: 'Feb 5', card: 'Cashback ...7891', relevance: 'Moving rental booking' },
    { merchant: 'Earnest Money Deposit', amount: '$15,000', date: 'Jan 20', card: 'Checking ...5678', relevance: 'Home purchase deposit' },
    { merchant: 'Wire - Closing Costs', amount: '$8,500', date: 'Jan 28', card: 'Checking ...5678', relevance: 'Title and closing fees' },
  ],
  family_formation: [
    { merchant: 'Amazon Baby Registry', amount: '$1,850', date: 'Jan 15', card: 'Cashback ...7891', relevance: 'Baby registry purchases' },
    { merchant: 'Buy Buy Baby', amount: '$1,250', date: 'Jan 22', card: 'Cashback ...7891', relevance: 'Nursery essentials' },
    { merchant: 'Motherhood Maternity', amount: '$340', date: 'Jan 10', card: 'Platinum ...4532', relevance: 'Maternity clothing' },
    { merchant: 'Graco Baby', amount: '$450', date: 'Jan 28', card: 'Cashback ...7891', relevance: 'Car seat and stroller' },
    { merchant: 'Memorial Hospital', amount: '$2,500', date: 'Jan 30', card: 'Checking ...5678', relevance: 'Hospital pre-registration deposit' },
  ],
  elder_care: [
    { merchant: 'Medical Guardian', amount: '$350', date: 'Jan 10', card: 'Cashback ...7891', relevance: 'Medical alert system' },
    { merchant: 'Home Depot - Mobility', amount: '$890', date: 'Jan 15', card: 'Cashback ...7891', relevance: 'Accessibility modifications' },
    { merchant: 'Aging Life Care Assoc.', amount: '$450', date: 'Jan 18', card: 'Platinum ...4532', relevance: 'Geriatric care manager' },
    { merchant: 'AARP Medicare Supplement', amount: '$280', date: 'Jan 20', card: 'Checking ...5678', relevance: 'Medicare supplement premium' },
    { merchant: 'Sunrise Senior Living', amount: '$12,000', date: 'Jan 25', card: 'Checking ...5678', relevance: 'Assisted living deposit' },
  ],
};

const CONFIDENCE: Record<string, number> = {
  retirement: 91, education: 82, home_purchase: 87, family_formation: 76, elder_care: 68,
};

const INSIGHTS: Record<string, string> = {
  retirement: "Client is in early exploration of retirement—increased 401k, AARP enrollment, and cruise booking reveal aspirations for an active, travel-rich next chapter. Estate planning consultation shows they're thinking about legacy. Critical window for Roth conversions and income strategies.",
  education: "Parent is deep in the college planning research phase. SAT prep, admissions consulting, and campus visits show serious commitment. This is the ideal window for 529 optimization and financial aid positioning before uninformed funding decisions.",
  home_purchase: "Client is in active home acquisition mode. Earnest money and closing costs confirm imminent transaction. Home improvement and moving activity show firm timeline. Expect questions about mortgage optimization and investment rebalancing.",
  family_formation: "Growing family preparing for a new arrival. Baby registry, nursery purchases, and hospital pre-registration confirm timeline clarity. They haven't yet established education savings or updated estate documents—proactive opportunity.",
  elder_care: "Client is stepping into a caregiver role. Medical alert system, accessibility mods, and assisted living deposit indicate transitioning an aging family member to daily support. Approach with empathy while addressing long-term care costs.",
};

const ACTION_ITEMS: Record<string, string[]> = {
  retirement: [
    'Open conversation about retirement vision and ideal lifestyle',
    'Introduce retirement income modeling with 401k trajectory',
    'Discuss Roth conversion strategy during remaining working years',
    'Review healthcare bridge options before Medicare eligibility',
  ],
  education: [
    'Initiate 529 plan discussion—researching but no funding yet',
    'Calculate projected costs for likely target schools',
    'Review financial aid implications and FAFSA timing',
    'Model parent vs. student loan scenarios for trade-off clarity',
  ],
  home_purchase: [
    'Analyze liquid assets for down payment without disrupting investments',
    'Compare mortgage scenarios: 15 vs. 30-year, ARM vs. fixed',
    'Model post-purchase cash flow including PITI and maintenance',
    'Review homeowners insurance and umbrella liability coverage',
  ],
  family_formation: [
    'Introduce 529 plan options for education savings',
    'Benchmark life insurance: 10-12x income replacement',
    'Update wills to include guardianship designations',
    'Model childcare costs into financial plan',
  ],
  elder_care: [
    'Assess long-term care insurance options',
    'Review assets for Medicaid look-back period implications',
    'Confirm power of attorney and healthcare proxy documents',
    'Model assisted living vs. in-home care cost trajectories',
  ],
};

function wait(ms: number) { return new Promise(res => setTimeout(res, ms)); }

// ─── Component ────────────────────────────────────────────────────────────────

export default function VentusWealthDemo() {
  const runningRef = useRef(true);
  const flowTokenRef = useRef(0);
  const stepIdxRef = useRef(0);
  const cyclesRef = useRef(0);
  const detectedEventsRef = useRef<string[]>([]);

  // DOM refs
  const rootRef = useRef<HTMLDivElement>(null);
  const txListRef = useRef<HTMLDivElement>(null);
  const eventsListRef = useRef<HTMLDivElement>(null);
  const actionsListRef = useRef<HTMLDivElement>(null);
  const flowStepRef = useRef<HTMLSpanElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const loadTxRef = useRef<HTMLDivElement>(null);
  const loadDetectRef = useRef<HTMLDivElement>(null);
  const loadActionsRef = useRef<HTMLDivElement>(null);

  const showLoad = useCallback((which: string, on: boolean) => {
    const ref = which === 'tx' ? loadTxRef : which === 'detect' ? loadDetectRef : loadActionsRef;
    if (ref.current) ref.current.style.display = on ? 'flex' : 'none';
  }, []);

  const renderTransactions = useCallback((eventKey: string, count: number) => {
    if (!txListRef.current) return;
    const txs = TRANSACTIONS[eventKey] || [];
    const visible = txs.slice(0, count);
    txListRef.current.innerHTML = visible.map(tx => `
      <div class="vwm-tx vwm-fadeIn">
        <div class="vwm-tx-top">
          <div class="vwm-tx-merchant">${tx.merchant}</div>
          <div class="vwm-tx-amount">${tx.amount}</div>
        </div>
        <div class="vwm-tx-bottom">
          <span class="vwm-tx-card">${tx.card}</span>
          <span class="vwm-tx-date">${tx.date}</span>
        </div>
        <div class="vwm-tx-relevance">${tx.relevance}</div>
      </div>
    `).join('');
    txListRef.current.scrollTop = txListRef.current.scrollHeight;
  }, []);

  const renderEventCard = useCallback((eventKey: string) => {
    const cfg = EVENT_CONFIG[eventKey];
    const conf = CONFIDENCE[eventKey];
    const urgencyColor = cfg.urgency === 'Urgent' ? '#ef4444' : cfg.urgency === 'Soon' ? '#f59e0b' : '#3b82f6';
    return `
      <div class="vwm-event-card vwm-fadeIn" style="border-left: 3px solid ${cfg.color}">
        <div class="vwm-event-header">
          <span class="vwm-event-icon">${cfg.icon}</span>
          <span class="vwm-event-label">${cfg.label}</span>
        </div>
        <div class="vwm-event-meta">
          <span class="vwm-conf-badge" style="background: ${cfg.color}20; color: ${cfg.color}; border-color: ${cfg.color}40">${conf}%</span>
          <span class="vwm-urgency-badge" style="background: ${urgencyColor}20; color: ${urgencyColor}; border-color: ${urgencyColor}40">${cfg.urgency}</span>
          <span class="vwm-timing-badge">${cfg.timing}</span>
        </div>
      </div>
    `;
  }, []);

  const renderDetectedEvents = useCallback(() => {
    if (!eventsListRef.current) return;
    eventsListRef.current.innerHTML = detectedEventsRef.current.map(k => renderEventCard(k)).join('');
    eventsListRef.current.scrollTop = eventsListRef.current.scrollHeight;
  }, [renderEventCard]);

  const renderActionItems = useCallback((eventKey: string) => {
    if (!actionsListRef.current) return;
    const cfg = EVENT_CONFIG[eventKey];
    const items = ACTION_ITEMS[eventKey] || [];
    const insight = INSIGHTS[eventKey] || '';
    const existingHTML = actionsListRef.current.innerHTML;
    const newHTML = `
      <div class="vwm-action-group vwm-fadeIn">
        <div class="vwm-action-group-header" style="color: ${cfg.color}">
          <span>${cfg.icon}</span> ${cfg.label}
        </div>
        <ol class="vwm-action-steps">
          ${items.map((item, i) => `<li class="vwm-action-step"><span class="vwm-step-num" style="background: ${cfg.color}20; color: ${cfg.color}">${i + 1}</span>${item}</li>`).join('')}
        </ol>
        <div class="vwm-insight-box">
          <div class="vwm-insight-label">✨ Ventus AI Insight</div>
          <div class="vwm-insight-text">${insight}</div>
        </div>
      </div>
    `;
    actionsListRef.current.innerHTML = existingHTML + newHTML;
    actionsListRef.current.scrollTop = actionsListRef.current.scrollHeight;
  }, []);

  const updateMetrics = useCallback(() => {
    if (!metricsRef.current) return;
    const count = detectedEventsRef.current.length;
    const urgent = detectedEventsRef.current.filter(k => EVENT_CONFIG[k]?.urgency === 'Urgent').length;
    const thisQ = detectedEventsRef.current.filter(k => EVENT_CONFIG[k]?.timing?.includes('Q1')).length;
    metricsRef.current.innerHTML = `
      <span class="vwm-metric"><span class="vwm-metric-num">${count}</span> Events Detected</span>
      <span class="vwm-metric vwm-metric-urgent"><span class="vwm-metric-num">${urgent}</span> Urgent</span>
      <span class="vwm-metric vwm-metric-quarter"><span class="vwm-metric-num">${thisQ}</span> This Quarter</span>
    `;
  }, []);

  const updatePillUI = useCallback((eventKey: string) => {
    if (!rootRef.current) return;
    rootRef.current.querySelectorAll('.vwm-pill').forEach((btn: Element) => {
      const el = btn as HTMLElement;
      const isActive = el.dataset.event === eventKey;
      el.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) el.classList.add('scanning'); else el.classList.remove('scanning');
    });
  }, []);

  // ── Flow ──────────────────────────────────────────────────────────────────

  const runOneEvent = useCallback(async (eventKey: string, stepNum: number, total: number, token: number) => {
    if (token !== flowTokenRef.current) return;
    const cfg = EVENT_CONFIG[eventKey];

    updatePillUI(eventKey);
    if (flowStepRef.current) flowStepRef.current.textContent = `Step ${stepNum}/${total} · Scanning: ${cfg.label}`;

    // Show transactions one by one
    showLoad('tx', true);
    await wait(1200);
    if (token !== flowTokenRef.current) return;
    showLoad('tx', false);

    const txs = TRANSACTIONS[eventKey] || [];
    for (let i = 1; i <= txs.length; i++) {
      if (token !== flowTokenRef.current) return;
      renderTransactions(eventKey, i);
      await wait(600);
    }
    if (token !== flowTokenRef.current) return;

    // Detect event
    if (flowStepRef.current) flowStepRef.current.textContent = `Step ${stepNum}/${total} · Detecting: ${cfg.label}`;
    showLoad('detect', true);
    await wait(1500);
    if (token !== flowTokenRef.current) return;
    showLoad('detect', false);

    detectedEventsRef.current = [...detectedEventsRef.current, eventKey];
    renderDetectedEvents();
    updateMetrics();
    await wait(800);
    if (token !== flowTokenRef.current) return;

    // Show action items
    showLoad('actions', true);
    await wait(1200);
    if (token !== flowTokenRef.current) return;
    showLoad('actions', false);
    renderActionItems(eventKey);
    await wait(1800);
    if (token !== flowTokenRef.current) return;

    // Clear scanning state
    if (rootRef.current) {
      rootRef.current.querySelectorAll('.vwm-pill').forEach((btn: Element) => {
        (btn as HTMLElement).classList.remove('scanning');
      });
    }
  }, [updatePillUI, showLoad, renderTransactions, renderDetectedEvents, updateMetrics, renderActionItems]);

  const autoLoop = useCallback(async () => {
    const total = EVENT_ORDER.length;
    while (runningRef.current && cyclesRef.current < 1) {
      const myToken = flowTokenRef.current;
      const eventKey = EVENT_ORDER[stepIdxRef.current % total];
      const stepNum = (stepIdxRef.current % total) + 1;
      await runOneEvent(eventKey, stepNum, total, myToken);
      if (myToken !== flowTokenRef.current) continue;
      stepIdxRef.current++;
      if (stepIdxRef.current >= total) {
        cyclesRef.current++;
        if (cyclesRef.current >= 1) {
          runningRef.current = false;
          if (toggleBtnRef.current) toggleBtnRef.current.textContent = 'Restart';
          if (flowStepRef.current) flowStepRef.current.textContent = 'All life events processed · Complete';
          break;
        }
      }
      await wait(1200);
    }
  }, [runOneEvent]);

  const resetState = useCallback(() => {
    detectedEventsRef.current = [];
    if (txListRef.current) txListRef.current.innerHTML = '';
    if (eventsListRef.current) eventsListRef.current.innerHTML = '';
    if (actionsListRef.current) actionsListRef.current.innerHTML = '';
    if (metricsRef.current) metricsRef.current.innerHTML = '';
  }, []);

  const start = useCallback(() => {
    runningRef.current = true;
    cyclesRef.current = 0;
    stepIdxRef.current = 0;
    resetState();
    if (toggleBtnRef.current) toggleBtnRef.current.textContent = 'Pause';
    flowTokenRef.current++;
    autoLoop();
  }, [autoLoop, resetState]);

  const pause = useCallback(() => {
    runningRef.current = false;
    if (toggleBtnRef.current) toggleBtnRef.current.textContent = 'Resume';
    flowTokenRef.current++;
    showLoad('tx', false);
    showLoad('detect', false);
    showLoad('actions', false);
    if (rootRef.current) {
      rootRef.current.querySelectorAll('.vwm-pill').forEach((btn: Element) => {
        (btn as HTMLElement).classList.remove('scanning');
      });
    }
    if (flowStepRef.current) flowStepRef.current.textContent = 'Paused';
  }, [showLoad]);

  const handlePillClick = useCallback(async (eventKey: string) => {
    pause();
    const cfg = EVENT_CONFIG[eventKey];
    const clickToken = flowTokenRef.current;

    updatePillUI(eventKey);
    if (flowStepRef.current) flowStepRef.current.textContent = cfg.label;

    // Show all transactions for this event
    renderTransactions(eventKey, (TRANSACTIONS[eventKey] || []).length);

    // Detect event if not already
    if (!detectedEventsRef.current.includes(eventKey)) {
      showLoad('detect', true);
      await wait(1200);
      if (clickToken !== flowTokenRef.current) return;
      showLoad('detect', false);
      detectedEventsRef.current = [...detectedEventsRef.current, eventKey];
      renderDetectedEvents();
      updateMetrics();
    }

    // Show actions
    // Clear and show just this event's actions
    if (actionsListRef.current) actionsListRef.current.innerHTML = '';
    showLoad('actions', true);
    await wait(1000);
    if (clickToken !== flowTokenRef.current) return;
    showLoad('actions', false);
    renderActionItems(eventKey);

    if (rootRef.current) {
      rootRef.current.querySelectorAll('.vwm-pill').forEach((btn: Element) => {
        (btn as HTMLElement).classList.remove('scanning');
      });
    }
  }, [pause, updatePillUI, renderTransactions, showLoad, renderDetectedEvents, updateMetrics, renderActionItems]);

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    start();
    return () => { flowTokenRef.current++; runningRef.current = false; };
  }, [start]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .vwm-root {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #ffffff;
          max-width: 1600px;
          margin: 0 auto;
          padding: 22px;
          background: transparent;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        .vwm-root *, .vwm-root *::before, .vwm-root *::after { box-sizing: border-box; }

        .vwm-top { padding: 6px 6px 10px; }
        .vwm-title { font-weight: 760; letter-spacing: -.02em; line-height: 1.05; font-size: 20px; color: #fff; }
        .vwm-sub { color: rgba(255,255,255,.55); font-size: 13px; line-height: 1.35; margin-top: 6px; }

        .vwm-client-bar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 12px; margin: 0 6px 8px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.15); border-radius: 18px;
        }
        .vwm-client-name { font-weight: 760; font-size: 14px; color: #fff; }
        .vwm-client-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.06);
          font-size: 12px; color: rgba(255,255,255,.80);
        }
        .vwm-client-chip .k { color: rgba(255,255,255,.50); font-weight: 650; }
        .vwm-client-chip strong { font-weight: 720; color: #fff; }
        .vwm-segment-badge {
          padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
          background: rgba(168,85,247,.2); color: #c084fc; border: 1px solid rgba(168,85,247,.3);
        }

        /* Pills row */
        .vwm-pills-row {
          display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
          padding: 12px; margin: 0 6px 8px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.15); border-radius: 18px;
        }
        .vwm-pills-label { font-size: 12px; color: rgba(255,255,255,.50); font-weight: 650; letter-spacing: .02em; margin-right: 4px; }
        .vwm-pill {
          position: relative;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.07);
          cursor: pointer; transition: all .22s ease;
          font-size: 12px; color: rgba(255,255,255,.88); outline: none;
        }
        .vwm-pill:hover { transform: translateY(-1px); border-color: rgba(255,255,255,.30); background: rgba(255,255,255,.12); }
        .vwm-pill[aria-selected="true"] { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.36); }
        .vwm-pill.scanning { border-color: rgba(120,180,255,.50); background: rgba(120,180,255,.12); }
        .vwm-pill.scanning::after {
          content: ""; position: absolute; inset: -2px; border-radius: 999px;
          border: 1px solid rgba(120,180,255,.50);
          animation: vwm-scanGlow 1.4s ease-in-out infinite; pointer-events: none;
        }
        @keyframes vwm-scanGlow {
          0%  { opacity: .25; transform: scale(0.985); }
          50% { opacity: .85; transform: scale(1.01); }
          100%{ opacity: .25; transform: scale(0.985); }
        }
        .vwm-pill-dot {
          width: 10px; height: 10px; border-radius: 50%;
        }

        /* Controls */
        .vwm-controls {
          display: flex; gap: 10px; align-items: center; justify-content: space-between;
          padding: 10px 12px; margin: 0 6px 8px;
          border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.06); border-radius: 18px;
        }
        .vwm-ctrl-left { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; color: rgba(255,255,255,.72); font-size: 12px; }
        .vwm-ctrl-btns { display: flex; gap: 8px; }
        .vwm-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 10px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,.20); background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.88); font-weight: 740; font-size: 12px;
          cursor: pointer; transition: all .22s ease;
        }
        .vwm-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.15); }
        .vwm-btn.primary { background: rgba(255,255,255,.90); color: #0b1a3a; border-color: rgba(255,255,255,.10); }
        .vwm-btn.primary:hover { background: #fff; }
        .vwm-btn:active { transform: translateY(1px); }

        /* Metrics bar */
        .vwm-metrics-bar {
          display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
          padding: 10px 12px; margin: 0 6px 8px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.12); border-radius: 18px;
          min-height: 42px;
        }
        .vwm-metric {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 999px;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.15);
          font-size: 12px; color: rgba(255,255,255,.70);
        }
        .vwm-metric-num { font-weight: 760; color: #fff; font-variant-numeric: tabular-nums; }
        .vwm-metric-urgent { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.25); color: #fca5a5; }
        .vwm-metric-urgent .vwm-metric-num { color: #ef4444; }
        .vwm-metric-quarter { background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.25); color: #fcd34d; }
        .vwm-metric-quarter .vwm-metric-num { color: #f59e0b; }

        /* 3-column grid */
        .vwm-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;
          padding: 0 6px 6px;
        }
        @media (max-width: 980px) { .vwm-grid { grid-template-columns: 1fr; } }

        .vwm-panel {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          min-height: 420px; max-height: 600px;
          position: relative;
        }
        .vwm-hd {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 12px;
          background: rgba(255,255,255,.04);
          border-bottom: 1px solid rgba(255,255,255,.12);
          flex-shrink: 0;
        }
        .vwm-hd-title { font-weight: 760; letter-spacing: -.02em; font-size: 13px; color: #fff; }
        .vwm-hd-tag {
          font-size: 11px; padding: 5px 8px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.65); white-space: nowrap;
        }
        .vwm-bd {
          padding: 10px; display: flex; flex-direction: column; gap: 8px;
          flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
        }
        .vwm-bd::-webkit-scrollbar { width: 10px; }
        .vwm-bd::-webkit-scrollbar-track { background: transparent; }
        .vwm-bd::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border: 3px solid transparent; border-radius: 999px; background-clip: content-box; }

        /* Transaction items */
        .vwm-tx {
          border: 1px solid rgba(255,255,255,.12); border-radius: 12px;
          background: rgba(255,255,255,.05); padding: 10px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .vwm-tx-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .vwm-tx-merchant { font-weight: 720; font-size: 12px; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .vwm-tx-amount { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.9); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .vwm-tx-bottom { display: flex; gap: 8px; align-items: center; }
        .vwm-tx-card {
          font-size: 10px; padding: 3px 7px; border-radius: 999px;
          background: rgba(139,92,246,.15); border: 1px solid rgba(139,92,246,.25);
          color: rgba(196,181,253,.9); white-space: nowrap;
        }
        .vwm-tx-date { font-size: 10px; color: rgba(255,255,255,.45); }
        .vwm-tx-relevance { font-size: 10px; color: rgba(255,255,255,.50); font-style: italic; }

        /* Event cards */
        .vwm-event-card {
          border: 1px solid rgba(255,255,255,.15); border-radius: 14px;
          background: rgba(255,255,255,.06); padding: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .vwm-event-header { display: flex; align-items: center; gap: 8px; }
        .vwm-event-icon { font-size: 18px; }
        .vwm-event-label { font-weight: 760; font-size: 13px; color: #fff; }
        .vwm-event-meta { display: flex; flex-wrap: wrap; gap: 6px; }
        .vwm-conf-badge, .vwm-urgency-badge, .vwm-timing-badge {
          font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 999px; border: 1px solid;
        }
        .vwm-timing-badge {
          background: rgba(255,255,255,.06); color: rgba(255,255,255,.65);
          border-color: rgba(255,255,255,.15);
        }

        /* Action items */
        .vwm-action-group {
          border: 1px solid rgba(255,255,255,.12); border-radius: 14px;
          background: rgba(255,255,255,.04); padding: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .vwm-action-group-header { font-weight: 760; font-size: 13px; display: flex; align-items: center; gap: 6px; }
        .vwm-action-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        .vwm-action-step {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 11.5px; color: rgba(255,255,255,.75); line-height: 1.4;
        }
        .vwm-step-num {
          flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
          display: grid; place-items: center;
          font-size: 10px; font-weight: 700;
        }
        .vwm-insight-box {
          border-top: 1px solid rgba(255,255,255,.10); padding-top: 8px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .vwm-insight-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.50); text-transform: uppercase; letter-spacing: .04em; }
        .vwm-insight-text { font-size: 11px; color: rgba(255,255,255,.60); line-height: 1.45; }

        /* Loading overlay */
        .vwm-load-overlay {
          position: absolute; inset: 46px 10px 10px 10px;
          border-radius: 16px;
          border: 1px dashed rgba(255,255,255,.18);
          background: rgba(0,0,0,.30);
          display: none; align-items: center; justify-content: center;
          padding: 12px; pointer-events: none; z-index: 2;
        }
        .vwm-loader-box {
          display: flex; gap: 12px; align-items: center;
          padding: 12px; background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.20);
          border-radius: 16px; max-width: 92%;
        }
        .vwm-spinner {
          width: 24px; height: 24px; border-radius: 999px;
          border: 2px solid rgba(255,255,255,.20);
          border-top-color: rgba(255,255,255,.80);
          animation: vwm-spin 1s linear infinite; flex: 0 0 auto;
        }
        @keyframes vwm-spin { to { transform: rotate(360deg); } }
        .vwm-loader-txt { display: flex; flex-direction: column; gap: 2px; }
        .vwm-loader-txt b { font-size: 12px; color: #fff; }
        .vwm-loader-txt span { font-size: 11px; color: rgba(255,255,255,.55); }

        .vwm-foot { padding: 8px 6px 2px; color: rgba(255,255,255,.40); font-size: 11px; }
        .vwm-fadeIn { animation: vwm-fadeIn .35s ease both; }
        @keyframes vwm-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        .vwm-scale-wrapper { transform-origin: top center; }
        @media (max-width: 1024px) { .vwm-scale-wrapper { transform: scale(0.7); margin-bottom: -30%; } }
        @media (max-width: 767px) { .vwm-scale-wrapper { transform: scale(0.5); margin-bottom: -50%; } }
      `}</style>

      <div className="vwm-scale-wrapper">
      <div className="vwm-root" ref={rootRef}>
        <div className="vwm-top">
          <div className="vwm-title">Ventus AI Life Event Detection Simulator</div>
          <div className="vwm-sub">Transaction Patterns → Behavioral Signals → Life Event Detection → Advisor Action Items</div>
        </div>

        {/* Client profile */}
        <div className="vwm-client-bar">
          <span className="vwm-client-name">Margaret Chen</span>
          <span className="vwm-segment-badge">Private</span>
          {[['AUM','$4.2M'],['Tenure','12 yrs'],['Risk','Moderate'],['Accounts','7']].map(([k,v]) => (
            <span key={k} className="vwm-client-chip"><span className="k">{k}</span><strong>{v}</strong></span>
          ))}
        </div>

        {/* Life event pills */}
        <div className="vwm-pills-row">
          <span className="vwm-pills-label">Life Events</span>
          {EVENT_ORDER.map(id => {
            const cfg = EVENT_CONFIG[id];
            return (
              <button key={id} className="vwm-pill" data-event={id} aria-selected="false" onClick={() => handlePillClick(id)}>
                <span className="vwm-pill-dot" style={{ background: cfg.color }} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="vwm-controls">
          <div className="vwm-ctrl-left">
            <span ref={flowStepRef}>Step 1/5 · Scanning: Retirement Planning</span>
            <span style={{color:'rgba(255,255,255,.45)',fontSize:'11px'}}>Click a life event to jump to its detection</span>
          </div>
          <div className="vwm-ctrl-btns">
            <button className="vwm-btn primary" ref={toggleBtnRef} onClick={() => {
              if (runningRef.current) { pause(); }
              else { if (cyclesRef.current >= 1) { start(); } else { runningRef.current = true; if (toggleBtnRef.current) toggleBtnRef.current.textContent = 'Pause'; flowTokenRef.current++; autoLoop(); } }
            }}>Pause</button>
            <button className="vwm-btn" onClick={() => {
              flowTokenRef.current++;
              runningRef.current = false;
              resetState();
              stepIdxRef.current = 0;
              cyclesRef.current = 0;
              if (toggleBtnRef.current) toggleBtnRef.current.textContent = 'Start';
              if (flowStepRef.current) flowStepRef.current.textContent = 'Ready to begin';
              if (rootRef.current) rootRef.current.querySelectorAll('.vwm-pill').forEach((b: Element) => { (b as HTMLElement).classList.remove('scanning'); (b as HTMLElement).setAttribute('aria-selected', 'false'); });
            }}>Reset</button>
          </div>
        </div>

        {/* Metrics */}
        <div className="vwm-metrics-bar" ref={metricsRef} />

        {/* 3-column grid */}
        <div className="vwm-grid">
          {/* Left: Transaction Signal Feed */}
          <div className="vwm-panel">
            <div className="vwm-hd">
              <div className="vwm-hd-title">Transaction Signal Feed</div>
              <div className="vwm-hd-tag">behavioral signals</div>
            </div>
            <div className="vwm-bd" ref={txListRef} />
            <div className="vwm-load-overlay" ref={loadTxRef}>
              <div className="vwm-loader-box">
                <div className="vwm-spinner" />
                <div className="vwm-loader-txt"><b>Scanning transactions</b><span>Identifying behavioral patterns</span></div>
              </div>
            </div>
          </div>

          {/* Center: Detected Life Events */}
          <div className="vwm-panel">
            <div className="vwm-hd">
              <div className="vwm-hd-title">Detected Life Events</div>
              <div className="vwm-hd-tag">confidence scoring</div>
            </div>
            <div className="vwm-bd" ref={eventsListRef} />
            <div className="vwm-load-overlay" ref={loadDetectRef}>
              <div className="vwm-loader-box">
                <div className="vwm-spinner" />
                <div className="vwm-loader-txt"><b>Detecting life event</b><span>Correlating transaction clusters</span></div>
              </div>
            </div>
          </div>

          {/* Right: Advisor Action Items */}
          <div className="vwm-panel">
            <div className="vwm-hd">
              <div className="vwm-hd-title">Advisor Action Items</div>
              <div className="vwm-hd-tag">meeting prep</div>
            </div>
            <div className="vwm-bd" ref={actionsListRef} />
            <div className="vwm-load-overlay" ref={loadActionsRef}>
              <div className="vwm-loader-box">
                <div className="vwm-spinner" />
                <div className="vwm-loader-txt"><b>Generating recommendations</b><span>Building advisor action plan</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="vwm-foot">Note: Example data shown for illustration. Actual detection uses proprietary behavioral models.</div>
      </div>
      </div>
    </>
  );
}
