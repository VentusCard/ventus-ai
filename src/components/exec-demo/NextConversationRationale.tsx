import { Mail, MessageSquare, Bell, Sparkles, ChevronRight, ArrowUpRight, Smartphone, UserCheck, CalendarCheck, Heart, Gift, Shield, Lightbulb, Star, Compass, Flower, PenLine, Cake, Plane, Home, Briefcase } from "lucide-react";
import type { CardActions, CardAction } from "./NextProductRationale";
import type { ProductCard } from "./ProductCardsPhoneView";

export type SignalKind = "lifeEvent" | "lifestyle" | "risk" | "segment" | "all";

export interface SelectedSignal {
  kind: SignalKind;
  label: string;
  source?: string;
}

interface Playbook {
  signalSource: string;
  automatedFlow: {
    channel: "Email" | "SMS" | "Push";
    subject: string;
    triggerLogic: string;
    sequence: string[];
  };
  chatbotContext: {
    knows: string[];
    canAnswer: string[];
  };
  advisorBrief: {
    recipient: string;
    briefBullets: string[];
    suggestedOutreach: string;
  };
}

const FALLBACK_PLAYBOOK: Playbook = {
  signalSource: "behavioral signal detected from transaction history",
  automatedFlow: {
    channel: "Email",
    subject: "A personalized recommendation for you",
    triggerLogic: "Signal detected → 24h delay → send",
    sequence: ["Educational nudge", "Product spotlight", "Soft conversion CTA"],
  },
  chatbotContext: {
    knows: ["Recent spending pattern", "Account holdings", "Recent product interactions"],
    canAnswer: ['"What products fit my situation?"', '"Show me relevant offers"'],
  },
  advisorBrief: {
    recipient: "Assigned relationship manager",
    briefBullets: [
      "Suggested talking points based on detected signal",
      "Cross-sell opportunities aligned to behavior",
      "Recent activity summary",
    ],
    suggestedOutreach: "Within 5 business days",
  },
};

