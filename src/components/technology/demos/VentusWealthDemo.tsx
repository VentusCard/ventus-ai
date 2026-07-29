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
  checking:  { bg: 'rgba(100,116,139,.10)', text: '#475569', border: 'rgba(100,116,139,.25)', dot: '#64748b' },
  platinum:  { bg: 'rgba(100,116,139,.10)', text: '#475569', border: 'rgba(100,116,139,.25)', dot: '#64748b' },
  cashback:  { bg: 'rgba(100,116,139,.10)', text: '#475569', border: 'rgba(100,116,139,.25)', dot: '#64748b' },
  travel:    { bg: 'rgba(100,116,139,.10)', text: '#475569', border: 'rgba(100,116,139,.25)', dot: '#64748b' },
  business:  { bg: 'rgba(100,116,139,.10)', text: '#475569', border: 'rgba(100,116,139,.25)', dot: '#64748b' },
  web:       { bg: 'rgba(100,116,139,.10)', text: '#475569', border: 'rgba(100,116,139,.25)', dot: '#64748b' },
};

const SEGMENT_STYLES: Record<string, { bg: string; text: string }> = {
  Private: { bg: '#dbeafe', text: '#1d4ed8' },
  Premium: { bg: '#dcfce7', text: '#16a34a' },
  Preferred: { bg: '#fef3c7', text: '#d97706' },
};

const EVENT_TYPE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  retirement: { bg: '#fef3c7', text: '#92400e', label: 'Retirement Planning' },
  education: { bg: '#dbeafe', text: '#1e40af', label: 'Education Funding' },
  home_purchase: { bg: '#dcfce7', text: '#166534', label: 'Home Purchase' },
  wealth_transfer: { bg: '#f3e8ff', text: '#6b21a8', label: 'Wealth Transfer' },
  business_liquidity: { bg: '#f1f5f9', text: '#334155', label: 'Business Liquidity' },
  family_formation: { bg: '#fce7f3', text: '#9d174d', label: 'Family Formation' },
  elder_care: { bg: '#fee2e2', text: '#991b1b', label: 'Elder Care' },
};

