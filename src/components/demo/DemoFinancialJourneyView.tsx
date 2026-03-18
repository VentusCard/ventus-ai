import type { DemoCustomer } from "@/lib/demoData";
import type { DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap, TrendingUp, ArrowUpCircle, Send, CalendarClock,
  CheckCircle2, Clock, Timer, ChevronRight, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  detectedEventA: DetectedLifeEventResult[];
  detectedEventB: DetectedLifeEventResult[];
}

type SignalType = "Life Event" | "Spending Pattern" | "Upgrade";
type QueueStatus = "ready" | "queued" | "scheduled";

interface QueuedAction {
  product: string;
  match: number;
  signalType: SignalType;
  status: QueueStatus;
  triggerName: string;
  triggerConfidence?: number;
  evidence: string[];
  personalizedMessage: string;
  annualValue: string;
}

function statusFromMatch(match: number): QueueStatus {
  if (match >= 85) return "ready";
  if (match >= 70) return "queued";
  return "scheduled";
}

const statusConfig: Record<QueueStatus, { label: string; icon: typeof CheckCircle2; borderClass: string; pillBg: string; pillText: string }> = {
  ready: { label: "Ready to Send", icon: CheckCircle2, borderClass: "border-l-emerald-500", pillBg: "bg-emerald-50", pillText: "text-emerald-700" },
  queued: { label: "Queued", icon: Clock, borderClass: "border-l-amber-500", pillBg: "bg-amber-50", pillText: "text-amber-700" },
  scheduled: { label: "Scheduled", icon: Timer, borderClass: "border-l-blue-500", pillBg: "bg-blue-50", pillText: "text-blue-700" },
};

const signalIcons: Record<SignalType, typeof Zap> = {
  "Life Event": Zap,
  "Spending Pattern": TrendingUp,
  "Upgrade": ArrowUpCircle,
};

const signalColors: Record<SignalType, { bg: string; text: string }> = {
  "Life Event": { bg: "bg-purple-50", text: "text-purple-700" },
  "Spending Pattern": { bg: "bg-amber-50", text: "text-amber-700" },
  "Upgrade": { bg: "bg-blue-50", text: "text-blue-700" },
};

function findDetectedEvent(events: DetectedLifeEventResult[], keywords: string[]): DetectedLifeEventResult | undefined {
  return events.find(e => keywords.some(kw => e.event_name.toLowerCase().includes(kw)));
}

function buildEvidence(detectedEvent?: DetectedLifeEventResult, fallback?: string[]): string[] {
  if (detectedEvent?.evidence?.length) {
    return detectedEvent.evidence
      .slice(0, 3)
      .map(ev => `${ev.merchant} — $${ev.amount.toFixed(0)} (${ev.date}): ${ev.relevance}`);
  }
  return fallback ?? [];
}

function generateMessage(name: string, signalType: SignalType, product: string, triggerName: string): string {
  const firstName = name.split(" ")[0];
  if (signalType === "Life Event") {
    return `Hi ${firstName}, based on signals we've detected around ${triggerName.toLowerCase()}, we'd love to discuss how our ${product} could support your next chapter.`;
  }
  if (signalType === "Spending Pattern") {
    return `Hi ${firstName}, your ${triggerName.toLowerCase()} spending suggests you'd benefit from our ${product} — let's make every dollar work harder.`;
  }
  return `Hi ${firstName}, your activity qualifies you for ${product} — unlock better rewards and dedicated support.`;
}

