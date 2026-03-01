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

interface DemoTx {
  merchant: string;
  amount: string;
  date: string;
  card: string;
  cardType: 'checking' | 'platinum' | 'cashback' | 'travel' | 'business' | 'web';
  relevance: string;
}

interface DemoDetail {
  transactions: DemoTx[];
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
      { merchant: 'Fidelity Investments', amount: '$6,500', date: 'Jan 15', card: 'Platinum ...4532', cardType: 'platinum', relevance: '401k contribution increase' },
      { merchant: 'AARP Membership', amount: '$16', date: 'Dec 28', card: 'Cashback ...7891', cardType: 'cashback', relevance: 'Retirement association enrollment' },
      { merchant: 'Viking Cruises', amount: '$8,500', date: 'Jan 20', card: 'Travel Elite ...2234', cardType: 'travel', relevance: 'Retirement travel planning' },
      { merchant: 'Estate Planning Attorney', amount: '$2,500', date: 'Jan 18', card: 'Checking ...5678', cardType: 'checking', relevance: 'Estate planning consultation' },
      { merchant: 'Social Security Admin', amount: '$0', date: 'Jan 22', card: 'Web Activity', cardType: 'web', relevance: 'Benefits estimator research' },
      { merchant: 'Vanguard Target Date Fund', amount: '$12,000', date: 'Jan 25', card: 'Checking ...5678', cardType: 'checking', relevance: 'Target date fund rebalance' },
      { merchant: 'Medicare.gov', amount: '$0', date: 'Jan 28', card: 'Web Activity', cardType: 'web', relevance: 'Medicare eligibility research' },
    ],
    insight: "Client is in early exploration of retirement—increased 401k, AARP enrollment, and cruise booking reveal aspirations for an active, travel-rich next chapter. Critical window for Roth conversions and income strategies.",
    steps: ['Open conversation about retirement vision and ideal lifestyle', 'Introduce retirement income modeling with 401k trajectory', 'Discuss Roth conversion strategy during remaining working years', 'Review healthcare bridge options before Medicare eligibility'],
  },
  'c2-home_purchase': {
    transactions: [
      { merchant: 'Earnest Money Deposit', amount: '$15,000', date: 'Jan 20', card: 'Checking ...5678', cardType: 'checking', relevance: 'Home purchase deposit' },
      { merchant: 'Home Depot', amount: '$2,340', date: 'Feb 1', card: 'Cashback ...7891', cardType: 'cashback', relevance: 'Home improvement supplies' },
      { merchant: 'U-Haul', amount: '$890', date: 'Feb 5', card: 'Cashback ...7891', cardType: 'cashback', relevance: 'Moving rental booking' },
      { merchant: 'Wire - Closing Costs', amount: '$8,500', date: 'Jan 28', card: 'Checking ...5678', cardType: 'checking', relevance: 'Title and closing fees' },
      { merchant: "Lowe's Hardware", amount: '$1,180', date: 'Feb 8', card: 'Cashback ...7891', cardType: 'cashback', relevance: 'Renovation materials' },
      { merchant: 'Title Insurance Co.', amount: '$1,950', date: 'Jan 30', card: 'Checking ...5678', cardType: 'checking', relevance: 'Title insurance premium' },
      { merchant: 'Home Inspection Services', amount: '$575', date: 'Jan 16', card: 'Checking ...5678', cardType: 'checking', relevance: 'Pre-purchase inspection' },
    ],
    insight: "Client is in active home acquisition mode. Earnest money and closing costs confirm imminent transaction. Home improvement and moving activity show firm timeline.",
    steps: ['Analyze liquid assets for down payment without disrupting investments', 'Compare mortgage scenarios: 15 vs. 30-year, ARM vs. fixed', 'Model post-purchase cash flow including PITI and maintenance', 'Review homeowners insurance and umbrella liability coverage'],
  },
  'c5-business_liquidity': {
    transactions: [
      { merchant: 'BizBuySell Valuation', amount: '$4,500', date: 'Jan 10', card: 'Business ...3344', cardType: 'business', relevance: 'Business valuation service' },
      { merchant: 'M&A Legal Partners', amount: '$12,000', date: 'Jan 15', card: 'Business ...3344', cardType: 'business', relevance: 'M&A attorney retainer' },
      { merchant: 'Goldman Sachs Advisory', amount: '$25,000', date: 'Jan 22', card: 'Business ...3344', cardType: 'business', relevance: 'Investment banking advisory' },
      { merchant: 'Ernst & Young Tax Advisory', amount: '$8,500', date: 'Jan 18', card: 'Business ...3344', cardType: 'business', relevance: 'Tax structuring consultation' },
      { merchant: 'Business Insurance Review', amount: '$1,200', date: 'Jan 25', card: 'Business ...3344', cardType: 'business', relevance: 'Insurance policy audit' },
      { merchant: 'KPMG Due Diligence', amount: '$15,000', date: 'Feb 2', card: 'Business ...3344', cardType: 'business', relevance: 'Financial due diligence prep' },
    ],
    insight: "Client is exploring exit options for their business. Valuation, legal, and advisory fees suggest serious consideration of a liquidity event within 6-12 months.",
    steps: ['Discuss timeline and expectations for business sale', 'Model after-tax proceeds and reinvestment scenarios', 'Review capital gains strategies including opportunity zones', 'Introduce wealth management transition plan'],
  },
  'c8-home_purchase': {
    transactions: [
      { merchant: 'Real Estate Attorney', amount: '$3,200', date: 'Jan 12', card: 'Platinum ...9922', cardType: 'platinum', relevance: 'Real estate legal review' },
      { merchant: 'Mortgage Pre-Approval', amount: '$450', date: 'Jan 18', card: 'Checking ...1155', cardType: 'checking', relevance: 'Mortgage application fee' },
      { merchant: 'Zillow Premium', amount: '$29', date: 'Jan 5', card: 'Cashback ...6677', cardType: 'cashback', relevance: 'Property search subscription' },
      { merchant: 'Home Appraisal Services', amount: '$650', date: 'Jan 22', card: 'Checking ...1155', cardType: 'checking', relevance: 'Property appraisal' },
      { merchant: 'Redfin Pro Subscription', amount: '$15', date: 'Jan 3', card: 'Cashback ...6677', cardType: 'cashback', relevance: 'Property market analysis' },
    ],
    insight: "Client is in early-stage home search with legal and financing groundwork already underway. Pre-approval activity confirms intent to purchase within the quarter.",
    steps: ['Review investment portfolio for down payment liquidity', 'Compare mortgage options given existing asset base', 'Discuss property tax implications on overall financial plan', 'Coordinate timing with other financial goals'],
  },
  'c6-retirement': {
    transactions: [
      { merchant: 'Schwab Rollover IRA', amount: '$45,000', date: 'Jan 8', card: 'Checking ...2211', cardType: 'checking', relevance: 'IRA rollover from previous employer' },
      { merchant: 'Retirement Income Calculator', amount: '$0', date: 'Dec 20', card: 'Web Activity', cardType: 'web', relevance: 'Online retirement planning tool usage' },
      { merchant: 'AAA Travel Agency', amount: '$3,200', date: 'Jan 25', card: 'Travel ...5566', cardType: 'travel', relevance: 'Extended travel booking' },
      { merchant: 'Fidelity Roth Conversion', amount: '$22,000', date: 'Jan 12', card: 'Checking ...2211', cardType: 'checking', relevance: 'Roth IRA conversion' },
      { merchant: 'Social Security Office', amount: '$0', date: 'Jan 15', card: 'Web Activity', cardType: 'web', relevance: 'Claiming strategy research' },
      { merchant: 'LongTermCare.gov', amount: '$0', date: 'Jan 20', card: 'Web Activity', cardType: 'web', relevance: 'Long-term care insurance research' },
    ],
    insight: "Client is consolidating retirement accounts and actively modeling income scenarios. Travel bookings suggest visualizing post-work lifestyle. Ideal moment to discuss withdrawal strategies and Social Security timing.",
    steps: ['Review consolidated retirement account allocation', 'Model Social Security claiming strategies (62 vs. 67 vs. 70)', 'Discuss systematic withdrawal plan vs. annuity options', 'Plan healthcare coverage bridge to Medicare'],
  },
  'c1-education': {
    transactions: [
      { merchant: 'College Board', amount: '$98', date: 'Jan 12', card: 'Platinum ...4532', cardType: 'platinum', relevance: 'SAT registration fees' },
      { merchant: 'Princeton Review', amount: '$1,299', date: 'Dec 15', card: 'Platinum ...4532', cardType: 'platinum', relevance: 'Test prep course enrollment' },
      { merchant: 'Southwest Airlines', amount: '$450', date: 'Jan 18', card: 'Travel Elite ...2234', cardType: 'travel', relevance: 'Campus visit travel' },
      { merchant: 'Ivy Coach Admissions', amount: '$3,500', date: 'Jan 5', card: 'Cashback ...7891', cardType: 'cashback', relevance: 'College admissions consulting' },
      { merchant: 'Kaplan Test Prep', amount: '$899', date: 'Jan 8', card: 'Platinum ...4532', cardType: 'platinum', relevance: 'Additional test prep course' },
      { merchant: 'FAFSA Application', amount: '$0', date: 'Jan 20', card: 'Web Activity', cardType: 'web', relevance: 'Financial aid application' },
    ],
    insight: "Parent is deep in the college planning research phase. SAT prep, admissions consulting, and campus visits show serious commitment. Ideal window for 529 optimization and financial aid positioning.",
    steps: ['Initiate 529 plan discussion—researching but no funding yet', 'Calculate projected costs for likely target schools', 'Review financial aid implications and FAFSA timing', 'Model parent vs. student loan scenarios'],
  },
  'c3-wealth_transfer': {
    transactions: [
      { merchant: 'Estate Attorney - Marks LLP', amount: '$5,500', date: 'Jan 5', card: 'Platinum ...8844', cardType: 'platinum', relevance: 'Estate planning engagement' },
      { merchant: 'Trust Documentation Services', amount: '$2,200', date: 'Jan 12', card: 'Checking ...3399', cardType: 'checking', relevance: 'Trust establishment fees' },
      { merchant: 'IRS Gift Tax Research', amount: '$0', date: 'Dec 28', card: 'Web Activity', cardType: 'web', relevance: 'Gift tax exclusion research' },
      { merchant: 'Charitable Remainder Trust Co.', amount: '$3,800', date: 'Jan 15', card: 'Checking ...3399', cardType: 'checking', relevance: 'CRT setup consultation' },
      { merchant: 'Family Wealth Advisors', amount: '$4,200', date: 'Jan 20', card: 'Platinum ...8844', cardType: 'platinum', relevance: 'Multi-generational planning' },
    ],
    insight: "Client is actively establishing trust structures and researching gift tax strategies. The combination of estate attorney engagement and trust documentation indicates serious wealth transfer planning.",
    steps: ['Review current estate plan and identify gaps', 'Model annual gift exclusion strategies for family members', 'Discuss generation-skipping trust options', 'Coordinate with client estate attorney on trust funding'],
  },
  'c8-elder_care': {
    transactions: [
      { merchant: 'Medical Guardian', amount: '$350', date: 'Jan 10', card: 'Cashback ...6677', cardType: 'cashback', relevance: 'Medical alert system' },
      { merchant: 'Home Depot - Mobility', amount: '$890', date: 'Jan 15', card: 'Cashback ...6677', cardType: 'cashback', relevance: 'Accessibility modifications' },
      { merchant: 'Aging Life Care Assoc.', amount: '$450', date: 'Jan 18', card: 'Platinum ...9922', cardType: 'platinum', relevance: 'Geriatric care manager' },
      { merchant: 'Walgreens Pharmacy', amount: '$285', date: 'Jan 20', card: 'Cashback ...6677', cardType: 'cashback', relevance: 'Prescription medication supplies' },
      { merchant: 'Visiting Angels Home Care', amount: '$2,400', date: 'Jan 25', card: 'Checking ...1155', cardType: 'checking', relevance: 'In-home care service' },
    ],
    insight: "Client is stepping into a caregiver role. Medical alert system, accessibility modifications, and geriatric care manager indicate transitioning an aging family member to daily support.",
    steps: ['Assess long-term care insurance options', 'Review assets for Medicaid look-back period implications', 'Confirm power of attorney and healthcare proxy documents', 'Model assisted living vs. in-home care cost trajectories'],
  },
  'c4-family_formation': {
    transactions: [
      { merchant: 'Amazon Baby Registry', amount: '$1,850', date: 'Jan 15', card: 'Cashback ...4455', cardType: 'cashback', relevance: 'Baby registry purchases' },
      { merchant: 'Buy Buy Baby', amount: '$1,250', date: 'Jan 22', card: 'Cashback ...4455', cardType: 'cashback', relevance: 'Nursery essentials' },
      { merchant: 'Memorial Hospital', amount: '$2,500', date: 'Jan 30', card: 'Checking ...7788', cardType: 'checking', relevance: 'Hospital pre-registration deposit' },
      { merchant: 'Pottery Barn Kids', amount: '$980', date: 'Jan 25', card: 'Platinum ...4455', cardType: 'platinum', relevance: 'Nursery furniture' },
      { merchant: 'State Farm Life Insurance', amount: '$0', date: 'Jan 18', card: 'Web Activity', cardType: 'web', relevance: 'Life insurance quote research' },
      { merchant: 'Bright Horizons Childcare', amount: '$250', date: 'Feb 1', card: 'Checking ...7788', cardType: 'checking', relevance: 'Childcare waitlist deposit' },
    ],
    insight: "Growing family preparing for a new arrival. Baby registry, nursery purchases, and hospital pre-registration confirm timeline clarity. No education savings or updated estate documents yet—proactive opportunity.",
    steps: ['Introduce 529 plan options for education savings', 'Benchmark life insurance: 10-12x income replacement', 'Update wills to include guardianship designations', 'Model childcare costs into financial plan'],
  },
  'c7-education': {
    transactions: [
      { merchant: 'Niche.com Premium', amount: '$49', date: 'Jan 8', card: 'Cashback ...3322', cardType: 'cashback', relevance: 'College research subscription' },
      { merchant: 'Campus Tour Booking', amount: '$180', date: 'Jan 20', card: 'Cashback ...3322', cardType: 'cashback', relevance: 'University campus visits' },
      { merchant: 'College Savings Calculator', amount: '$0', date: 'Dec 15', card: 'Web Activity', cardType: 'web', relevance: 'Education cost modeling' },
      { merchant: 'Cappex Scholarship Search', amount: '$0', date: 'Jan 10', card: 'Web Activity', cardType: 'web', relevance: 'Scholarship database research' },
      { merchant: 'Barnes & Noble - SAT Prep', amount: '$85', date: 'Jan 15', card: 'Cashback ...3322', cardType: 'cashback', relevance: 'Test prep materials' },
    ],
    insight: "Parent beginning early college research phase. Subscription services and campus tours show proactive planning. Early 529 contributions can significantly reduce future education funding burden.",
    steps: ['Open 529 plan and model monthly contribution targets', 'Compare in-state vs. out-of-state cost projections', 'Discuss merit scholarship strategies', 'Review education tax credits and deductions'],
  },
  'c3-elder_care': {
    transactions: [
      { merchant: 'AARP Medicare Supplement', amount: '$280', date: 'Jan 20', card: 'Checking ...3399', cardType: 'checking', relevance: 'Medicare supplement premium' },
      { merchant: 'Sunrise Senior Living', amount: '$12,000', date: 'Jan 25', card: 'Checking ...3399', cardType: 'checking', relevance: 'Assisted living deposit' },
      { merchant: 'Elder Law Attorney', amount: '$3,500', date: 'Jan 28', card: 'Platinum ...8844', cardType: 'platinum', relevance: 'Elder care legal planning' },
      { merchant: 'CVS Pharmacy - Supplies', amount: '$340', date: 'Feb 1', card: 'Cashback ...3322', cardType: 'cashback', relevance: 'Medical supplies' },
      { merchant: 'Comfort Keepers', amount: '$1,800', date: 'Feb 3', card: 'Checking ...3399', cardType: 'checking', relevance: 'Transitional home care' },
    ],
    insight: "Client making significant financial commitments to elder care—assisted living deposit and Medicare supplement indicate imminent transition for a family member.",
    steps: ['Review elder care costs against current income and assets', 'Explore long-term care insurance retroactive options', 'Confirm healthcare proxy and legal documents', 'Model impact on client overall financial plan'],
  },
  'c5-wealth_transfer': {
    transactions: [
      { merchant: 'Dynasty Trust Advisors', amount: '$8,000', date: 'Feb 1', card: 'Business ...3344', cardType: 'business', relevance: 'Dynasty trust consultation' },
      { merchant: 'Charitable Giving Advisor', amount: '$1,500', date: 'Jan 28', card: 'Platinum ...5566', cardType: 'platinum', relevance: 'Philanthropic planning' },
      { merchant: 'Fidelity Donor-Advised Fund', amount: '$50,000', date: 'Feb 5', card: 'Checking ...7788', cardType: 'checking', relevance: 'DAF initial contribution' },
      { merchant: 'Tax Foundation Research', amount: '$0', date: 'Jan 25', card: 'Web Activity', cardType: 'web', relevance: 'Estate tax law research' },
      { merchant: 'Family Office Network', amount: '$2,500', date: 'Feb 8', card: 'Business ...3344', cardType: 'business', relevance: 'Family office setup consultation' },
    ],
    insight: "Client exploring advanced wealth transfer vehicles including dynasty trusts and charitable giving strategies, likely in anticipation of business liquidity event proceeds.",
    steps: ['Coordinate wealth transfer planning with business exit timeline', 'Model dynasty trust vs. GRAT structures', 'Discuss donor-advised fund for charitable giving efficiency', 'Review estate tax exposure under current regulations'],
  },
};