// Keyed by lowercased label; substring match
const PLAYBOOKS: Record<string, Playbook> = {
  "home buyer": {
    signalSource: "detected from escrow deposit + title insurance fees",
    automatedFlow: {
      channel: "Email",
      subject: '"Your home journey starts here"',
      triggerLogic: "Escrow detected → 24h delay → multi-step nurture",
      sequence: ["Mortgage pre-approval CTA", "Homeowners insurance bundle", "HELOC eligibility post-close"],
    },
    chatbotContext: {
      knows: ["Estimated closing date", "Down payment size", "Property location"],
      canAnswer: ['"When\'s my first mortgage payment?"', '"What insurance do I need?"', '"Can I open a HELOC?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Estate plan update for new property",
        "Jumbo mortgage vs portfolio loan analysis",
        "Liquidity timing for down payment",
      ],
      suggestedOutreach: "Within 48 hours",
    },
  },
  "new parent": {
    signalSource: "detected from hospital + baby retailer + pediatric purchases",
    automatedFlow: {
      channel: "Email",
      subject: '"Financial planning for your growing family"',
      triggerLogic: "Baby spend pattern → 3-day delay → family series",
      sequence: ["529 college savings intro", "Term life insurance review", "Joint account / beneficiary update"],
    },
    chatbotContext: {
      knows: ["Approximate child arrival window", "Healthcare spend changes", "Updated household income needs"],
      canAnswer: ['"How do I open a 529?"', '"Should I update my beneficiaries?"', '"What insurance should I add?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Estate plan + guardianship documentation review",
        "529 funding strategy aligned to projected tuition",
        "Term life coverage gap analysis",
      ],
      suggestedOutreach: "Within 1 week",
    },
  },
  "retirement": {
    signalSource: "detected from age cohort + 401k contribution shifts + planning searches",
    automatedFlow: {
      channel: "Email",
      subject: '"Your retirement readiness check-in"',
      triggerLogic: "Pre-retirement cohort → quarterly nurture",
      sequence: ["Income replacement calculator", "Roth conversion education", "Medicare timing reminder"],
    },
    chatbotContext: {
      knows: ["Years to target retirement", "Tax-deferred balance", "Social Security timing"],
      canAnswer: ['"When can I retire?"', '"Should I do a Roth conversion?"', '"How do I enroll in Medicare?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Glide-path rebalancing recommendation",
        "Roth conversion ladder modeling",
        "Withdrawal sequencing & tax optimization plan",
      ],
      suggestedOutreach: "Within 2 weeks · schedule annual review",
    },
  },
  "wealth transfer": {
    signalSource: "detected from large inflow + estate attorney payments",
    automatedFlow: {
      channel: "Email",
      subject: '"Planning your inheritance with confidence"',
      triggerLogic: "Large inflow detected → 48h delay → discreet outreach",
      sequence: ["Trust & estate primer", "Investment policy statement intro", "Family governance resources"],
    },
    chatbotContext: {
      knows: ["Approximate transfer size", "Account funding source", "Existing investment posture"],
      canAnswer: ['"How should I invest an inheritance?"', '"Do I need a trust?"', '"What are the tax implications?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor + estate specialist",
      briefBullets: [
        "Generational wealth strategy session",
        "Trust structuring & beneficiary alignment",
        "Tax-loss harvesting & step-up basis review",
      ],
      suggestedOutreach: "Within 24 hours",
    },
  },
  "travel": {
    signalSource: "detected from airline + lodging + foreign currency activity",
    automatedFlow: {
      channel: "Push",
      subject: '"Your travel-ready toolkit"',
      triggerLogic: "Travel booking detected → immediate pre-trip series",
      sequence: ["No-foreign-fee card highlight", "Travel insurance offer", "Trip rewards reminder"],
    },
    chatbotContext: {
      knows: ["Upcoming destination", "Trip duration", "Card with best travel rewards"],
      canAnswer: ['"Which card should I use abroad?"', '"How do I avoid FX fees?"', '"Add travel insurance?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Liquidity check for extended travel",
        "Concierge / premium card upgrade discussion",
        "International account access readiness",
      ],
      suggestedOutreach: "Pre-trip courtesy call",
    },
  },
  "luxury": {
    signalSource: "detected from premium retailer + high-ticket discretionary spend",
    automatedFlow: {
      channel: "Email",
      subject: '"Exclusive benefits matched to how you spend"',
      triggerLogic: "Luxury pattern → monthly curated series",
      sequence: ["Premium card upgrade offer", "Concierge benefits showcase", "Private banking invitation"],
    },
    chatbotContext: {
      knows: ["Preferred retailer categories", "Average ticket size", "Reward potential"],
      canAnswer: ['"Am I missing rewards?"', '"What perks come with my card?"', '"How do I unlock concierge?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "Private banking eligibility review",
        "Lifestyle financing options (art, auto, jewelry)",
        "Concierge & exclusive access onboarding",
      ],
      suggestedOutreach: "Within 1 week",
    },
  },
  "health": {
    signalSource: "detected from gym, wellness, and healthy retailer activity",
    automatedFlow: {
      channel: "Push",
      subject: '"Wellness rewards just for you"',
      triggerLogic: "Wellness pattern → monthly perk drops",
      sequence: ["HSA contribution nudge", "Wellness merchant cashback", "Fitness partner offers"],
    },
    chatbotContext: {
      knows: ["Wellness category spend", "HSA contribution status", "Recurring gym/wellness subs"],
      canAnswer: ['"Should I contribute more to my HSA?"', '"Any wellness cashback?"', '"Best card for fitness spend?"'],
    },
    advisorBrief: {
      recipient: "Wealth advisor",
      briefBullets: [
        "HSA maximization as long-term vehicle",
        "Long-term care planning conversation",
        "Health-aligned investment themes",
      ],
      suggestedOutreach: "Next scheduled review",
    },
  },
  "gambling": {
    signalSource: "detected from gambling MCC transactions",
    automatedFlow: {
      channel: "Push",
      subject: '"A discreet check-in on your spending"',
      triggerLogic: "Risk threshold crossed → wellness check (no marketing)",
      sequence: ["Spending insights nudge", "Self-control tools (limits, alerts)", "Confidential support resources"],
    },
    chatbotContext: {
      knows: ["Recent gambling-category spend pattern", "Available account controls", "Support resource directory"],
      canAnswer: ['"Can I set a spending limit?"', '"How do I block certain merchants?"', '"Where can I get support?"'],
    },
    advisorBrief: {
      recipient: "Compliance + wealth advisor",
      briefBullets: [
        "Compliance escalation per risk policy",
        "Discreet wellness conversation talking points",
        "Account control & monitoring recommendations",
      ],
      suggestedOutreach: "Compliance review within 24 hours",
    },
  },
  "suspicious": {
    signalSource: "detected from anomalous international or high-risk activity",
    automatedFlow: {
      channel: "SMS",
      subject: '"Confirm recent activity on your account"',
      triggerLogic: "Anomaly score crossed → immediate verification",
      sequence: ["Transaction confirmation prompt", "Card-freeze quick action", "Fraud team callback option"],
    },
    chatbotContext: {
      knows: ["Flagged transaction details", "Account verification status", "Card-control options"],
      canAnswer: ['"Was this transaction me?"', '"Freeze my card now"', '"Connect me to fraud team"'],
    },
    advisorBrief: {
      recipient: "Compliance + wealth advisor",
      briefBullets: [
        "AML/KYC review per policy",
        "Coordinated client outreach script",
        "Account monitoring & travel-notice update",
      ],
      suggestedOutreach: "Compliance review within 24 hours",
    },
  },
  "adult": {
    signalSource: "detected from adult-content merchant activity",
    automatedFlow: {
      channel: "Push",
      subject: '"Quiet account controls available"',
      triggerLogic: "Sensitive category detected → discreet, non-marketing surface",
      sequence: ["Privacy & control reminder", "Statement-detail preferences", "No further marketing on category"],
    },
    chatbotContext: {
      knows: ["Available privacy controls", "Statement preferences", "Account controls"],
      canAnswer: ['"How do I hide statement details?"', '"Set merchant controls"'],
    },
    advisorBrief: {
      recipient: "Compliance review (no advisor outreach)",
      briefBullets: [
        "No proactive outreach — privacy first",
        "Log per compliance policy",
        "Suppress related marketing",
      ],
      suggestedOutreach: "No proactive outreach",
    },
  },
};

function findPlaybook(label: string): Playbook {
  const key = label.toLowerCase();
  for (const k of Object.keys(PLAYBOOKS)) {
    if (key.includes(k)) return PLAYBOOKS[k];
  }
  return { ...FALLBACK_PLAYBOOK, signalSource: `detected from ${label.toLowerCase()} signal` };
}

const KIND_META: Record<SignalKind, { label: string; color: string; bg: string; border: string }> = {
  lifeEvent: { label: "Life Event", color: "#92400e", bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.35)" },
  lifestyle: { label: "Spending Habit", color: "#0e7490", bg: "rgba(6,182,212,.10)", border: "rgba(6,182,212,.32)" },
  risk: { label: "Risk", color: "#991b1b", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.32)" },
  segment: { label: "Segment", color: "#5b21b6", bg: "rgba(139,92,246,.10)", border: "rgba(139,92,246,.32)" },
  all: { label: "All Signals", color: "#334155", bg: "rgba(100,116,139,.10)", border: "rgba(100,116,139,.32)" },
};

// Local action pill icon/color maps (mirror NextProductRationale)
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  smartphone: Smartphone, mail: Mail, "user-check": UserCheck, calendar: CalendarCheck,
  heart: Heart, gift: Gift, shield: Shield, lightbulb: Lightbulb, star: Star,
  compass: Compass, flower: Flower, "pen-line": PenLine, cake: Cake, plane: Plane,
  home: Home, briefcase: Briefcase, bell: Bell,
};
const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  blue: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  amber: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  violet: { text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  teal: { text: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  rose: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  sky: { text: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
  orange: { text: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  indigo: { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  pink: { text: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" },
};

function renderActionPill(action: CardAction, key: string | number) {
  const IconComp = ICON_MAP[action.icon] || Bell;
  const colors = COLOR_MAP[action.color] || COLOR_MAP.violet;
  const isWow = action.tone === "wow";
  return (
    <span
      key={key}
      className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2.5 py-1 border ${colors.text} ${colors.bg} ${colors.border}`}
      style={isWow ? { boxShadow: "0 0 0 1px currentColor" } : undefined}
    >
      {isWow && <Sparkles className="w-2 h-2 text-amber-400" />}
      <IconComp className="w-2.5 h-2.5" />
      {action.label}
    </span>
  );
}

interface Props {
  selectedSignal?: SelectedSignal | null;
  availableSignals?: SelectedSignal[];
  customerFirstName?: string;
  productActions?: CardActions[] | null;
  actionsLoading?: boolean;
  productCards?: ProductCard[] | null;
  onSelectSignal?: (s: SelectedSignal) => void;
  onOpenWMCopilot?: () => void;
  onOpenAIAssistant?: () => void;
}

export default function NextConversationRationale({
  selectedSignal,
  availableSignals = [],
  customerFirstName = "the client",
  productActions,
  actionsLoading,
  productCards,
  onSelectSignal,
  onOpenWMCopilot,
  onOpenAIAssistant,
}: Props) {
  const effectiveSignal: SelectedSignal =
    selectedSignal ?? availableSignals[0] ?? { kind: "all", label: "All Signals" };

  // ALL SIGNALS view — compact roll-up
  if (effectiveSignal.kind === "all") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Orchestration roll-up · all signals
        </div>
        <div className="space-y-1.5">
          {availableSignals.length === 0 && (
            <div className="text-[11px] text-slate-400 italic">No signals detected yet</div>
          )}
          {availableSignals.map((s) => {
            const pb = findPlaybook(s.label);
            const meta = KIND_META[s.kind];
            return (
              <button
                key={`${s.kind}-${s.label}`}
                onClick={() => onSelectSignal?.(s)}
                className="w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  {meta.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-700">{s.label}</span>
                <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                  <ChannelIcon channel={pb.automatedFlow.channel} /> {pb.automatedFlow.channel}
                  <> · <Bell className="w-2.5 h-2.5 inline" /> Advisor</>
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const playbook = findPlaybook(effectiveSignal.label);
  const meta = KIND_META[effectiveSignal.kind];

  // Match dynamic actions from generate-product-actions to this signal
  const matchedActions: CardAction[] = (() => {
    if (!productActions || productActions.length === 0 || !productCards) return [];
    const sigLower = effectiveSignal.label.toLowerCase();
    let matchIdx = -1;
    for (let i = 0; i < productCards.length; i++) {
      const cardLabel = (productCards[i].signal_label || "").toLowerCase();
      if (cardLabel && (cardLabel.includes(sigLower) || sigLower.includes(cardLabel))) {
        matchIdx = i;
        break;
      }
    }
    if (matchIdx === -1) matchIdx = productCards[0] ? 0 : -1;
    if (matchIdx === -1) return [];
    const found = productActions.find(a => a.card_index === matchIdx);
    return found?.actions || [];
  })();

  const wowActions = matchedActions.filter(a => a.tone === "wow");
  const standardActions = matchedActions.filter(a => a.tone === "standard");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-2.5 flex flex-col h-full min-h-0">
      {/* Vertical split: Regular (left) | Wealth (right) */}
      <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
        {/* REGULAR CLIENT — LEFT */}
        <div className="pr-3 flex flex-col h-full">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Regular Client
            </span>
          </div>

          <div className="flex-1 space-y-2.5 min-h-0">
            {/* Automated flow */}
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(59,130,246,.05)",
                border: "1px solid rgba(59,130,246,.18)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <ChannelIcon channel={playbook.automatedFlow.channel} color="#3b82f6" />
                <span className="text-sm font-semibold text-blue-900">
                  {playbook.automatedFlow.channel} flow
                </span>
              </div>
              <div className="text-sm font-medium text-slate-700 mb-1 leading-snug">
                {playbook.automatedFlow.subject}
              </div>
              <div className="text-xs text-slate-500 italic mb-1.5 leading-snug">
                {playbook.automatedFlow.triggerLogic}
              </div>
              <ul className="space-y-1">
                {playbook.automatedFlow.sequence.map((step, i) => (
                  <li key={step} className="text-sm text-slate-600 leading-snug flex items-start gap-1.5">
                    <span className="text-xs tabular-nums text-blue-400 font-bold mt-[2px]">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chatbot context */}
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(59,130,246,.05)",
                border: "1px solid rgba(59,130,246,.18)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />
                <span className="text-sm font-semibold text-blue-900">AI Chatbot context</span>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Knows
              </div>
              <ul className="space-y-1 mb-2">
                {playbook.chatbotContext.knows.map((k) => (
                  <li key={k} className="text-sm text-slate-600 leading-snug flex items-start gap-1.5">
                    <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0 bg-blue-400" />
                    {k}
                  </li>
                ))}
              </ul>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Can answer
              </div>
              <ul className="space-y-1">
                {playbook.chatbotContext.canAnswer.map((q) => (
                  <li key={q} className="text-sm text-slate-600 leading-snug italic">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Open AI Banking Assistant button */}
          <button
            onClick={onOpenAIAssistant}
            className="w-full mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold rounded-lg px-3 py-2.5 text-white transition-all hover:scale-[1.02] hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              boxShadow: "0 2px 8px rgba(59,130,246,.35)",
            }}
          >
            Open AI Banking Assistant
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="pl-3 border-l border-slate-200 flex flex-col h-full">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Wealth Client <span className="text-purple-400">(+)</span>
            </span>
          </div>

          <div className="flex-1 space-y-2.5 min-h-0">
            {/* Advisor brief */}
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                background: "rgba(139,92,246,.05)",
                border: "1px dashed rgba(139,92,246,.32)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bell className="w-3.5 h-3.5" style={{ color: "#8b5cf6" }} />
                <span className="text-sm font-semibold text-purple-900">
                  Advisor notification + prep brief
                </span>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                <span className="font-semibold">Sent to:</span> {playbook.advisorBrief.recipient}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Personalized prep brief includes
              </div>
              <ul className="space-y-1 mb-2">
                {playbook.advisorBrief.briefBullets.map((b) => (
                  <li key={b} className="text-sm text-slate-600 leading-snug flex items-start gap-1.5">
                    <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0 bg-purple-400" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="text-sm text-slate-600">
                <span className="font-semibold">Suggested outreach:</span>{" "}
                <span className="text-purple-700 font-semibold">{playbook.advisorBrief.suggestedOutreach}</span>
              </div>
            </div>

            {/* Concierge / Standard action pills (from generate-product-actions) */}
            {actionsLoading && matchedActions.length === 0 ? (
              <div className="rounded-lg px-3 py-2.5 border border-purple-100 bg-purple-50/40">
                <div className="text-[11px] text-purple-400 italic flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Generating advisor actions…
                </div>
              </div>
            ) : matchedActions.length > 0 ? (
              <div className="rounded-lg px-3 py-2.5 space-y-2"
                style={{ background: "rgba(139,92,246,.04)", border: "1px solid rgba(139,92,246,.20)" }}
              >
                {wowActions.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-1 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Concierge Touch
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {wowActions.map((a, i) => renderActionPill(a, `wow-${i}`))}
                    </div>
                  </div>
                )}
                {standardActions.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Standard Response
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {standardActions.map((a, i) => renderActionPill(a, `std-${i}`))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Open WM Copilot button */}
          <button
            onClick={onOpenWMCopilot}
            className="w-full mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold rounded-lg px-3 py-2.5 text-white transition-all hover:scale-[1.02] hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              boxShadow: "0 2px 8px rgba(139,92,246,.35)",
            }}
          >
            Open WM CoPilot
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChannelIcon({ channel, color = "currentColor" }: { channel: "Email" | "SMS" | "Push"; color?: string }) {
  if (channel === "Email") return <Mail className="w-3 h-3" style={{ color }} />;
  if (channel === "SMS") return <MessageSquare className="w-3 h-3" style={{ color }} />;
  return <Bell className="w-3 h-3" style={{ color }} />;
}
