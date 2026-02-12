import { useEffect, useRef, useCallback, useState } from "react";

// ─── Static Data: 8 Clients, 12 Events ──────────────────────────────────────

interface DemoClient {
  id: string;
  name: string;
  segment: 'Private' | 'Premium' | 'Preferred';
  aum: string;
}

interface DemoEvent {
  clientId: string;
  eventType: string;
  eventName: string;
  confidence: number;
  urgency: 'Urgent' | 'Soon' | 'Upcoming';
  timing: string;
  evidence: string;
  icon: string;
  color: string;
}

interface DemoDetail {
  transactions: Array<{ merchant: string; amount: string; date: string; card: string; relevance: string }>;
  insight: string;
  steps: string[];
}

const CLIENTS: DemoClient[] = [
  { id: 'c1', name: 'Margaret Chen', segment: 'Private', aum: '$4.2M' },
  { id: 'c2', name: 'David Park', segment: 'Premium', aum: '$1.8M' },
  { id: 'c3', name: 'Sarah Mitchell', segment: 'Private', aum: '$6.1M' },
  { id: 'c4', name: 'James Rodriguez', segment: 'Preferred', aum: '$890K' },
  { id: 'c5', name: 'Linda Nakamura', segment: 'Private', aum: '$3.5M' },
  { id: 'c6', name: 'Robert Thompson', segment: 'Premium', aum: '$2.1M' },
  { id: 'c7', name: 'Emily Watson', segment: 'Preferred', aum: '$720K' },
  { id: 'c8', name: 'Michael Foster', segment: 'Private', aum: '$5.8M' },
];

const EVENTS: DemoEvent[] = [
  { clientId: 'c1', eventType: 'retirement', eventName: 'Retirement Planning', confidence: 91, urgency: 'Urgent', timing: 'Q1 2026', evidence: 'Fidelity 401k increase + AARP enrollment + Viking Cruises booking', icon: '🌅', color: '#f59e0b' },
  { clientId: 'c2', eventType: 'home_purchase', eventName: 'Home Purchase', confidence: 87, urgency: 'Urgent', timing: 'Q1 2026', evidence: 'Earnest money deposit + Home Depot + U-Haul booking', icon: '🏠', color: '#22c55e' },
  { clientId: 'c5', eventType: 'business_liquidity', eventName: 'Business Liquidity', confidence: 84, urgency: 'Urgent', timing: 'Q2 2026', evidence: 'Business valuation service + M&A attorney + Goldman Sachs advisory', icon: '💼', color: '#64748b' },
  { clientId: 'c8', eventType: 'home_purchase', eventName: 'Home Purchase', confidence: 81, urgency: 'Urgent', timing: 'Q1 2026', evidence: 'Real estate attorney + mortgage pre-approval + Zillow Premium', icon: '🏠', color: '#22c55e' },
  { clientId: 'c6', eventType: 'retirement', eventName: 'Retirement Planning', confidence: 88, urgency: 'Soon', timing: 'Q3 2026', evidence: 'Retirement income calculator + Schwab rollover + travel agency', icon: '🌅', color: '#f59e0b' },
  { clientId: 'c1', eventType: 'education', eventName: 'Education Funding', confidence: 82, urgency: 'Soon', timing: 'Q3 2026', evidence: 'College Board SAT + Princeton Review + campus visit flights', icon: '🎓', color: '#3b82f6' },
  { clientId: 'c3', eventType: 'wealth_transfer', eventName: 'Wealth Transfer', confidence: 79, urgency: 'Soon', timing: 'Q2 2026', evidence: 'Estate attorney consultation + trust documentation + gift tax research', icon: '🎁', color: '#a855f7' },
  { clientId: 'c8', eventType: 'elder_care', eventName: 'Elder Care', confidence: 72, urgency: 'Soon', timing: 'Q2 2026', evidence: 'Medical Guardian + accessibility mods + geriatric care manager', icon: '❤️', color: '#ef4444' },
  { clientId: 'c4', eventType: 'family_formation', eventName: 'Family Formation', confidence: 76, urgency: 'Upcoming', timing: 'Q3 2026', evidence: 'Baby registry + Buy Buy Baby + hospital pre-registration', icon: '👶', color: '#ec4899' },
  { clientId: 'c7', eventType: 'education', eventName: 'Education Funding', confidence: 75, urgency: 'Upcoming', timing: 'Q4 2026', evidence: 'College savings research + Niche.com + campus tour bookings', icon: '🎓', color: '#3b82f6' },
  { clientId: 'c3', eventType: 'elder_care', eventName: 'Elder Care', confidence: 68, urgency: 'Upcoming', timing: 'Q4 2026', evidence: 'AARP Medicare supplement + Sunrise Senior Living inquiry', icon: '❤️', color: '#ef4444' },
  { clientId: 'c5', eventType: 'wealth_transfer', eventName: 'Wealth Transfer', confidence: 65, urgency: 'Upcoming', timing: 'Q1 2027', evidence: 'Dynasty trust research + charitable giving advisor', icon: '🎁', color: '#a855f7' },
];