const CARD_TYPE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  checking:  { bg: 'rgba(59,130,246,.12)',  text: '#2563eb', border: 'rgba(59,130,246,.30)',  dot: '#3b82f6' },
  platinum:  { bg: 'rgba(168,85,247,.12)',  text: '#7c3aed', border: 'rgba(168,85,247,.30)',  dot: '#a855f7' },
  cashback:  { bg: 'rgba(34,197,94,.12)',   text: '#16a34a', border: 'rgba(34,197,94,.30)',   dot: '#22c55e' },
  travel:    { bg: 'rgba(245,158,11,.12)',  text: '#d97706', border: 'rgba(245,158,11,.30)',  dot: '#f59e0b' },
  business:  { bg: 'rgba(100,116,139,.12)', text: '#475569', border: 'rgba(100,116,139,.30)', dot: '#64748b' },
  web:       { bg: 'rgba(6,182,212,.12)',   text: '#0891b2', border: 'rgba(6,182,212,.30)',   dot: '#06b6d4' },
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
  const [insightWordCount, setInsightWordCount] = useState(0);
  const [stepsShown, setStepsShown] = useState(0);
  const [activeRowIdx, setActiveRowIdx] = useState<number | null>(null);
  const tokenRef = useRef(0);
  const mountedRef = useRef(true);
  const insightIntervalRef = useRef<number | null>(null);
  const stepsIntervalRef = useRef<number | null>(null);
  const alertListRef = useRef<HTMLDivElement | null>(null);

  const getClient = useCallback((id: string) => CLIENTS.find(c => c.id === id)!, []);

  // Animated metrics
  const displayedClients = Math.min(new Set(EVENTS.slice(0, visibleRows).map(e => e.clientId)).size, CLIENTS.length);
  const displayedEvents = visibleRows;
  const displayedUrgent = EVENTS.slice(0, visibleRows).filter(e => e.urgency === 'Urgent').length;
  const displayedQuarter = EVENTS.slice(0, visibleRows).filter(e => e.timing.includes('Q1') || e.timing.includes('Q2')).length;

  const clearAnimIntervals = useCallback(() => {
    if (insightIntervalRef.current) { clearInterval(insightIntervalRef.current); insightIntervalRef.current = null; }
    if (stepsIntervalRef.current) { clearInterval(stepsIntervalRef.current); stepsIntervalRef.current = null; }
  }, []);

  const startInsightAnimation = useCallback((detail: DemoDetail) => {
    clearAnimIntervals();
    setInsightWordCount(0);
    setStepsShown(0);
    const words = detail.insight.split(' ');
    let wordIdx = 0;
    insightIntervalRef.current = window.setInterval(() => {
      wordIdx++;
      setInsightWordCount(wordIdx);
      if (wordIdx >= words.length) {
        if (insightIntervalRef.current) clearInterval(insightIntervalRef.current);
        insightIntervalRef.current = null;
        // Start revealing steps
        let stepIdx = 0;
        stepsIntervalRef.current = window.setInterval(() => {
          stepIdx++;
          setStepsShown(stepIdx);
          if (stepIdx >= detail.steps.length) {
            if (stepsIntervalRef.current) clearInterval(stepsIntervalRef.current);
            stepsIntervalRef.current = null;
          }
        }, 300);
      }
    }, 40);
  }, [clearAnimIntervals]);

  const handlePrepare = useCallback((event: DemoEvent) => {
    const client = CLIENTS.find(c => c.id === event.clientId)!;
    const detail = DETAILS[`${event.clientId}-${event.eventType}`];
    setSelectedEvent({ event, client });
    setDetailVisible(true);
    setIsPaused(true);
    if (detail) startInsightAnimation(detail);
  }, [startInsightAnimation]);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    clearAnimIntervals();
    setTimeout(() => {
      setSelectedEvent(null);
      setInsightWordCount(0);
      setStepsShown(0);
    }, 300);
  }, [clearAnimIntervals]);

  // Cycle order: mix of urgent/soon/upcoming for variety
  const CYCLE_ORDER = [0, 2, 5, 8, 3, 6, 10, 1, 7, 4, 9, 11];

  const runAnimation = useCallback(async (myToken: number) => {
    // Phase 1: Build all 12 rows
    setVisibleRows(0);
    setPhase('building');
    setSelectedEvent(null);
    setDetailVisible(false);
    setInsightWordCount(0);
    setStepsShown(0);
    clearAnimIntervals();

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
      const detail = DETAILS[`${event.clientId}-${event.eventType}`];

      // Highlight row and pulse button first
      setActiveRowIdx(eventIdx);
      // Auto-scroll within the alert list container (not the page)
      if (alertListRef.current) {
        const row = alertListRef.current.querySelector(`[data-event-idx="${eventIdx}"]`) as HTMLElement | null;
        if (row) {
          const container = alertListRef.current;
          const rowTop = row.offsetTop - container.offsetTop;
          container.scrollTo({ top: rowTop - 8, behavior: 'smooth' });
        }
      }

      await wait(800);
      if (myToken !== tokenRef.current || !mountedRef.current) return;

      // Now open detail overlay
      setSelectedEvent({ event, client });
      setDetailVisible(true);
      if (detail) startInsightAnimation(detail);

      await wait(8000);
      if (myToken !== tokenRef.current || !mountedRef.current) return;

      setDetailVisible(false);
      clearAnimIntervals();
      setActiveRowIdx(null);
      await wait(400);
      if (myToken !== tokenRef.current || !mountedRef.current) return;
      setSelectedEvent(null);
      setInsightWordCount(0);
      setStepsShown(0);

      await wait(2500);
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
    return () => { mountedRef.current = false; tokenRef.current++; clearAnimIntervals(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    tokenRef.current++;
    clearAnimIntervals();
    setVisibleRows(0);
    setSelectedEvent(null);
    setDetailVisible(false);
    setIsPaused(false);
    setPhase('building');
    setActiveRowIdx(null);
    setInsightWordCount(0);
    setStepsShown(0);
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

  // Typewriter: get visible portion of insight
  const insightWords = detail ? detail.insight.split(' ') : [];
  const visibleInsight = insightWords.slice(0, insightWordCount).join(' ');
  const insightComplete = insightWordCount >= insightWords.length;

  return (
    <>
      <style>{`
        .vwm-root {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #0f172a;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0;
          background: rgba(15,23,42,.02);
          border: 1px solid rgba(15,23,42,.12);
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        .vwm-root *, .vwm-root *::before, .vwm-root *::after { box-sizing: border-box; }

        .vwm-dashboard-header {
          padding: 16px 20px 12px;
          background: rgba(15,23,42,.03);
          border-bottom: 1px solid rgba(15,23,42,.08);
        }
        .vwm-dash-title {
          font-weight: 760; letter-spacing: -.02em; font-size: 16px; color: #0f172a;
        }
        .vwm-dash-title .vwm-powered {
          font-size: 12px; font-weight: 500; color: rgba(15,23,42,.45); margin-left: 8px;
        }
        .vwm-dash-subtitle {
          font-size: 12px; color: rgba(15,23,42,.45); margin-top: 4px;
        }

        /* Metrics bar */
        .vwm-metrics {
          display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(15,23,42,.06);
        }
        .vwm-metric-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 10px;
          font-size: 12px; font-weight: 600;
        }
        .vwm-metric-pill.clients { background: rgba(15,23,42,.05); color: rgba(15,23,42,.65); }
        .vwm-metric-pill.urgent { background: rgba(239,68,68,.08); color: #dc2626; }
        .vwm-metric-pill.quarter { background: rgba(245,158,11,.08); color: #d97706; }
        .vwm-metric-pill.total { background: rgba(59,130,246,.08); color: #2563eb; }
        .vwm-metric-pill .num { font-weight: 800; font-variant-numeric: tabular-nums; }

        /* Controls row */
        .vwm-controls-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 20px;
          border-bottom: 1px solid rgba(15,23,42,.06);
        }
        .vwm-phase-label {
          font-size: 11px; color: rgba(15,23,42,.50); font-weight: 600;
        }
        .vwm-ctrl-btns { display: flex; gap: 8px; }
        .vwm-ctrl-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(15,23,42,.18); background: rgba(15,23,42,.05);
          color: rgba(15,23,42,.75); cursor: pointer; transition: all .2s;
        }
        .vwm-ctrl-btn:hover { background: rgba(15,23,42,.08); }
        .vwm-ctrl-btn.primary { background: #0f172a; color: #fff; border-color: transparent; }
        .vwm-ctrl-btn.primary:hover { background: #1e293b; }

        /* Alert rows list */
        .vwm-alert-list {
          max-height: 520px; overflow-y: auto; padding: 8px 12px;
        }
        .vwm-alert-list::-webkit-scrollbar { width: 8px; }
        .vwm-alert-list::-webkit-scrollbar-track { background: transparent; }
        .vwm-alert-list::-webkit-scrollbar-thumb { background: rgba(15,23,42,.10); border-radius: 999px; }

        /* Individual alert row */
        .vwm-alert-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; margin-bottom: 4px;
          border: 1px solid rgba(15,23,42,.08);
          border-radius: 14px;
          background: rgba(15,23,42,.02);
          transition: all .2s;
          animation: vwm-rowIn .35s ease both;
        }
        .vwm-alert-row:hover { background: rgba(15,23,42,.04); border-color: rgba(15,23,42,.14); }
        @keyframes vwm-rowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .vwm-row-icon {
          flex: 0 0 36px; height: 36px; border-radius: 10px;
          display: grid; place-items: center; font-size: 18px;
        }
        .vwm-row-info { flex: 1; min-width: 0; }
        .vwm-row-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .vwm-row-name { font-weight: 720; font-size: 13px; color: #0f172a; white-space: nowrap; }
        .vwm-row-aum { font-size: 11px; color: rgba(15,23,42,.50); font-weight: 600; }
        .vwm-seg-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
          border: 1px solid;
        }
        .vwm-row-middle { display: flex; align-items: center; gap: 8px; margin-top: 3px; flex-wrap: wrap; }
        .vwm-event-name { font-size: 12px; font-weight: 660; color: rgba(15,23,42,.80); }
        .vwm-urg-badge {
          font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 999px;
          border: 1px solid; text-transform: uppercase; letter-spacing: .03em;
        }
        .vwm-conf-pill {
          font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
          border: 1px solid;
        }
        .vwm-timing-text { font-size: 10px; color: rgba(15,23,42,.40); }
        .vwm-row-evidence {
          font-size: 10px; color: rgba(15,23,42,.40); margin-top: 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .vwm-row-actions { flex: 0 0 auto; display: flex; gap: 6px; }
        .vwm-row-btn {
          padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(15,23,42,.15); background: rgba(15,23,42,.04);
          color: rgba(15,23,42,.75); cursor: pointer; transition: all .2s;
          white-space: nowrap;
        }
        .vwm-row-btn:hover { background: rgba(15,23,42,.08); }
        .vwm-row-btn.prepare { background: #0f172a; color: #fff; border-color: transparent; }
        .vwm-row-btn.prepare:hover { background: #1e293b; }

        /* Active row highlight */
        .vwm-alert-row.active {
          background: rgba(59,130,246,.06);
          border-color: rgba(59,130,246,.30);
          box-shadow: 0 0 24px rgba(59,130,246,.10), inset 0 0 0 1px rgba(59,130,246,.10);
          border-left: 3px solid var(--vwm-active-color, #3b82f6);
        }

        /* Button pulse when row is active */
        .vwm-alert-row.active .vwm-row-btn.prepare {
          animation: vwm-btnPulse .7s ease-out;
          box-shadow: 0 0 16px rgba(15,23,42,.15);
        }
        @keyframes vwm-btnPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(15,23,42,0); }
          35% { transform: scale(1.18); box-shadow: 0 0 20px rgba(15,23,42,.15); background: #1e293b; }
          100% { transform: scale(1); box-shadow: 0 0 16px rgba(15,23,42,.1); }
        }

        /* Detail overlay */
        .vwm-detail-overlay {
          position: absolute; inset: 0; z-index: 10;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(8px);
          display: flex; flex-direction: column;
          transition: opacity .3s, transform .3s;
        }
        .vwm-detail-overlay.entering { opacity: 1; transform: translateY(0); }
        .vwm-detail-overlay.exiting { opacity: 0; transform: translateY(12px); }
        .vwm-detail-header {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 20px 28px; border-bottom: 1px solid rgba(15,23,42,.08);
        }
        .vwm-detail-header-left { display: flex; align-items: center; gap: 14px; }
        .vwm-detail-icon { font-size: 30px; }
        .vwm-detail-title { font-weight: 760; font-size: 20px; color: #0f172a; }
        .vwm-detail-client-name { font-size: 15px; color: rgba(15,23,42,.50); margin-top: 2px; }
        .vwm-back-btn {
          padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
          border: 1px solid rgba(15,23,42,.18); background: rgba(15,23,42,.05);
          color: rgba(15,23,42,.75); cursor: pointer; transition: all .2s;
          white-space: nowrap; min-height: auto !important; min-width: auto !important;
        }
        .vwm-back-btn:hover { background: rgba(15,23,42,.08); }
        .vwm-detail-body {
          flex: 1; overflow-y: auto; padding: 24px 28px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
        }
        @media (max-width: 700px) { .vwm-detail-body { grid-template-columns: 1fr; } }
        .vwm-detail-section-title {
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
          color: rgba(15,23,42,.50); margin-bottom: 12px;
        }
        .vwm-detail-tx {
          padding: 10px 14px; border-radius: 12px;
          border: 1px solid rgba(15,23,42,.08);
          background: rgba(15,23,42,.02);
          margin-bottom: 8px;
        }
        .vwm-detail-tx-top { display: flex; justify-content: space-between; align-items: center; }
        .vwm-detail-tx-merchant { font-size: 14px; font-weight: 680; color: #0f172a; }
        .vwm-detail-tx-amount { font-size: 14px; font-weight: 720; color: rgba(15,23,42,.85); font-variant-numeric: tabular-nums; }
        .vwm-detail-tx-bottom { display: flex; gap: 10px; align-items: center; margin-top: 4px; }
        .vwm-detail-tx-card {
          font-size: 11px; padding: 4px 10px; border-radius: 999px;
          font-weight: 700; border: 1px solid;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .vwm-detail-tx-card-dot {
          width: 6px; height: 6px; border-radius: 50%; display: inline-block;
        }
        .vwm-detail-tx-date { font-size: 12px; color: rgba(15,23,42,.40); }
        .vwm-detail-tx-relevance { font-size: 12px; color: rgba(15,23,42,.45); font-style: italic; margin-left: auto; }
        .vwm-detail-right { display: flex; flex-direction: column; gap: 20px; }
        .vwm-insight-box {
          padding: 16px; border-radius: 14px;
          border: 1px solid rgba(15,23,42,.08);
          background: rgba(15,23,42,.02);
        }
        .vwm-insight-label { font-size: 12px; font-weight: 700; color: rgba(15,23,42,.50); margin-bottom: 8px; }
        .vwm-insight-text { font-size: 14px; color: rgba(15,23,42,.65); line-height: 1.6; min-height: 3em; }
        .vwm-insight-cursor {
          display: inline-block; width: 2px; height: 16px; background: rgba(15,23,42,.50);
          margin-left: 2px; vertical-align: text-bottom;
          animation: vwm-blink .6s step-end infinite;
        }
        @keyframes vwm-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .vwm-steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .vwm-step-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14px; color: rgba(15,23,42,.65); line-height: 1.5;
          opacity: 0; transform: translateY(8px);
          transition: opacity .35s ease, transform .35s ease;
        }
        .vwm-step-item.revealed {
          opacity: 1; transform: translateY(0);
        }
        .vwm-step-num-circle {
          flex: 0 0 24px; height: 24px; border-radius: 50%;
          display: grid; place-items: center;
          font-size: 12px; font-weight: 700;
          background: rgba(15,23,42,.06); color: rgba(15,23,42,.55);
        }
        .vwm-detail-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding: 14px 28px;
          border-top: 1px solid rgba(15,23,42,.08);
          background: rgba(15,23,42,.02);
        }
        .vwm-footer-btn {
          padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
          border: 1px solid rgba(15,23,42,.18); background: rgba(15,23,42,.05);
          color: rgba(15,23,42,.75); cursor: pointer; transition: all .2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .vwm-footer-btn:hover { background: rgba(15,23,42,.08); }
        .vwm-footer-btn.primary { background: #0f172a; color: #fff; border-color: transparent; }
        .vwm-footer-btn.primary:hover { background: #1e293b; }

        /* Empty state */
        .vwm-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 20px; color: rgba(15,23,42,.30);
        }
        .vwm-empty-icon { font-size: 36px; margin-bottom: 12px; }
        .vwm-empty-text { font-size: 14px; font-weight: 600; }
        .vwm-empty-sub { font-size: 12px; margin-top: 4px; }

        @media (max-width: 767px) {
          .vwm-root { padding: 10px; border-radius: 14px; }
          .vwm-dash-title { font-size: 16px; }
          .vwm-detail-overlay { padding: 14px; }
        }
      `}</style>

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
          <div className="vwm-alert-list" ref={alertListRef}>
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
                <div key={`${event.clientId}-${event.eventType}-${idx}`} data-event-idx={idx} className={`vwm-alert-row${activeRowIdx === idx ? ' active' : ''}`} style={{ animationDelay: `${idx * 0.05}s`, ...(activeRowIdx === idx ? { '--vwm-active-color': event.color } as React.CSSProperties : {}) }}>
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
                  {detail.transactions.map((tx, i) => {
                    const cardStyle = CARD_TYPE_STYLES[tx.cardType] || CARD_TYPE_STYLES.checking;
                    return (
                      <div key={i} className="vwm-detail-tx">
                        <div className="vwm-detail-tx-top">
                          <span className="vwm-detail-tx-merchant">{tx.merchant}</span>
                          <span className="vwm-detail-tx-amount">{tx.amount}</span>
                        </div>
                        <div className="vwm-detail-tx-bottom">
                          <span
                            className="vwm-detail-tx-card"
                            style={{ background: cardStyle.bg, color: cardStyle.text, borderColor: cardStyle.border }}
                          >
                            <span className="vwm-detail-tx-card-dot" style={{ background: cardStyle.dot }} />
                            {tx.card}
                          </span>
                          <span className="vwm-detail-tx-date">{tx.date}</span>
                          <span className="vwm-detail-tx-relevance">{tx.relevance}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Right: Insight + Steps */}
                <div className="vwm-detail-right">
                  <div>
                    <div className="vwm-detail-section-title">✨ Ventus AI Insight</div>
                    <div className="vwm-insight-box">
                      <div className="vwm-insight-text">
                        {visibleInsight}
                        {!insightComplete && <span className="vwm-insight-cursor" />}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="vwm-detail-section-title">📋 Recommended Next Steps</div>
                    <ol className="vwm-steps-list">
                      {detail.steps.map((step, i) => (
                        <li key={i} className={`vwm-step-item ${i < stepsShown ? 'revealed' : ''}`}>
                          <span className="vwm-step-num-circle">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
              <div className="vwm-detail-footer">
                <button className="vwm-footer-btn">✉️ Email Me</button>
                <button className="vwm-footer-btn primary">⚡ Automate Prep</button>
              </div>
            </div>
          )}
        </div>
    </>
  );
}
