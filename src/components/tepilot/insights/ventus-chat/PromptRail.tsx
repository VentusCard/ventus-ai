import { TrendingDown, TrendingUp, Users, Megaphone } from "lucide-react";

export interface PromptGroup {
  label: string;
  icon: React.ElementType;
  prompts: string[];
}

export const PROMPT_GROUPS: PromptGroup[] = [
  {
    label: "Deposits & outflow",
    icon: TrendingDown,
    prompts: [
      "Where are we losing deposits?",
      "Which competitors are pulling the most outflow?",
      "What would a win-back campaign be worth?",
    ],
  },
  {
    label: "Growth & pillars",
    icon: TrendingUp,
    prompts: [
      "Top growth pillars this quarter",
      "Which pillar is accelerating fastest MoM?",
      "Biggest cross-sell opportunities",
    ],
  },
  {
    label: "Segments & life events",
    icon: Users,
    prompts: [
      "Which segments need a leadership brief?",
      "How many households show home-purchase signals?",
      "Which life event has the highest product attach rate?",
    ],
  },
  {
    label: "Campaigns & activation",
    icon: Megaphone,
    prompts: [
      "What campaign should we launch next?",
      "Which offers underperform against baseline?",
      "Draft a one-page brief for the retail leadership team",
    ],
  },
];

interface PromptRailProps {
  onSelect: (prompt: string) => void;
}

export function PromptRail({ onSelect }: PromptRailProps) {
  return (
    <aside className="hidden xl:flex w-60 shrink-0 flex-col gap-5 overflow-y-auto border-r border-slate-200 bg-white px-4 py-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Starter prompts</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Grounded on the bankwide book — pick a thread to start.
        </p>
      </div>
      {PROMPT_GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.label}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-600">{group.label}</span>
            </div>
            <div className="space-y-1">
              {group.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSelect(prompt)}
                  className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-[11.5px] leading-snug text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
