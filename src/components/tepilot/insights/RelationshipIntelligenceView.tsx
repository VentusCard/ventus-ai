import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabHeader } from "./TabHeader";
import { cn } from "@/lib/utils";
import {
  Gem, Layers, Grid3x3, Crown, CalendarHeart, TrendingUp, AlertTriangle,
  ArrowUpRight, Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart,
  Scan, CalendarDays, AlertCircle, CreditCard, PiggyBank, Landmark,
  LineChart, Wallet, ShieldAlert, ArrowRight, Sparkles, DollarSign,
} from "lucide-react";
import {
  LIFE_EVENT_CONFIG, DetectedLifeEvent, DashboardClient, EventPreparationData,
} from "@/types/dashboardClient";
import { LifeEventAlertCard } from "@/components/tepilot/advisor-console/LifeEventAlertCard";
import {
  PrepareEventDialog, generateEventPreparationData,
} from "@/components/tepilot/advisor-console/PrepareEventDialog";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunset, GraduationCap, Home, Gift, Briefcase, Baby, Heart,
};

const BANKWIDE_EVENT_STATS: Record<DetectedLifeEvent['eventType'], { detected: number; avgConfidence: number; urgent: number }> = {
  retirement:         { detected: 4200, avgConfidence: 82, urgent: 890 },
  education:          { detected: 3100, avgConfidence: 76, urgent: 620 },
  home_purchase:      { detected: 5800, avgConfidence: 79, urgent: 1240 },
  wealth_transfer:    { detected: 1900, avgConfidence: 71, urgent: 380 },
  business_liquidity: { detected: 1400, avgConfidence: 68, urgent: 210 },
  family_formation:   { detected: 1800, avgConfidence: 84, urgent: 540 },
  elder_care:         { detected: 2600, avgConfidence: 73, urgent: 780 },
};

type ModuleKey = 'penetration' | 'crosssell' | 'primary' | 'lifeevents' | 'wallet' | 'atrisk' | 'exposure';

interface Props {
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
}