function wait(ms: number) { return new Promise(res => setTimeout(res, ms)); }
function waitWhilePaused(pausedRef: React.MutableRefObject<boolean>, tokenRef: React.MutableRefObject<number>, myToken: number, mountedRef: React.MutableRefObject<boolean>): Promise<boolean> {
  return new Promise(res => {
    const check = () => {
      if (myToken !== tokenRef.current || !mountedRef.current) { res(false); return; }
      if (!pausedRef.current) { res(true); return; }
      setTimeout(check, 100);
    };
    check();
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VentusWealthDemo() {
  const [visibleRows, setVisibleRows] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<{ event: DemoEvent; client: DemoClient } | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
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
          if (stepIdx > detail.steps.length) {
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
      if (!(await waitWhilePaused(isPausedRef, tokenRef, myToken, mountedRef))) return;
      setVisibleRows(i);
      await wait(350);
    }

    if (myToken !== tokenRef.current || !mountedRef.current) return;
    await wait(1200);

    // Phase 2: Cycle through clicking into different events endlessly
    setPhase('autoprepare');
    let cycleIdx = 0;

    while (myToken === tokenRef.current && mountedRef.current) {
      if (!(await waitWhilePaused(isPausedRef, tokenRef, myToken, mountedRef))) return;

      const eventIdx = CYCLE_ORDER[cycleIdx % CYCLE_ORDER.length];
      const event = EVENTS[eventIdx];
      const client = CLIENTS.find(c => c.id === event.clientId)!;
      const detail = DETAILS[`${event.clientId}-${event.eventType}`];

      // Highlight row and pulse button first
      setActiveRowIdx(eventIdx);
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
      if (!(await waitWhilePaused(isPausedRef, tokenRef, myToken, mountedRef))) return;

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
    isPausedRef.current = false;
    setPhase('building');
    setActiveRowIdx(null);
    setInsightWordCount(0);
    setStepsShown(0);
    mountedRef.current = true;
    const myToken = ++tokenRef.current;
    runAnimation(myToken);
  };

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    isPausedRef.current = next;
    if (next) {
      // When pausing, close any open detail overlay and clear active row
      setDetailVisible(false);
      clearAnimIntervals();
      setActiveRowIdx(null);
      setTimeout(() => {
        setSelectedEvent(null);
        setInsightWordCount(0);
        setStepsShown(0);
      }, 300);
    }
  };

  const urgencyBadge = (urgency: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Urgent: { bg: '#fef2f2', text: '#dc2626', border: 'transparent' },
      Soon: { bg: '#fefce8', text: '#ca8a04', border: 'transparent' },
      Upcoming: { bg: '#eff6ff', text: '#2563eb', border: 'transparent' },
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
          font-family: "Manrope", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #0f172a;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
        }
        .vwm-root *, .vwm-root *::before, .vwm-root *::after { box-sizing: border-box; }

        .vwm-dashboard-header {
          padding: 16px 20px 12px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
        }
        .vwm-dash-title-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .vwm-dash-title-left {
          display: flex; align-items: baseline; gap: 8px;
        }
        .vwm-pulsing-dot {
          position: relative; width: 8px; height: 8px; flex-shrink: 0; align-self: center;
        }
        .vwm-pulsing-dot::before {
          content: ''; position: absolute; inset: 0; border-radius: 50%; background: #10b981;
          animation: vwm-dotPulse 2s ease-in-out infinite;
        }
        .vwm-pulsing-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%; background: #10b981;
          opacity: 0.75; animation: vwm-dotPing 2s ease-in-out infinite;
        }
        @keyframes vwm-dotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        @keyframes vwm-dotPing { 0% { transform: scale(1); opacity: 0.75; } 100% { transform: scale(2.5); opacity: 0; } }
        .vwm-dash-title {
          font-weight: 700; font-size: 18px; color: #0f172a;
        }
        .vwm-dash-title .vwm-powered {
          display: none;
        }
        .vwm-live-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 999px;
          background: rgba(16,185,129,0.08); color: #059669;
          font-size: 11px; font-weight: 600;
        }
        .vwm-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #10b981;
          animation: vwm-dotPulse 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(16,185,129,0.6);
        }
        @media (max-width: 1023px) {
          .vwm-live-dot { display: none; }
        }
        .vwm-dash-subtitle {
          font-size: 12px; color: rgba(15,23,42,.45); margin-top: 4px;
        }

        /* Search + Filters */
        .vwm-filters-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 20px;
          border-bottom: 1px solid rgba(15,23,42,.06); flex-wrap: wrap;
        }
        .vwm-search-box {
          display: flex; align-items: center; gap: 6px; padding: 6px 12px;
          border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;
          font-size: 12px; color: rgba(15,23,42,.35); flex: 0 0 auto; min-width: 140px;
        }
        .vwm-filter-select {
          padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0;
          font-size: 12px; color: rgba(15,23,42,.65); background: #fff;
          cursor: default; font-weight: 500;
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
          padding: 14px 16px; margin-bottom: 4px;
          border-bottom: 1px solid rgba(15,23,42,.06);
          background: #fff;
          transition: all .2s;
          animation: vwm-rowIn .35s ease both;
        }
        .vwm-alert-row:hover { background: rgba(15,23,42,.02); }
        @keyframes vwm-rowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .vwm-row-icon-circle {
          flex: 0 0 36px; width: 36px; height: 36px; border-radius: 50%;
          display: grid; place-items: center; font-size: 16px;
        }
        .vwm-row-info { flex: 1; min-width: 0; }
        .vwm-row-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .vwm-row-name { font-weight: 700; font-size: 14px; color: #0f172a; white-space: nowrap; }
        .vwm-row-aum { font-size: 11px; color: rgba(15,23,42,.50); font-weight: 600; }
        .vwm-seg-badge {
          font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
        }
        .vwm-row-middle { display: flex; align-items: center; gap: 6px; margin-top: 3px; flex-wrap: wrap; }
        .vwm-event-type-badge {
          font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
          white-space: nowrap;
        }
        .vwm-event-name { font-size: 13px; font-weight: 640; color: rgba(15,23,42,.85); }
        .vwm-urg-badge {
          font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 999px;
          border: none; text-transform: uppercase; letter-spacing: .03em;
        }
        .vwm-row-evidence {
          font-size: 11px; color: rgba(15,23,42,.40); margin-top: 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .vwm-row-right {
          flex: 0 0 auto; display: flex; align-items: center; gap: 16px;
        }
        .vwm-row-conf {
          text-align: right;
        }
        .vwm-row-conf-val { font-size: 12px; font-weight: 700; color: #16a34a; }
        .vwm-row-conf-timing { font-size: 10px; color: rgba(15,23,42,.40); }
        .vwm-row-last-contact {
          text-align: right;
        }
        .vwm-row-last-label { font-size: 9px; color: rgba(15,23,42,.35); }
        .vwm-row-last-val { font-size: 10px; color: rgba(15,23,42,.50); }
        .vwm-row-actions { display: flex; align-items: center; gap: 6px; }
        .vwm-row-btn {
          padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
          border: none; cursor: pointer; transition: all .2s;
          white-space: nowrap;
        }
        .vwm-row-btn.prepare { background: #2563eb; color: #fff; }
        .vwm-row-btn.prepare:hover { background: #1d4ed8; }
        .vwm-row-icon-btn {
          width: 28px; height: 28px; border-radius: 50%; border: none;
          background: transparent; color: rgba(15,23,42,.35); cursor: pointer;
          display: grid; place-items: center; font-size: 14px; transition: all .2s;
        }
        .vwm-row-icon-btn:hover { background: rgba(15,23,42,.05); color: rgba(15,23,42,.65); }

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
        .vwm-content-area { position: relative; flex: 1; }
        .vwm-detail-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10;
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(8px);
          display: flex; flex-direction: column;
          transition: opacity .3s, transform .3s;
        }
        .vwm-detail-overlay.entering { opacity: 1; transform: translateY(0); }
        .vwm-detail-overlay.exiting { opacity: 0; transform: translateY(12px); }
        .vwm-detail-header {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          padding: 18px 24px; border-bottom: 1px solid rgba(15,23,42,.08);
          position: relative;
        }
        .vwm-detail-header-left { display: flex; align-items: flex-start; gap: 12px; min-width: 0; flex: 1; }
        .vwm-detail-icon { font-size: 24px; }
        .vwm-detail-title { font-weight: 700; font-size: 18px; color: #0f172a; }
        .vwm-detail-badges { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
        .vwm-detail-badge {
          font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 6px;
        }
        .vwm-back-btn {
          padding: 0; border-radius: 50%; font-size: 13px; font-weight: 700;
          border: none; background: transparent;
          color: rgba(15,23,42,.40); cursor: pointer; transition: all .2s;
          min-height: auto !important; min-width: auto !important;
          width: 28px; height: 28px; display: grid; place-items: center;
          line-height: 1; flex-shrink: 0; margin-top: 2px;
        }
        .vwm-back-btn:hover { background: rgba(15,23,42,.06); color: rgba(15,23,42,.75); }
        .vwm-detail-body {
          flex: 1; overflow-y: auto; padding: 16px 20px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media (max-width: 700px) {
          .vwm-detail-body { grid-template-columns: 1fr; padding: 12px 16px; gap: 16px; }
          .vwm-detail-header { padding: 12px 16px; }
          .vwm-detail-title { font-size: 14px; }
          .vwm-detail-icon { font-size: 20px; }
          .vwm-detail-client-name { font-size: 11px; }
          .vwm-back-btn { font-size: 10px; padding: 4px 8px; }
        }
        .vwm-detail-section-title {
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
          color: rgba(15,23,42,.50); margin-bottom: 12px;
        }
        .vwm-detail-tx {
          padding: 10px 14px; border-radius: 12px;
          border: 1px solid rgba(15,23,42,.08);
          background: #fff;
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
          border: 1px solid #dbeafe;
          background: #eff6ff;
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
        .vwm-detail-actions {
          display: flex; flex-wrap: nowrap; gap: 6px; padding-top: 4px;
        }
        .vwm-footer-btn {
          padding: 5px 10px; border-radius: 6px; font-size: 10px; font-weight: 600;
          border: 1px solid rgba(15,23,42,.18); background: rgba(15,23,42,.05);
          color: rgba(15,23,42,.65); cursor: pointer; transition: all .2s;
          display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
        }
        .vwm-footer-btn:hover { background: rgba(15,23,42,.08); }
        .vwm-footer-btn.primary { background: #2563eb; color: #fff; border-color: transparent; }
        .vwm-footer-btn.primary:hover { background: #1d4ed8; }

        /* Empty state */
        .vwm-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 20px; color: rgba(15,23,42,.30);
        }
        .vwm-empty-icon { font-size: 36px; margin-bottom: 12px; }
        .vwm-empty-text { font-size: 14px; font-weight: 600; }
        .vwm-empty-sub { font-size: 12px; margin-top: 4px; }

        @media (max-width: 767px) {
          .vwm-root { padding: 0; border-radius: 10px; }
          .vwm-dash-title { font-size: 15px; }
          .vwm-detail-overlay { padding: 0; }
          .vwm-alert-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 12px 14px;
          }
          .vwm-row-right {
            width: 100%;
            flex-wrap: wrap;
            gap: 8px;
          }
          .vwm-row-conf, .vwm-row-last-contact {
            text-align: left;
          }
          .vwm-row-actions {
            margin-left: auto;
          }
          .vwm-row-evidence {
            white-space: normal;
          }
          .vwm-metrics {
            padding: 8px 14px;
            gap: 6px;
          }
          .vwm-metric-pill {
            font-size: 11px;
            padding: 4px 8px;
          }
          .vwm-alert-list {
            padding: 4px 8px;
            max-height: 400px;
          }
          .vwm-detail-header {
            padding: 12px 14px;
          }
          .vwm-detail-title { font-size: 14px; }
          .vwm-detail-body {
            grid-template-columns: 1fr;
            padding: 12px 14px;
            gap: 16px;
          }
          .vwm-detail-tx-bottom { flex-wrap: wrap; }
          .vwm-detail-tx-relevance { margin-left: 0; }
          .vwm-detail-actions { flex-wrap: wrap; }
        }
      `}</style>

        <div className="vwm-root">
          {/* Header */}
          <div className="vwm-dashboard-header">
            <div className="vwm-dash-title-row">
              <div className="vwm-dash-title-left">
                <div className="vwm-dash-title">
                  Wealth Intelligence
                  <span className="vwm-powered">Powered by Ventus AI</span>
                </div>
              </div>
              <span className="vwm-live-badge">
                <span className="vwm-live-dot" />
                Live Demo
              </span>
            </div>
            {displayedClients === 0 && (
              <div className="vwm-dash-subtitle">Scanning client portfolios...</div>
            )}
          </div>

          {/* Content area - overlay positions relative to this */}
          <div className="vwm-content-area">

          {/* Subheader */}
          <div style={{ padding: '12px 20px 0', fontSize: 10, fontWeight: 700, color: '#2563EB', letterSpacing: '.08em', textTransform: 'uppercase' as const }}>Your Clients</div>

          {/* Metrics */}
          <div className="vwm-metrics">
            <span className="vwm-metric-pill clients">
              <span className="num">{displayedClients}</span> Clients
            </span>
            <span className="vwm-metric-pill urgent">
              <span className="num">{displayedUrgent}</span> Urgent
            </span>
            <span className="vwm-metric-pill quarter">
              <span className="num">{displayedQuarter}</span> This Quarter
            </span>
            <span className="vwm-metric-pill total">
              <span className="num">{displayedEvents}</span> Total Events
            </span>
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
              const evType = EVENT_TYPE_BADGE[event.eventType] || EVENT_TYPE_BADGE.retirement;
              return (
                <div key={`${event.clientId}-${event.eventType}-${idx}`} data-event-idx={idx} className={`vwm-alert-row${activeRowIdx === idx ? ' active' : ''}`} style={{ animationDelay: `${idx * 0.05}s`, ...(activeRowIdx === idx ? { '--vwm-active-color': '#3b82f6' } as React.CSSProperties : {}) }}>
                  <div className="vwm-row-icon-circle" style={{ background: 'rgba(100,116,139,.10)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(15,23,42,.55)', letterSpacing: '-.01em' }}>{client.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="vwm-row-info">
                    <div className="vwm-row-top">
                      <span className="vwm-row-name">{client.name}</span>
                      <span className="vwm-row-aum">{client.aum}</span>
                      <span className="vwm-seg-badge" style={{ background: seg.bg, color: seg.text }}>
                        {client.segment}
                      </span>
                    </div>
                    <div className="vwm-row-middle">
                      <span className="vwm-event-type-badge" style={{ background: evType.bg, color: evType.text }}>{evType.label}</span>
                      <span className="vwm-urg-badge" style={{ background: urg.bg, color: urg.text }}>
                        {event.urgency}
                      </span>
                    </div>
                    <div className="vwm-row-evidence">{event.evidence}</div>
                  </div>
                  <div className="vwm-row-right">
                    <div className="vwm-row-conf">
                      <div className="vwm-row-conf-val">{event.confidence}% conf</div>
                      <div className="vwm-row-conf-timing">{event.timing}</div>
                    </div>
                    <div className="vwm-row-last-contact">
                      <div className="vwm-row-last-label">Last contact</div>
                      <div className="vwm-row-last-val">1 month ago</div>
                    </div>
                    <div className="vwm-row-actions">
                      {DETAILS[`${event.clientId}-${event.eventType}`] && (
                        <button className="vwm-row-btn prepare" onClick={() => handlePrepare(event)}>Prepare</button>
                      )}
                      <button className="vwm-row-icon-btn" title="View">👁</button>
                      <button className="vwm-row-icon-btn" title="Call">📞</button>
                    </div>
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
                  <div className="vwm-row-icon-circle" style={{ background: 'rgba(100,116,139,.10)', width: 40, height: 40, flex: '0 0 40px' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(15,23,42,.55)', letterSpacing: '-.01em' }}>{selectedEvent.client.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <div className="vwm-detail-title">Prepare: {selectedEvent.event.eventName}</div>
                    <div className="vwm-detail-badges">
                      <span>{selectedEvent.client.name}</span>
                      <span className="vwm-detail-badge" style={{ background: SEGMENT_STYLES[selectedEvent.client.segment]?.bg, color: SEGMENT_STYLES[selectedEvent.client.segment]?.text }}>{selectedEvent.client.segment}</span>
                      <span className="vwm-detail-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>{selectedEvent.event.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
                <button className="vwm-back-btn" onClick={handleCloseDetail}>✕</button>
              </div>
              <div className="vwm-detail-body">
                {/* Left: Transactions */}
                <div>
                  <div className="vwm-detail-section-title">📋 Detected Supporting Transactions ({detail.transactions.length} total)</div>
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
                    <div className="vwm-detail-section-title">✨ Ventus AI Insights</div>
                    <div className="vwm-insight-box">
                      <div className="vwm-insight-text">
                        {visibleInsight}
                        {!insightComplete && <span className="vwm-insight-cursor" />}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="vwm-detail-section-title">⏱ Ventus AI Recommended Next Steps</div>
                    <ol className="vwm-steps-list">
                      {detail.steps.map((step, i) => (
                        <li key={i} className={`vwm-step-item ${i < stepsShown ? 'revealed' : ''}`}>
                          <span className="vwm-step-num-circle">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="vwm-detail-actions" style={{ opacity: stepsShown > (detail?.steps.length || 0) ? 1 : 0, transform: stepsShown > (detail?.steps.length || 0) ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
                    <button className="vwm-footer-btn">⚡ Prepare with Ventus</button>
                    <button className="vwm-footer-btn">📄 Download PDF</button>
                    <button className="vwm-footer-btn primary">✉️ Email Summary</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
          {/* End content area */}

          {/* Controls: Pause/Play + Replay */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", padding: "16px 0", borderTop: "1px solid #e2e8f0" }}>
            <button
              onClick={togglePause}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 20px", fontSize: "14px", fontWeight: 500,
                color: "#9ca3af", background: "transparent", border: "none",
                borderRadius: "9999px", cursor: "pointer",
                transition: "color 0.2s, background 0.2s",
                height: "40px",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
            >
              {isPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              )}
              {isPaused ? 'Play' : 'Pause'}
            </button>
            <button
              onClick={handleReset}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 20px", fontSize: "14px", fontWeight: 500,
                color: "#9ca3af", background: "transparent", border: "none",
                borderRadius: "9999px", cursor: "pointer",
                transition: "color 0.2s, background 0.2s",
                height: "40px",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Replay
            </button>
          </div>
        </div>
    </>
  );
}