const DETAILS: Record<string, DemoDetail> = {
  'c1-retirement': {
    transactions: [
      { merchant: 'Fidelity Investments', amount: '$6,500', date: 'Jan 15', card: 'Platinum ...4532', relevance: '401k contribution increase' },
      { merchant: 'AARP Membership', amount: '$16', date: 'Dec 28', card: 'Cashback ...7891', relevance: 'Retirement association enrollment' },
      { merchant: 'Viking Cruises', amount: '$8,500', date: 'Jan 20', card: 'Travel Elite ...2234', relevance: 'Retirement travel planning' },
      { merchant: 'Estate Planning Attorney', amount: '$2,500', date: 'Jan 18', card: 'Checking ...5678', relevance: 'Estate planning consultation' },
    ],
    insight: "Client is in early exploration of retirement—increased 401k, AARP enrollment, and cruise booking reveal aspirations for an active, travel-rich next chapter. Critical window for Roth conversions and income strategies.",
    steps: ['Open conversation about retirement vision and ideal lifestyle', 'Introduce retirement income modeling with 401k trajectory', 'Discuss Roth conversion strategy during remaining working years', 'Review healthcare bridge options before Medicare eligibility'],
  },
  'c2-home_purchase': {
    transactions: [
      { merchant: 'Earnest Money Deposit', amount: '$15,000', date: 'Jan 20', card: 'Checking ...5678', relevance: 'Home purchase deposit' },
      { merchant: 'Home Depot', amount: '$2,340', date: 'Feb 1', card: 'Cashback ...7891', relevance: 'Home improvement supplies' },
      { merchant: 'U-Haul', amount: '$890', date: 'Feb 5', card: 'Cashback ...7891', relevance: 'Moving rental booking' },
      { merchant: 'Wire - Closing Costs', amount: '$8,500', date: 'Jan 28', card: 'Checking ...5678', relevance: 'Title and closing fees' },
    ],
    insight: "Client is in active home acquisition mode. Earnest money and closing costs confirm imminent transaction. Home improvement and moving activity show firm timeline.",
    steps: ['Analyze liquid assets for down payment without disrupting investments', 'Compare mortgage scenarios: 15 vs. 30-year, ARM vs. fixed', 'Model post-purchase cash flow including PITI and maintenance', 'Review homeowners insurance and umbrella liability coverage'],
  },
  'c5-business_liquidity': {
    transactions: [
      { merchant: 'BizBuySell Valuation', amount: '$4,500', date: 'Jan 10', card: 'Business ...3344', relevance: 'Business valuation service' },
      { merchant: 'M&A Legal Partners', amount: '$12,000', date: 'Jan 15', card: 'Business ...3344', relevance: 'M&A attorney retainer' },
      { merchant: 'Goldman Sachs Advisory', amount: '$25,000', date: 'Jan 22', card: 'Business ...3344', relevance: 'Investment banking advisory' },
    ],
    insight: "Client is exploring exit options for their business. Valuation, legal, and advisory fees suggest serious consideration of a liquidity event within 6-12 months.",
    steps: ['Discuss timeline and expectations for business sale', 'Model after-tax proceeds and reinvestment scenarios', 'Review capital gains strategies including opportunity zones', 'Introduce wealth management transition plan'],
  },
  'c8-home_purchase': {
    transactions: [
      { merchant: 'Real Estate Attorney', amount: '$3,200', date: 'Jan 12', card: 'Platinum ...9922', relevance: 'Real estate legal review' },
      { merchant: 'Mortgage Pre-Approval', amount: '$450', date: 'Jan 18', card: 'Checking ...1155', relevance: 'Mortgage application fee' },
      { merchant: 'Zillow Premium', amount: '$29', date: 'Jan 5', card: 'Cashback ...6677', relevance: 'Property search subscription' },
    ],
    insight: "Client is in early-stage home search with legal and financing groundwork already underway. Pre-approval activity confirms intent to purchase within the quarter.",
    steps: ['Review investment portfolio for down payment liquidity', 'Compare mortgage options given existing asset base', 'Discuss property tax implications on overall financial plan', 'Coordinate timing with other financial goals'],
  },
  'c6-retirement': {
    transactions: [
      { merchant: 'Schwab Rollover IRA', amount: '$45,000', date: 'Jan 8', card: 'Checking ...2211', relevance: 'IRA rollover from previous employer' },
      { merchant: 'Retirement Income Calculator', amount: '$0', date: 'Dec 20', card: 'Web Activity', relevance: 'Online retirement planning tool usage' },
      { merchant: 'AAA Travel Agency', amount: '$3,200', date: 'Jan 25', card: 'Travel ...5566', relevance: 'Extended travel booking' },
    ],
    insight: "Client is consolidating retirement accounts and actively modeling income scenarios. Travel bookings suggest visualizing post-work lifestyle. Ideal moment to discuss withdrawal strategies and Social Security timing.",
    steps: ['Review consolidated retirement account allocation', 'Model Social Security claiming strategies (62 vs. 67 vs. 70)', 'Discuss systematic withdrawal plan vs. annuity options', 'Plan healthcare coverage bridge to Medicare'],
  },
  'c1-education': {
    transactions: [
      { merchant: 'College Board', amount: '$98', date: 'Jan 12', card: 'Platinum ...4532', relevance: 'SAT registration fees' },
      { merchant: 'Princeton Review', amount: '$1,299', date: 'Dec 15', card: 'Platinum ...4532', relevance: 'Test prep course enrollment' },
      { merchant: 'Southwest Airlines', amount: '$450', date: 'Jan 18', card: 'Travel Elite ...2234', relevance: 'Campus visit travel' },
      { merchant: 'Ivy Coach Admissions', amount: '$3,500', date: 'Jan 5', card: 'Cashback ...7891', relevance: 'College admissions consulting' },
    ],
    insight: "Parent is deep in the college planning research phase. SAT prep, admissions consulting, and campus visits show serious commitment. Ideal window for 529 optimization and financial aid positioning.",
    steps: ['Initiate 529 plan discussion—researching but no funding yet', 'Calculate projected costs for likely target schools', 'Review financial aid implications and FAFSA timing', 'Model parent vs. student loan scenarios'],
  },
  'c3-wealth_transfer': {
    transactions: [
      { merchant: 'Estate Attorney - Marks LLP', amount: '$5,500', date: 'Jan 5', card: 'Platinum ...8844', relevance: 'Estate planning engagement' },
      { merchant: 'Trust Documentation Services', amount: '$2,200', date: 'Jan 12', card: 'Checking ...3399', relevance: 'Trust establishment fees' },
      { merchant: 'IRS Gift Tax Research', amount: '$0', date: 'Dec 28', card: 'Web Activity', relevance: 'Gift tax exclusion research' },
    ],
    insight: "Client is actively establishing trust structures and researching gift tax strategies. The combination of estate attorney engagement and trust documentation indicates serious wealth transfer planning.",
    steps: ['Review current estate plan and identify gaps', 'Model annual gift exclusion strategies for family members', 'Discuss generation-skipping trust options', 'Coordinate with client estate attorney on trust funding'],
  },
  'c8-elder_care': {
    transactions: [
      { merchant: 'Medical Guardian', amount: '$350', date: 'Jan 10', card: 'Cashback ...6677', relevance: 'Medical alert system' },
      { merchant: 'Home Depot - Mobility', amount: '$890', date: 'Jan 15', card: 'Cashback ...6677', relevance: 'Accessibility modifications' },
      { merchant: 'Aging Life Care Assoc.', amount: '$450', date: 'Jan 18', card: 'Platinum ...9922', relevance: 'Geriatric care manager' },
    ],
    insight: "Client is stepping into a caregiver role. Medical alert system, accessibility modifications, and geriatric care manager indicate transitioning an aging family member to daily support.",
    steps: ['Assess long-term care insurance options', 'Review assets for Medicaid look-back period implications', 'Confirm power of attorney and healthcare proxy documents', 'Model assisted living vs. in-home care cost trajectories'],
  },
  'c4-family_formation': {
    transactions: [
      { merchant: 'Amazon Baby Registry', amount: '$1,850', date: 'Jan 15', card: 'Cashback ...4455', relevance: 'Baby registry purchases' },
      { merchant: 'Buy Buy Baby', amount: '$1,250', date: 'Jan 22', card: 'Cashback ...4455', relevance: 'Nursery essentials' },
      { merchant: 'Memorial Hospital', amount: '$2,500', date: 'Jan 30', card: 'Checking ...7788', relevance: 'Hospital pre-registration deposit' },
    ],
    insight: "Growing family preparing for a new arrival. Baby registry, nursery purchases, and hospital pre-registration confirm timeline clarity. No education savings or updated estate documents yet—proactive opportunity.",
    steps: ['Introduce 529 plan options for education savings', 'Benchmark life insurance: 10-12x income replacement', 'Update wills to include guardianship designations', 'Model childcare costs into financial plan'],
  },
  'c7-education': {
    transactions: [
      { merchant: 'Niche.com Premium', amount: '$49', date: 'Jan 8', card: 'Cashback ...3322', relevance: 'College research subscription' },
      { merchant: 'Campus Tour Booking', amount: '$180', date: 'Jan 20', card: 'Cashback ...3322', relevance: 'University campus visits' },
      { merchant: 'College Savings Calculator', amount: '$0', date: 'Dec 15', card: 'Web Activity', relevance: 'Education cost modeling' },
    ],
    insight: "Parent beginning early college research phase. Subscription services and campus tours show proactive planning. Early 529 contributions can significantly reduce future education funding burden.",
    steps: ['Open 529 plan and model monthly contribution targets', 'Compare in-state vs. out-of-state cost projections', 'Discuss merit scholarship strategies', 'Review education tax credits and deductions'],
  },
  'c3-elder_care': {
    transactions: [
      { merchant: 'AARP Medicare Supplement', amount: '$280', date: 'Jan 20', card: 'Checking ...3399', relevance: 'Medicare supplement premium' },
      { merchant: 'Sunrise Senior Living', amount: '$12,000', date: 'Jan 25', card: 'Checking ...3399', relevance: 'Assisted living deposit' },
    ],
    insight: "Client making significant financial commitments to elder care—assisted living deposit and Medicare supplement indicate imminent transition for a family member.",
    steps: ['Review elder care costs against current income and assets', 'Explore long-term care insurance retroactive options', 'Confirm healthcare proxy and legal documents', 'Model impact on client overall financial plan'],
  },
  'c5-wealth_transfer': {
    transactions: [
      { merchant: 'Dynasty Trust Advisors', amount: '$8,000', date: 'Feb 1', card: 'Business ...3344', relevance: 'Dynasty trust consultation' },
      { merchant: 'Charitable Giving Advisor', amount: '$1,500', date: 'Jan 28', card: 'Platinum ...5566', relevance: 'Philanthropic planning' },
    ],
    insight: "Client exploring advanced wealth transfer vehicles including dynasty trusts and charitable giving strategies, likely in anticipation of business liquidity event proceeds.",
    steps: ['Coordinate wealth transfer planning with business exit timeline', 'Model dynasty trust vs. GRAT structures', 'Discuss donor-advised fund for charitable giving efficiency', 'Review estate tax exposure under current regulations'],
  },
};

const SEGMENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Private: { bg: 'rgba(168,85,247,.15)', text: '#c084fc', border: 'rgba(168,85,247,.30)' },
  Premium: { bg: 'rgba(245,158,11,.15)', text: '#fbbf24', border: 'rgba(245,158,11,.30)' },
  Preferred: { bg: 'rgba(59,130,246,.15)', text: '#93c5fd', border: 'rgba(59,130,246,.30)' },
};

function wait(ms: number) { return new Promise(res => setTimeout(res, ms)); }

// ─── Component ────────────────────────────────────────────────────────────────

export default function VentusWealthDemo() {
  const [visibleRows, setVisibleRows] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<{ event: DemoEvent; client: DemoClient } | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<'building' | 'autoprepare' | 'complete'>('building');
  const tokenRef = useRef(0);
  const mountedRef = useRef(true);

  const getClient = useCallback((id: string) => CLIENTS.find(c => c.id === id)!, []);

  const urgentCount = EVENTS.filter(e => e.urgency === 'Urgent').length;
  const thisQuarterCount = EVENTS.filter(e => e.timing.includes('Q1') || e.timing.includes('Q2')).length;

  // Animated metrics
  const displayedClients = Math.min(new Set(EVENTS.slice(0, visibleRows).map(e => e.clientId)).size, CLIENTS.length);
  const displayedEvents = visibleRows;
  const displayedUrgent = EVENTS.slice(0, visibleRows).filter(e => e.urgency === 'Urgent').length;
  const displayedQuarter = EVENTS.slice(0, visibleRows).filter(e => e.timing.includes('Q1') || e.timing.includes('Q2')).length;

  const handlePrepare = useCallback((event: DemoEvent) => {
    const client = CLIENTS.find(c => c.id === event.clientId)!;
    setSelectedEvent({ event, client });
    setDetailVisible(true);
    setIsPaused(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setTimeout(() => setSelectedEvent(null), 300);
  }, []);

  // Cycle order: mix of urgent/soon/upcoming for variety
  const CYCLE_ORDER = [0, 2, 5, 8, 3, 6, 10, 1, 7, 4, 9, 11];

  const runAnimation = useCallback(async (myToken: number) => {
    // Phase 1: Build all 12 rows
    setVisibleRows(0);
    setPhase('building');
    setSelectedEvent(null);
    setDetailVisible(false);

    for (let i = 1; i <= EVENTS.length; i++) {
      if (myToken !== tokenRef.current || !mountedRef.current) return;
      setVisibleRows(i);
      await wait(350);
    }

    if (myToken !== tokenRef.current || !mountedRef.current) return;
    await wait(1200);

    // Phase 2: Cycle through clicking into different events endlessly
    setPhase('autoprepare');
    let cycleIdx = 0;

    while (myToken === tokenRef.current && mountedRef.current) {
      const eventIdx = CYCLE_ORDER[cycleIdx % CYCLE_ORDER.length];
      const event = EVENTS[eventIdx];
      const client = CLIENTS.find(c => c.id === event.clientId)!;

      setSelectedEvent({ event, client });
      setDetailVisible(true);

      await wait(5000);
      if (myToken !== tokenRef.current || !mountedRef.current) return;

      setDetailVisible(false);
      await wait(400);
      if (myToken !== tokenRef.current || !mountedRef.current) return;
      setSelectedEvent(null);

      await wait(1200);
      if (myToken !== tokenRef.current || !mountedRef.current) return;

      cycleIdx++;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start animation on mount
  useEffect(() => {
    mountedRef.current = true;
    const myToken = ++tokenRef.current;
    runAnimation(myToken);
    return () => { mountedRef.current = false; tokenRef.current++; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    tokenRef.current++;
    setVisibleRows(0);
    setSelectedEvent(null);
    setDetailVisible(false);
    setIsPaused(false);
    setPhase('building');
    mountedRef.current = true;
    const myToken = ++tokenRef.current;
    runAnimation(myToken);
  };

  const urgencyBadge = (urgency: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Urgent: { bg: 'rgba(239,68,68,.12)', text: '#f87171', border: 'rgba(239,68,68,.30)' },
      Soon: { bg: 'rgba(245,158,11,.12)', text: '#fbbf24', border: 'rgba(245,158,11,.30)' },
      Upcoming: { bg: 'rgba(59,130,246,.12)', text: '#93c5fd', border: 'rgba(59,130,246,.30)' },
    };
    return colors[urgency] || colors.Upcoming;
  };

  const detail = selectedEvent
    ? DETAILS[`${selectedEvent.event.clientId}-${selectedEvent.event.eventType}`]
    : null;

  return (
    <>
      <style>{`
        .vwm-root {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #ffffff;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        .vwm-root *, .vwm-root *::before, .vwm-root *::after { box-sizing: border-box; }

        .vwm-dashboard-header {
          padding: 16px 20px 12px;
          background: rgba(255,255,255,.06);
          border-bottom: 1px solid rgba(255,255,255,.12);
        }
        .vwm-dash-title {
          font-weight: 760; letter-spacing: -.02em; font-size: 16px; color: #fff;
        }
        .vwm-dash-title .vwm-powered {
          font-size: 12px; font-weight: 500; color: rgba(255,255,255,.45); margin-left: 8px;
        }
        .vwm-dash-subtitle {
          font-size: 12px; color: rgba(255,255,255,.45); margin-top: 4px;
        }

        /* Metrics bar */
        .vwm-metrics {
          display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .vwm-metric-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 10px;
          font-size: 12px; font-weight: 600;
        }
        .vwm-metric-pill.clients { background: rgba(255,255,255,.06); color: rgba(255,255,255,.70); }
        .vwm-metric-pill.urgent { background: rgba(239,68,68,.10); color: #fca5a5; }
        .vwm-metric-pill.quarter { background: rgba(245,158,11,.10); color: #fcd34d; }
        .vwm-metric-pill.total { background: rgba(59,130,246,.10); color: #93c5fd; }
        .vwm-metric-pill .num { font-weight: 800; font-variant-numeric: tabular-nums; }

        /* Controls row */
        .vwm-controls-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .vwm-phase-label {
          font-size: 11px; color: rgba(255,255,255,.50); font-weight: 600;
        }
        .vwm-ctrl-btns { display: flex; gap: 8px; }
        .vwm-ctrl-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(255,255,255,.20); background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.80); cursor: pointer; transition: all .2s;
        }
        .vwm-ctrl-btn:hover { background: rgba(255,255,255,.15); }
        .vwm-ctrl-btn.primary { background: rgba(255,255,255,.88); color: #0b1a3a; border-color: transparent; }
        .vwm-ctrl-btn.primary:hover { background: #fff; }

        /* Alert rows list */
        .vwm-alert-list {
          max-height: 520px; overflow-y: auto; padding: 8px 12px;
        }
        .vwm-alert-list::-webkit-scrollbar { width: 8px; }
        .vwm-alert-list::-webkit-scrollbar-track { background: transparent; }
        .vwm-alert-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 999px; }

        /* Individual alert row */
        .vwm-alert-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; margin-bottom: 4px;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 14px;
          background: rgba(255,255,255,.04);
          transition: all .2s;
          animation: vwm-rowIn .35s ease both;
        }
        .vwm-alert-row:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.18); }
        @keyframes vwm-rowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .vwm-row-icon {
          flex: 0 0 36px; height: 36px; border-radius: 10px;
          display: grid; place-items: center; font-size: 18px;
        }
        .vwm-row-info { flex: 1; min-width: 0; }
        .vwm-row-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .vwm-row-name { font-weight: 720; font-size: 13px; color: #fff; white-space: nowrap; }
        .vwm-row-aum { font-size: 11px; color: rgba(255,255,255,.55); font-weight: 600; }
        .vwm-seg-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
          border: 1px solid;
        }
        .vwm-row-middle { display: flex; align-items: center; gap: 8px; margin-top: 3px; flex-wrap: wrap; }
        .vwm-event-name { font-size: 12px; font-weight: 660; color: rgba(255,255,255,.85); }
        .vwm-urg-badge {
          font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 999px;
          border: 1px solid; text-transform: uppercase; letter-spacing: .03em;
        }
        .vwm-conf-pill {
          font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
          border: 1px solid;
        }
        .vwm-timing-text { font-size: 10px; color: rgba(255,255,255,.40); }
        .vwm-row-evidence {
          font-size: 10px; color: rgba(255,255,255,.40); margin-top: 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .vwm-row-actions { flex: 0 0 auto; display: flex; gap: 6px; }
        .vwm-row-btn {
          padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.80); cursor: pointer; transition: all .2s;
          white-space: nowrap;
        }
        .vwm-row-btn:hover { background: rgba(255,255,255,.14); }
        .vwm-row-btn.prepare { background: rgba(255,255,255,.88); color: #0b1a3a; border-color: transparent; }
        .vwm-row-btn.prepare:hover { background: #fff; }

        /* Detail overlay */
        .vwm-detail-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: rgba(8,12,24,.95);
          backdrop-filter: blur(8px);
          display: flex; flex-direction: column;
          transition: opacity .3s, transform .3s;
        }
        .vwm-detail-overlay.entering { opacity: 1; transform: translateY(0); }
        .vwm-detail-overlay.exiting { opacity: 0; transform: translateY(12px); }
        .vwm-detail-header {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.12);
        }
        .vwm-detail-header-left { display: flex; align-items: center; gap: 12px; }
        .vwm-detail-icon { font-size: 24px; }
        .vwm-detail-title { font-weight: 760; font-size: 16px; color: #fff; }
        .vwm-detail-client-name { font-size: 13px; color: rgba(255,255,255,.55); }
        .vwm-back-btn {
          padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 700;
          border: 1px solid rgba(255,255,255,.20); background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.80); cursor: pointer; transition: all .2s;
        }
        .vwm-back-btn:hover { background: rgba(255,255,255,.15); }
        .vwm-detail-body {
          flex: 1; overflow-y: auto; padding: 16px 20px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        @media (max-width: 700px) { .vwm-detail-body { grid-template-columns: 1fr; } }
        .vwm-detail-section-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
          color: rgba(255,255,255,.45); margin-bottom: 8px;
        }
        .vwm-detail-tx {
          padding: 8px 10px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.04);
          margin-bottom: 6px;
        }
        .vwm-detail-tx-top { display: flex; justify-content: space-between; align-items: center; }
        .vwm-detail-tx-merchant { font-size: 12px; font-weight: 680; color: #fff; }
        .vwm-detail-tx-amount { font-size: 12px; font-weight: 720; color: rgba(255,255,255,.90); font-variant-numeric: tabular-nums; }
        .vwm-detail-tx-bottom { display: flex; gap: 8px; align-items: center; margin-top: 3px; }
        .vwm-detail-tx-card {
          font-size: 9px; padding: 2px 6px; border-radius: 999px;
          background: rgba(139,92,246,.15); border: 1px solid rgba(139,92,246,.25);
          color: rgba(196,181,253,.9);
        }
        .vwm-detail-tx-date { font-size: 10px; color: rgba(255,255,255,.40); }
        .vwm-detail-tx-relevance { font-size: 10px; color: rgba(255,255,255,.45); font-style: italic; margin-left: auto; }
        .vwm-detail-right { display: flex; flex-direction: column; gap: 16px; }
        .vwm-insight-box {
          padding: 12px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.04);
        }
        .vwm-insight-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.50); margin-bottom: 6px; }
        .vwm-insight-text { font-size: 12px; color: rgba(255,255,255,.65); line-height: 1.55; }
        .vwm-steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        .vwm-step-item {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 12px; color: rgba(255,255,255,.70); line-height: 1.4;
        }
        .vwm-step-num-circle {
          flex: 0 0 20px; height: 20px; border-radius: 50%;
          display: grid; place-items: center;
          font-size: 10px; font-weight: 700;
          background: rgba(255,255,255,.08); color: rgba(255,255,255,.60);
        }

        /* Empty state */
        .vwm-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 20px; color: rgba(255,255,255,.30);
        }
        .vwm-empty-icon { font-size: 36px; margin-bottom: 12px; }
        .vwm-empty-text { font-size: 14px; font-weight: 600; }
        .vwm-empty-sub { font-size: 12px; margin-top: 4px; }

        .vwm-scale-wrapper { transform-origin: top center; }
        @media (max-width: 1024px) { .vwm-scale-wrapper { transform: scale(0.7); margin-bottom: -30%; } }
        @media (max-width: 767px) { .vwm-scale-wrapper { transform: scale(0.5); margin-bottom: -50%; } }
      `}</style>

      <div className="vwm-scale-wrapper">
        <div className="vwm-root">
          {/* Header */}
          <div className="vwm-dashboard-header">
            <div className="vwm-dash-title">
              Wealth Management Client Life Event Intelligence
              <span className="vwm-powered">Powered by Ventus AI</span>
            </div>
            <div className="vwm-dash-subtitle">
              {displayedClients} clients with upcoming life events need attention
            </div>
          </div>

          {/* Metrics */}
          <div className="vwm-metrics">
            <span className="vwm-metric-pill clients">
              👥 <span className="num">{displayedClients}</span> Clients
            </span>
            <span className="vwm-metric-pill urgent">
              ⚠️ <span className="num">{displayedUrgent}</span> Urgent
            </span>
            <span className="vwm-metric-pill quarter">
              🕐 <span className="num">{displayedQuarter}</span> This Quarter
            </span>
            <span className="vwm-metric-pill total">
              📅 <span className="num">{displayedEvents}</span> Total Events
            </span>
          </div>

          {/* Controls */}
          <div className="vwm-controls-row">
            <span className="vwm-phase-label">
              {phase === 'building' && visibleRows < EVENTS.length && `Detecting events... ${visibleRows}/${EVENTS.length}`}
              {phase === 'building' && visibleRows >= EVENTS.length && 'All events detected'}
              {phase === 'autoprepare' && 'Viewing preparation details'}
              {phase === 'complete' && 'Analysis complete · Restarting...'}
            </span>
            <div className="vwm-ctrl-btns">
              <button className="vwm-ctrl-btn primary" onClick={() => setIsPaused(p => !p)}>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="vwm-ctrl-btn" onClick={handleReset}>Reset</button>
            </div>
          </div>

          {/* Alert rows */}
          <div className="vwm-alert-list">
            {visibleRows === 0 && (
              <div className="vwm-empty">
                <div className="vwm-empty-icon">🔍</div>
                <div className="vwm-empty-text">Scanning client portfolios...</div>
                <div className="vwm-empty-sub">Detecting life event signals from transaction patterns</div>
              </div>
            )}
            {EVENTS.slice(0, visibleRows).map((event, idx) => {
              const client = getClient(event.clientId);
              const seg = SEGMENT_STYLES[client.segment];
              const urg = urgencyBadge(event.urgency);
              return (
                <div key={`${event.clientId}-${event.eventType}-${idx}`} className="vwm-alert-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="vwm-row-icon" style={{ background: `${event.color}18` }}>
                    {event.icon}
                  </div>
                  <div className="vwm-row-info">
                    <div className="vwm-row-top">
                      <span className="vwm-row-name">{client.name}</span>
                      <span className="vwm-row-aum">{client.aum}</span>
                      <span className="vwm-seg-badge" style={{ background: seg.bg, color: seg.text, borderColor: seg.border }}>
                        {client.segment}
                      </span>
                    </div>
                    <div className="vwm-row-middle">
                      <span className="vwm-event-name" style={{ color: event.color }}>{event.eventName}</span>
                      <span className="vwm-urg-badge" style={{ background: urg.bg, color: urg.text, borderColor: urg.border }}>
                        {event.urgency}
                      </span>
                      <span className="vwm-conf-pill" style={{ background: `${event.color}15`, color: event.color, borderColor: `${event.color}30` }}>
                        {event.confidence}%
                      </span>
                      <span className="vwm-timing-text">{event.timing}</span>
                    </div>
                    <div className="vwm-row-evidence">{event.evidence}</div>
                  </div>
                  <div className="vwm-row-actions">
                    {DETAILS[`${event.clientId}-${event.eventType}`] && (
                      <button className="vwm-row-btn prepare" onClick={() => handlePrepare(event)}>Prepare</button>
                    )}
                    <button className="vwm-row-btn">View</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail overlay */}
          {selectedEvent && detail && (
            <div className={`vwm-detail-overlay ${detailVisible ? 'entering' : 'exiting'}`}>
              <div className="vwm-detail-header">
                <div className="vwm-detail-header-left">
                  <span className="vwm-detail-icon">{selectedEvent.event.icon}</span>
                  <div>
                    <div className="vwm-detail-title">{selectedEvent.event.eventName}</div>
                    <div className="vwm-detail-client-name">
                      {selectedEvent.client.name} · {selectedEvent.client.segment} · {selectedEvent.client.aum} · {selectedEvent.event.confidence}% confidence
                    </div>
                  </div>
                </div>
                <button className="vwm-back-btn" onClick={handleCloseDetail}>← Back to Dashboard</button>
              </div>
              <div className="vwm-detail-body">
                {/* Left: Transactions */}
                <div>
                  <div className="vwm-detail-section-title">📋 Supporting Transactions ({detail.transactions.length})</div>
                  {detail.transactions.map((tx, i) => (
                    <div key={i} className="vwm-detail-tx">
                      <div className="vwm-detail-tx-top">
                        <span className="vwm-detail-tx-merchant">{tx.merchant}</span>
                        <span className="vwm-detail-tx-amount">{tx.amount}</span>
                      </div>
                      <div className="vwm-detail-tx-bottom">
                        <span className="vwm-detail-tx-card">{tx.card}</span>
                        <span className="vwm-detail-tx-date">{tx.date}</span>
                        <span className="vwm-detail-tx-relevance">{tx.relevance}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Right: Insight + Steps */}
                <div className="vwm-detail-right">
                  <div>
                    <div className="vwm-detail-section-title">✨ Ventus AI Insight</div>
                    <div className="vwm-insight-box">
                      <div className="vwm-insight-text">{detail.insight}</div>
                    </div>
                  </div>
                  <div>
                    <div className="vwm-detail-section-title">📋 Recommended Next Steps</div>
                    <ol className="vwm-steps-list">
                      {detail.steps.map((step, i) => (
                        <li key={i} className="vwm-step-item">
                          <span className="vwm-step-num-circle">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