function deriveActions(customer: DemoCustomer, detectedEvents: DetectedLifeEventResult[]): QueuedAction[] {
  const actions: QueuedAction[] = [];
  const name = customer.profile.name;
  const holdings = customer.profile.holdings;
  const pillars = customer.topPillars;

  // Life-event-driven — match against actual AI-detected events
  const homeEvent = findDetectedEvent(detectedEvents, ["home", "house", "mortgage", "property"]);
  if (homeEvent) {
    const match = Math.min(homeEvent.confidence + 5, 98);
    actions.push({
      product: holdings.mortgage === "$0" ? "Mortgage Pre-Approval" : "Home Equity Line of Credit",
      match,
      signalType: "Life Event",
      status: statusFromMatch(match),
      triggerName: homeEvent.event_name,
      triggerConfidence: homeEvent.confidence,
      evidence: buildEvidence(homeEvent),
      personalizedMessage: generateMessage(name, "Life Event", holdings.mortgage === "$0" ? "Mortgage Pre-Approval" : "HELOC", homeEvent.event_name),
      annualValue: holdings.mortgage === "$0" ? "$2,400" : "$1,800",
    });
  }

  const familyEvent = findDetectedEvent(detectedEvents, ["family", "baby", "child", "parent", "pregnan", "education"]);
  if (familyEvent) {
    const match = Math.min(familyEvent.confidence + 3, 96);
    actions.push({
      product: "529 Education Savings Plan",
      match,
      signalType: "Life Event",
      status: statusFromMatch(match),
      triggerName: familyEvent.event_name,
      triggerConfidence: familyEvent.confidence,
      evidence: buildEvidence(familyEvent),
      personalizedMessage: generateMessage(name, "Life Event", "529 Education Savings Plan", familyEvent.event_name),
      annualValue: "$1,200",
    });
  }

  const careerEvent = findDetectedEvent(detectedEvents, ["career", "advance", "promotion", "job", "business"]);
  if (careerEvent) {
    const match = Math.min(careerEvent.confidence + 1, 94);
    actions.push({
      product: "Investment Advisory Account",
      match,
      signalType: "Life Event",
      status: statusFromMatch(match),
      triggerName: careerEvent.event_name,
      triggerConfidence: careerEvent.confidence,
      evidence: buildEvidence(careerEvent),
      personalizedMessage: generateMessage(name, "Life Event", "Investment Advisory Account", careerEvent.event_name),
      annualValue: "$3,200",
    });
  }

  const retireEvent = findDetectedEvent(detectedEvents, ["retire", "pension", "elder"]);
  if (retireEvent) {
    const match = Math.min(retireEvent.confidence + 4, 97);
    actions.push({
      product: "Retirement Planning Suite",
      match,
      signalType: "Life Event",
      status: statusFromMatch(match),
      triggerName: retireEvent.event_name,
      triggerConfidence: retireEvent.confidence,
      evidence: buildEvidence(retireEvent),
      personalizedMessage: generateMessage(name, "Life Event", "Retirement Planning Suite", retireEvent.event_name),
      annualValue: "$4,500",
    });
  }

  // Also add any detected events not yet matched
  for (const ev of detectedEvents) {
    const alreadyUsed = actions.some(a => a.triggerName === ev.event_name);
    if (!alreadyUsed) {
      const match = Math.min(ev.confidence + 2, 95);
      actions.push({
        product: "Personalized Financial Review",
        match,
        signalType: "Life Event",
        status: statusFromMatch(match),
        triggerName: ev.event_name,
        triggerConfidence: ev.confidence,
        evidence: buildEvidence(ev),
        personalizedMessage: generateMessage(name, "Life Event", "Personalized Financial Review", ev.event_name),
        annualValue: "$1,500",
      });
    }
  }

  // Spending pattern
  const travelPillar = pillars.find(p => p.name.toLowerCase() === "travel");
  if (travelPillar && travelPillar.pct >= 15) {
    const match = 78 + Math.round(travelPillar.pct * 0.5);
    actions.push({
      product: "Travel Rewards Card",
      match,
      signalType: "Spending Pattern",
      status: statusFromMatch(match),
      triggerName: "Travel",
      evidence: [`Travel is ${travelPillar.pct}% of total spend (${travelPillar.spend})`, `Top category by volume — high recurring frequency`],
      personalizedMessage: generateMessage(name, "Spending Pattern", "Travel Rewards Card", "travel"),
      annualValue: `$${Math.round(parseInt(travelPillar.spend.replace(/[^0-9]/g, "")) * 0.03)}`,
    });
  }

  const diningPillar = pillars.find(p => p.name.toLowerCase() === "dining");
  if (diningPillar && diningPillar.pct >= 15) {
    const match = 74 + Math.round(diningPillar.pct * 0.4);
    actions.push({
      product: "Dining Cash Back Card",
      match,
      signalType: "Spending Pattern",
      status: statusFromMatch(match),
      triggerName: "Dining",
      evidence: [`Dining represents ${diningPillar.pct}% of monthly spend (${diningPillar.spend})`, `High category concentration — cash back opportunity`],
      personalizedMessage: generateMessage(name, "Spending Pattern", "Dining Cash Back Card", "dining"),
      annualValue: `$${Math.round(parseInt(diningPillar.spend.replace(/[^0-9]/g, "")) * 0.04)}`,
    });
  }

  // Upgrade
  const totalSpendNum = parseInt(customer.txnTotal.replace(/[^0-9]/g, "")) || 0;
  const annualizedSpend = totalSpendNum * 4;
  if (annualizedSpend > 40000 && customer.profile.segment === "Preferred") {
    const match = 74 + Math.min(Math.round((annualizedSpend - 40000) / 2000), 20);
    actions.push({
      product: "Premium Card Upgrade",
      match,
      signalType: "Upgrade",
      status: statusFromMatch(match),
      triggerName: "Spend Velocity",
      evidence: [`Annualized spend ~$${(annualizedSpend / 1000).toFixed(0)}K qualifies for Premium tier`, `Current segment: ${customer.profile.segment} — upgrade unlocks 3x multiplier`],
      personalizedMessage: generateMessage(name, "Upgrade", "Premium Card Upgrade", "Spend Velocity"),
      annualValue: `$${Math.round(annualizedSpend * 0.01)}`,
    });
  }

  const seen = new Set<string>();
  return actions
    .sort((a, b) => b.match - a.match)
    .filter(r => { if (seen.has(r.product)) return false; seen.add(r.product); return true; })
    .slice(0, 5);
}

