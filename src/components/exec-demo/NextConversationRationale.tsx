import { Bot, Workflow, Megaphone, BrainCircuit, HeartHandshake, ClipboardCheck } from "lucide-react";

const REGULAR_SECTIONS = [
  {
    icon: Bot,
    title: "AI Chatbot",
    items: ["Spending Q&A & budget alerts", "Product discovery & recommendations", "24/7 self-service support"],
  },
  {
    icon: Workflow,
    title: "Automated Flows",
    items: ["New Parent → 529 Plan nudge", "Home Buyer → Mortgage pre-approval", "Travel threshold → Card upgrade"],
  },
  {
    icon: Megaphone,
    title: "Campaign Engine",
    items: ["Life event targeting triggers", "Lifestyle cohort campaigns", "Cross-sell automation"],
  },
];

const WEALTH_SECTIONS = [
  {
    icon: BrainCircuit,
    title: "WM Copilot",
    items: ["Client psychology profiling", "Meeting prep briefs", "Financial timeline projections"],
  },
  {
    icon: HeartHandshake,
    title: "Assisted Engagement",
    items: ["Life event outreach calls", "Portfolio review scheduling", "Tax & estate advisory"],
  },
  {
    icon: ClipboardCheck,
    title: "Advisor Actions",
    items: ["Follow-up email generation", "Transcript insight analysis", "Action item checklists"],
  },
];

export default function NextConversationRationale() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        Next Conversation Strategy
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Regular Clients */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Regular Clients</span>
          </div>
          <div className="text-[9px] text-slate-400 -mt-1 mb-1">Scalable · Digital-First</div>
          {REGULAR_SECTIONS.map((s) => (
            <SectionCard key={s.title} section={s} accent="blue" />
          ))}
        </div>

        {/* Wealth Clients */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Wealth Clients</span>
          </div>
          <div className="text-[9px] text-slate-400 -mt-1 mb-1">High-Touch · Advisor-Led</div>
          {WEALTH_SECTIONS.map((s) => (
            <SectionCard key={s.title} section={s} accent="purple" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ section, accent }: { section: typeof REGULAR_SECTIONS[0]; accent: "blue" | "purple" }) {
  const Icon = section.icon;
  const colors = accent === "blue"
    ? { bg: "rgba(59,130,246,.06)", border: "rgba(59,130,246,.18)", icon: "#3b82f6", title: "#1e40af" }
    : { bg: "rgba(139,92,246,.06)", border: "rgba(139,92,246,.18)", icon: "#8b5cf6", title: "#5b21b6" };

  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color: colors.icon }} />
        <span className="text-[10px] font-semibold" style={{ color: colors.title }}>{section.title}</span>
      </div>
      <ul className="space-y-0.5">
        {section.items.map((item) => (
          <li key={item} className="text-[10px] text-slate-500 leading-tight flex items-start gap-1">
            <span className="mt-[3px] w-1 h-1 rounded-full shrink-0" style={{ background: colors.icon, opacity: 0.5 }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
