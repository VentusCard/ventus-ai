import { Mail, MessageSquare, Bell, Sparkles, ChevronRight } from "lucide-react";

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
  lifestyle: { label: "Lifestyle", color: "#0e7490", bg: "rgba(6,182,212,.10)", border: "rgba(6,182,212,.32)" },
  risk: { label: "Risk", color: "#991b1b", bg: "rgba(239,68,68,.10)", border: "rgba(239,68,68,.32)" },
  segment: { label: "Segment", color: "#5b21b6", bg: "rgba(139,92,246,.10)", border: "rgba(139,92,246,.32)" },
  all: { label: "All Signals", color: "#334155", bg: "rgba(100,116,139,.10)", border: "rgba(100,116,139,.32)" },
};

interface Props {
  selectedSignal?: SelectedSignal | null;
  availableSignals?: SelectedSignal[];
  isWealthClient?: boolean;
  customerFirstName?: string;
}

export default function NextConversationRationale({
  selectedSignal,
  availableSignals = [],
  isWealthClient = true,
  customerFirstName = "the client",
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
                className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-200"
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
                  {isWealthClient && <> · <Bell className="w-2.5 h-2.5 inline" /> Advisor</>}
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-2.5">
      <SelectorBar
        available={availableSignals}
        selected={effectiveSignal}
        onSelect={onSelectSignal}
      />

      {/* Signal context header */}
      <div
        className="rounded-lg px-3 py-2 flex items-center gap-2"
        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold" style={{ color: meta.color }}>
            Signal: {effectiveSignal.label}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            {effectiveSignal.source || playbook.signalSource}
          </div>
        </div>
      </div>

      {/* REGULAR CLIENT ORCHESTRATION */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            Regular Client Orchestration
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Automated flow */}
          <div
            className="rounded-lg px-2.5 py-2"
            style={{
              background: "rgba(59,130,246,.05)",
              border: "1px solid rgba(59,130,246,.18)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <ChannelIcon channel={playbook.automatedFlow.channel} color="#3b82f6" />
              <span className="text-[10px] font-semibold text-blue-900">
                {playbook.automatedFlow.channel} flow
              </span>
            </div>
            <div className="text-[10px] font-medium text-slate-700 mb-0.5 leading-tight">
              {playbook.automatedFlow.subject}
            </div>
            <div className="text-[9px] text-slate-500 italic mb-1 leading-tight">
              {playbook.automatedFlow.triggerLogic}
            </div>
            <ul className="space-y-0.5">
              {playbook.automatedFlow.sequence.map((step, i) => (
                <li key={step} className="text-[10px] text-slate-600 leading-tight flex items-start gap-1">
                  <span className="text-[9px] tabular-nums text-blue-400 font-bold mt-[1px]">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chatbot context */}
          <div
            className="rounded-lg px-2.5 py-2"
            style={{
              background: "rgba(59,130,246,.05)",
              border: "1px solid rgba(59,130,246,.18)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-3 h-3" style={{ color: "#3b82f6" }} />
              <span className="text-[10px] font-semibold text-blue-900">AI Chatbot context</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              Knows
            </div>
            <ul className="space-y-0.5 mb-1.5">
              {playbook.chatbotContext.knows.map((k) => (
                <li key={k} className="text-[10px] text-slate-600 leading-tight flex items-start gap-1">
                  <span className="mt-[3px] w-1 h-1 rounded-full shrink-0 bg-blue-400" />
                  {k}
                </li>
              ))}
            </ul>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              Can answer
            </div>
            <ul className="space-y-0.5">
              {playbook.chatbotContext.canAnswer.map((q) => (
                <li key={q} className="text-[10px] text-slate-600 leading-tight italic">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* WEALTH CLIENT ORCHESTRATION */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
            Wealth Client — Additional Orchestration
          </span>
          <span className="text-[9px] text-slate-400 italic">(includes everything above +)</span>
        </div>
        <div
          className={`rounded-lg px-2.5 py-2 ${!isWealthClient ? "opacity-60" : ""}`}
          style={{
            background: "rgba(139,92,246,.05)",
            border: "1px dashed rgba(139,92,246,.32)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className="w-3 h-3" style={{ color: "#8b5cf6" }} />
            <span className="text-[10px] font-semibold text-purple-900">
              Advisor notification + personalized prep brief
            </span>
          </div>
          <div className="text-[10px] text-slate-600 mb-1.5">
            <span className="font-semibold">Sent to:</span> {playbook.advisorBrief.recipient}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Personalized prep brief includes
          </div>
          <ul className="space-y-0.5 mb-1.5">
            {playbook.advisorBrief.briefBullets.map((b) => (
              <li key={b} className="text-[10px] text-slate-600 leading-tight flex items-start gap-1">
                <span className="mt-[3px] w-1 h-1 rounded-full shrink-0 bg-purple-400" />
                {b}
              </li>
            ))}
          </ul>
          <div className="text-[10px] text-slate-600">
            <span className="font-semibold">Suggested outreach:</span>{" "}
            <span className="text-purple-700 font-semibold">{playbook.advisorBrief.suggestedOutreach}</span>
          </div>
          {!isWealthClient && (
            <div className="mt-1.5 text-[9px] text-slate-400 italic">
              Not active — {customerFirstName} is a regular client
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectorBar({
  available,
  selected,
  onSelect,
}: {
  available: SelectedSignal[];
  selected: SelectedSignal;
  onSelect?: (s: SelectedSignal) => void;
}) {
  const allOption: SelectedSignal = { kind: "all", label: "All Signals" };
  const items = [allOption, ...available];
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {items.map((s) => {
        const isSelected =
          selected.kind === s.kind && selected.label === s.label;
        const meta = KIND_META[s.kind];
        return (
          <button
            key={`${s.kind}-${s.label}`}
            onClick={() => onSelect?.(s)}
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-all duration-150 ${
              isSelected ? "shadow-sm" : "hover:brightness-95"
            }`}
            style={{
              background: isSelected ? meta.color : meta.bg,
              color: isSelected ? "#ffffff" : meta.color,
              border: `1px solid ${isSelected ? meta.color : meta.border}`,
            }}
          >
            {s.kind === "all" && <Layers className="w-2.5 h-2.5" />}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function ChannelIcon({ channel, color = "currentColor" }: { channel: "Email" | "SMS" | "Push"; color?: string }) {
  if (channel === "Email") return <Mail className="w-3 h-3" style={{ color }} />;
  if (channel === "SMS") return <MessageSquare className="w-3 h-3" style={{ color }} />;
  return <Bell className="w-3 h-3" style={{ color }} />;
}