export default function DemoFinancialJourneyView({ customerA, customerB, detectedEventA, detectedEventB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <CustomerQueue customer={customerA} detectedEvents={detectedEventA} />
      <CustomerQueue customer={customerB} detectedEvents={detectedEventB} />
    </div>
  );
}

function CustomerQueue({ customer, detectedEvents }: { customer: DemoCustomer; detectedEvents: DetectedLifeEventResult[] }) {
  const actions = deriveActions(customer, detectedEvents);

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">No actions queued — awaiting enrichment data</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Queue summary */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">
          {actions.length} Actions Queued
        </span>
        <div className="flex items-center gap-1.5">
          {(["ready", "queued", "scheduled"] as QueueStatus[]).map(s => {
            const count = actions.filter(a => a.status === s).length;
            if (count === 0) return null;
            const cfg = statusConfig[s];
            return (
              <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cfg.pillBg} ${cfg.pillText}`}>
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {actions.map((action, idx) => (
        <ActionCard key={idx} action={action} />
      ))}
    </div>
  );
}

function ActionCard({ action }: { action: QueuedAction }) {
  const cfg = statusConfig[action.status];
  const StatusIcon = cfg.icon;
  const SignalIcon = signalIcons[action.signalType];
  const sigColor = signalColors[action.signalType];

  return (
    <div className={`rounded-xl border border-slate-200 bg-white border-l-4 ${cfg.borderClass} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-4 space-y-3">
        {/* Top row: status + product + match */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${cfg.pillBg} ${cfg.pillText}`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">{action.product}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0" style={{
            borderColor: action.match >= 85 ? "#22c55e" : action.match >= 70 ? "#f59e0b" : "#94a3b8",
            background: action.match >= 85 ? "#f0fdf4" : action.match >= 70 ? "#fffbeb" : "#f8fafc",
          }}>
            <span className="text-xs font-bold" style={{
              color: action.match >= 85 ? "#16a34a" : action.match >= 70 ? "#d97706" : "#64748b",
            }}>{action.match}%</span>
          </div>
        </div>

        {/* Trigger badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[9px] ${sigColor.bg} ${sigColor.text} border-transparent`}>
            <SignalIcon className="w-2.5 h-2.5 mr-1" />
            {action.signalType}
          </Badge>
          <span className="text-[10px] text-slate-600 font-medium">{action.triggerName}</span>
          {action.triggerConfidence != null && (
            <span className="text-[9px] text-slate-400">({action.triggerConfidence}% confidence)</span>
          )}
        </div>

        {/* Evidence */}
        {action.evidence.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Supporting Evidence</p>
            <ul className="space-y-0.5">
              {action.evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600 leading-snug">
                  <ChevronRight className="w-2.5 h-2.5 text-slate-300 mt-0.5 shrink-0" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Personalized message */}
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Personalized Message</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed italic">"{action.personalizedMessage}"</p>
        </div>

        {/* Actions + value */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-slate-400">
            Est. Annual Value: <span className="font-semibold text-emerald-600 text-[10px]">{action.annualValue}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[10px]"
              onClick={() => toast.success(`Scheduled outreach for ${action.product}`)}
            >
              <CalendarClock className="w-3 h-3 mr-1" />
              Schedule
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 px-3 text-[10px]"
              onClick={() => toast.success(`Sent ${action.product} outreach`)}
            >
              <Send className="w-3 h-3 mr-1" />
              Send Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