export function RelationshipIntelligenceView({ userDemographics, lifestyleSignals }: Props) {
  const [activeModule, setActiveModule] = useState<ModuleKey>('lifeevents');
  const [prepareDialogOpen, setPrepareDialogOpen] = useState(false);
  const [prepareData, setPrepareData] = useState<EventPreparationData | null>(null);

  const staticClients = useMemo(() => generateDashboardClients(24), []);

  const enrichedClient: DashboardClient | null = useMemo(() => {
    if (!userDemographics) return null;
    const detectedEvents: DetectedLifeEvent[] = [];
    if (lifestyleSignals?.detected_events) {
      lifestyleSignals.detected_events.forEach((evt: any) => {
        const eventType = mapEventType(evt.event_type || evt.eventType || '');
        if (eventType) {
          detectedEvents.push({
            eventType,
            eventName: evt.event_name || evt.eventName || LIFE_EVENT_CONFIG[eventType].label,
            confidence: evt.confidence || 78,
            estimatedTiming: evt.estimated_timing || evt.estimatedTiming || '3-6 months',
            keyEvidence: evt.key_evidence || evt.keyEvidence || evt.talking_points || [],
            urgencyScore: evt.urgency_score || evt.urgencyScore || 3,
          });
        }
      });
    }
    if (detectedEvents.length === 0) {
      detectedEvents.push({
        eventType: 'home_purchase',
        eventName: 'Potential Home Purchase',
        confidence: 72,
        estimatedTiming: '6-12 months',
        keyEvidence: ['Increased spending on home improvement stores'],
        urgencyScore: 3,
      });
    }
    return {
      id: 'enriched-user',
      profile: userDemographics,
      detectedEvents,
      lastContactDate: new Date(),
      engagementStatus: 'active' as const,
    };
  }, [userDemographics, lifestyleSignals]);

  const clientEventPairs = useMemo(() => {
    const pairs: Array<{ client: DashboardClient; event: DetectedLifeEvent; sourceLabel: string }> = [];
    if (enrichedClient) {
      enrichedClient.detectedEvents.forEach(event => {
        pairs.push({ client: enrichedClient, event, sourceLabel: 'From Transaction Enrichment' });
      });
    }
    staticClients.forEach(client => {
      client.detectedEvents.forEach(event => {
        pairs.push({ client, event, sourceLabel: 'Static Example' });
      });
    });
    return pairs;
  }, [enrichedClient, staticClients]);

  const handlePrepare = (clientId: string, event: DetectedLifeEvent) => {
    const client = clientEventPairs.find(p => p.client.id === clientId)?.client;
    if (client) {
      setPrepareData(generateEventPreparationData(client, event));
      setPrepareDialogOpen(true);
    }
  };
  const handleView = () => toast.info('Client detail view available in the WM Copilot tab');
  const handleScheduleCall = (clientId: string) => {
    const client = clientEventPairs.find(p => p.client.id === clientId)?.client;
    toast.success(`Scheduling call with ${client?.profile.name || 'client'}...`);
  };

  const totalLifeEvents = Object.values(BANKWIDE_EVENT_STATS).reduce((s, v) => s + v.detected, 0);
  const totalUrgent = Object.values(BANKWIDE_EVENT_STATS).reduce((s, v) => s + v.urgent, 0);

  const tiles: Array<{
    key: ModuleKey; icon: React.ElementType; label: string;
    hero: string; insight: string; accent: string; tint: string;
  }> = [
    { key: 'penetration', icon: Layers, label: 'Product Penetration',
      hero: '2.7 avg', insight: '38% hold 1 product only — thin relationships dominate.',
      accent: 'text-blue-600', tint: 'bg-blue-50 border-blue-200' },
    { key: 'crosssell', icon: Grid3x3, label: 'Cross-Sell Whitespace',
      hero: '$412M', insight: 'Estimated annual revenue in top 5 product gaps.',
      accent: 'text-emerald-600', tint: 'bg-emerald-50 border-emerald-200' },
    { key: 'primary', icon: Crown, label: 'Primary Bank Status',
      hero: '31%', insight: 'Customers where Ventus Bank is the primary institution.',
      accent: 'text-amber-600', tint: 'bg-amber-50 border-amber-200' },
    { key: 'lifeevents', icon: CalendarHeart, label: 'Life Stage & Events',
      hero: totalLifeEvents.toLocaleString(), insight: `${totalUrgent.toLocaleString()} urgent events in the next 90 days.`,
      accent: 'text-purple-600', tint: 'bg-purple-50 border-purple-200' },
    { key: 'wallet', icon: TrendingUp, label: 'Wallet Depth Tiers',
      hero: '3 bands', insight: 'Preferred / Premium / Private penetration snapshot.',
      accent: 'text-cyan-600', tint: 'bg-cyan-50 border-cyan-200' },
    { key: 'atrisk', icon: AlertTriangle, label: 'Relationship Attrition',
      hero: '18%', insight: 'Thin, dormant, and leaking wallets showing decline.',
      accent: 'text-red-600', tint: 'bg-red-50 border-red-200' },
    { key: 'exposure', icon: ShieldAlert, label: 'Portfolio Exposure',
      hero: '42k', insight: 'Vice, AML, international, and vulnerability cohorts.',
      accent: 'text-amber-600', tint: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Gem className="w-4 h-4" />}
        title="Relationship Intelligence"
        subtitle="One engine, two lenses: where to grow each relationship and where to protect it — across 2.4M scanned customers"
        howItWorks="Ventus enriches every transaction, then routes the resulting signals two ways: growth signals feed cross-sell propensity and life-event triggers, while protection signals feed attrition, wallet-share leakage, and portfolio-exposure cohorts."
        whyItMatters="A portfolio view that pairs revenue upside with the risk it's sitting next to — so the bank acts before the customer leaves, defaults, or self-reports a life event."
      />

      {/* Portfolio strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={<Scan className="h-5 w-5 text-slate-600" />} label="Customers Scanned" value="2.4M" bg="bg-slate-50" />
        <MetricCard icon={<Sparkles className="h-5 w-5 text-emerald-600" />} label="Growth Signals (90d)" value="184k" bg="bg-emerald-50" />
        <MetricCard icon={<ShieldAlert className="h-5 w-5 text-amber-600" />} label="Protection Signals (90d)" value="42k" bg="bg-amber-50" />
        <MetricCard icon={<DollarSign className="h-5 w-5 text-blue-600" />} label="Est. Annual Opportunity" value="$412M" bg="bg-blue-50" />
      </div>

      {/* Bento grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Insight Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiles.map(t => {
            const Icon = t.icon;
            const active = activeModule === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveModule(t.key)}
                className={cn(
                  "text-left rounded-xl border bg-white p-4 transition-all hover:shadow-sm",
                  active ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center", t.tint)}>
                    <Icon className={cn("w-4 h-4", t.accent)} />
                  </div>
                  <ArrowUpRight className={cn("w-4 h-4", active ? "text-slate-900" : "text-slate-300")} />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{t.hero}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{t.insight}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drill-in */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {activeModule === 'penetration' && <ProductPenetrationModule />}
        {activeModule === 'crosssell' && <CrossSellModule />}
        {activeModule === 'primary' && <PrimaryBankModule />}
        {activeModule === 'lifeevents' && (
          <LifeEventsModule
            clientEventPairs={clientEventPairs}
            onPrepare={handlePrepare}
            onView={handleView}
            onScheduleCall={handleScheduleCall}
          />
        )}
        {activeModule === 'wallet' && <WalletDepthModule />}
        {activeModule === 'atrisk' && (
          <AtRiskModule
            clientEventPairs={clientEventPairs}
            onPrepare={handlePrepare}
            onView={handleView}
            onScheduleCall={handleScheduleCall}
          />
        )}
        {activeModule === 'exposure' && <PortfolioExposureModule />}
      </div>

      <PrepareEventDialog
        open={prepareDialogOpen}
        onOpenChange={setPrepareDialogOpen}
        data={prepareData}
      />
    </div>
  );
}

/* ---------------- Modules ---------------- */

function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

const PENETRATION_BUCKETS = [
  { label: '1 product',  pct: 38, count: 912000, color: 'bg-red-500' },
  { label: '2 products', pct: 27, count: 648000, color: 'bg-amber-500' },
  { label: '3 products', pct: 16, count: 384000, color: 'bg-blue-500' },
  { label: '4+ products',pct: 19, count: 456000, color: 'bg-emerald-500' },
];

const CATEGORY_HOLDINGS = [
  { icon: Wallet, label: 'Debit & Checking', pct: 78 },
  { icon: CreditCard, label: 'Credit Cards',   pct: 54 },
  { icon: PiggyBank, label: 'Savings / CDs',   pct: 41 },
  { icon: Home, label: 'Mortgage',             pct: 22 },
  { icon: LineChart, label: 'Investments',     pct: 18 },
  { icon: Landmark, label: 'Wealth / Advisory',pct: 7 },
];

function ProductPenetrationModule() {
  return (
    <div>
      <ModuleHeader title="Product Penetration" subtitle="How many products the average customer holds, and where the shelf is under-utilized." />
      <div className="space-y-2 mb-6">
        {PENETRATION_BUCKETS.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 w-24">{b.label}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
              <div className={cn("h-full", b.color)} style={{ width: `${b.pct * 2.5}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-900 w-16 text-right">{b.pct}%</span>
            <span className="text-[11px] text-slate-400 w-20 text-right">{(b.count / 1000).toFixed(0)}k</span>
          </div>
        ))}
      </div>
      <h4 className="text-xs font-semibold text-slate-700 mb-2">Holding rate by product category</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {CATEGORY_HOLDINGS.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">{c.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900">{c.pct}%</span>
                <span className="text-[10px] text-slate-400">of customers</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CROSS_SELL_GAPS = [
  { has: 'Checking', missing: 'Credit Card', recommend: 'Customized Cash Rewards', pct: 38, revenue: '$142M' },
  { has: 'Checking + Credit Card', missing: 'Savings', recommend: 'Advantage Savings', pct: 31, revenue: '$68M' },
  { has: 'Mortgage', missing: 'Wealth Advisory', recommend: 'Merrill Guided Investing', pct: 82, revenue: '$96M' },
  { has: 'Credit Card', missing: 'Auto Loan', recommend: 'Preferred Rewards Auto', pct: 26, revenue: '$54M' },
  { has: 'Investments', missing: 'HELOC', recommend: 'Home Equity Line', pct: 63, revenue: '$52M' },
];

function CrossSellModule() {
  return (
    <div>
      <ModuleHeader title="Cross-Sell Whitespace" subtitle="Highest-value product gaps mapped to catalog recommendations." />
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Customer holds</th>
              <th className="text-left px-3 py-2 font-medium">Missing</th>
              <th className="text-left px-3 py-2 font-medium">Recommend</th>
              <th className="text-right px-3 py-2 font-medium">Eligible</th>
              <th className="text-right px-3 py-2 font-medium">Est. revenue</th>
            </tr>
          </thead>
          <tbody>
            {CROSS_SELL_GAPS.map((g, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-700">{g.has}</td>
                <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">{g.missing}</Badge></td>
                <td className="px-3 py-2 text-slate-900 font-medium">{g.recommend}</td>
                <td className="px-3 py-2 text-right text-slate-700">{g.pct}%</td>
                <td className="px-3 py-2 text-right text-emerald-700 font-semibold">{g.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PRIMARY_SEGMENTS = [
  { label: 'Primary bank',   pct: 31, color: 'bg-emerald-500', desc: '3+ products AND >60% deposit share' },
  { label: 'Secondary bank', pct: 44, color: 'bg-amber-500',   desc: '2+ products, moderate deposit activity' },
  { label: 'Thin / dormant', pct: 25, color: 'bg-red-500',     desc: 'Single product OR <20% deposit share' },
];

function PrimaryBankModule() {
  return (
    <div>
      <ModuleHeader title="Primary Bank Status" subtitle="Estimated share-of-relationship across the customer base." />
      <div className="flex h-8 w-full rounded overflow-hidden mb-4">
        {PRIMARY_SEGMENTS.map(s => (
          <div key={s.label} className={cn("h-full flex items-center justify-center text-[11px] font-semibold text-white", s.color)} style={{ width: `${s.pct}%` }}>
            {s.pct}%
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRIMARY_SEGMENTS.map(s => (
          <div key={s.label} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full", s.color)} />
              <span className="text-xs font-semibold text-slate-900">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{s.pct}%</p>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LifeEventsModule({
  clientEventPairs, onPrepare, onView, onScheduleCall,
}: {
  clientEventPairs: Array<{ client: DashboardClient; event: DetectedLifeEvent; sourceLabel: string }>;
  onPrepare: (clientId: string, event: DetectedLifeEvent) => void;
  onView: (clientId: string) => void;
  onScheduleCall: (clientId: string) => void;
}) {
  return (
    <div>
      <ModuleHeader title="Life Stage & Events" subtitle="Transaction-based life event signals — months before customers self-report." />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        {(Object.entries(LIFE_EVENT_CONFIG) as Array<[DetectedLifeEvent['eventType'], typeof LIFE_EVENT_CONFIG[DetectedLifeEvent['eventType']]]>).map(([key, config]) => {
          const stats = BANKWIDE_EVENT_STATS[key];
          const IconComponent = iconMap[config.icon] || AlertCircle;
          return (
            <Card key={key} className="border border-slate-200">
              <CardContent className="p-3 text-center">
                <div className={cn('mx-auto w-10 h-10 rounded-lg flex items-center justify-center mb-2', `bg-${config.color}-50`)}>
                  <IconComponent className={cn('h-5 w-5', `text-${config.color}-600`)} />
                </div>
                <p className="text-xs font-medium text-slate-700 mb-1">{config.label}</p>
                <p className="text-lg font-bold text-slate-900">{stats.detected.toLocaleString()}</p>
                <Badge className="text-[9px] px-1 py-0 bg-slate-100 text-slate-600 mt-1">{stats.avgConfidence}% avg</Badge>
                <p className="text-[10px] text-red-500 mt-1">{stats.urgent} urgent</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <h4 className="text-xs font-semibold text-slate-700 mb-2">Example Detected Clients</h4>
      <div className="flex flex-col gap-2">
        {clientEventPairs.slice(0, 12).map((item, idx) => (
          <LifeEventAlertCard
            key={`${item.client.id}-${item.event.eventType}-${idx}`}
            client={item.client}
            event={item.event}
            onPrepare={onPrepare}
            onView={onView}
            onScheduleCall={onScheduleCall}
            showEventLabel
            sourceLabel={item.sourceLabel}
          />
        ))}
      </div>
    </div>
  );
}

const WALLET_TIERS = [
  { label: 'Preferred', aum: '<$250k',      customers: '1.6M', avgProducts: 2.1, share: 68 },
  { label: 'Premium',   aum: '$250k–$1M',   customers: '620k', avgProducts: 3.4, share: 26 },
  { label: 'Private',   aum: '$1M+',        customers: '180k', avgProducts: 4.6, share: 6 },
];

function WalletDepthModule() {
  return (
    <div>
      <ModuleHeader title="Wallet Depth Tiers" subtitle="Depth of relationship by wealth band — where product velocity accelerates." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {WALLET_TIERS.map(t => (
          <div key={t.label} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-900">{t.label}</span>
              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">{t.aum}</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{t.avgProducts}</p>
            <p className="text-[11px] text-slate-500">avg products per customer</p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{t.customers} customers</span>
              <span>{t.share}% of base</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AtRiskModule({
  clientEventPairs, onPrepare, onView, onScheduleCall,
}: {
  clientEventPairs: Array<{ client: DashboardClient; event: DetectedLifeEvent; sourceLabel: string }>;
  onPrepare: (clientId: string, event: DetectedLifeEvent) => void;
  onView: (clientId: string) => void;
  onScheduleCall: (clientId: string) => void;
}) {
  const atRisk = clientEventPairs.slice(0, 6);
  return (
    <div>
      <ModuleHeader title="At-Risk & Thin Relationships" subtitle="Single-product or dormant customers showing engagement decline." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MiniStat label="Thin (1 product)" value="912k" tone="red" />
        <MiniStat label="Dormant 90d+" value="184k" tone="amber" />
        <MiniStat label="Deposit outflow" value="62k" tone="amber" />
        <MiniStat label="Priority follow-ups" value="28k" tone="emerald" />
      </div>
      <div className="flex flex-col gap-2">
        {atRisk.map((item, idx) => (
          <LifeEventAlertCard
            key={`atrisk-${item.client.id}-${idx}`}
            client={item.client}
            event={item.event}
            onPrepare={onPrepare}
            onView={onView}
            onScheduleCall={onScheduleCall}
            showEventLabel
            sourceLabel="Thin relationship"
          />
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: 'red' | 'amber' | 'emerald' }) {
  const tones: Record<string, string> = {
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <div className={cn("rounded-lg border p-3", tones[tone])}>
      <p className="text-[11px] font-medium opacity-80">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function MetricCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', bg)}>{icon}</div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function mapEventType(raw: string): DetectedLifeEvent['eventType'] | null {
  const lower = raw.toLowerCase().replace(/[\s_-]+/g, '_');
  const map: Record<string, DetectedLifeEvent['eventType']> = {
    retirement: 'retirement',
    retirement_planning: 'retirement',
    education: 'education',
    education_funding: 'education',
    home_purchase: 'home_purchase',
    home: 'home_purchase',
    wealth_transfer: 'wealth_transfer',
    estate: 'wealth_transfer',
    business_liquidity: 'business_liquidity',
    business: 'business_liquidity',
    family_formation: 'family_formation',
    family: 'family_formation',
    baby: 'family_formation',
    elder_care: 'elder_care',
    eldercare: 'elder_care',
  };
  return map[lower] || null;
}
