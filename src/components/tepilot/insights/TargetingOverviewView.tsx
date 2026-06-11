import { Zap, Megaphone, Route, ArrowRight, Sparkles } from "lucide-react";

interface TargetingOverviewViewProps {
  onNavigate: (tab: 'targeting-automated-flows' | 'targeting-campaign-builder' | 'targeting') => void;
}

const FUNCTIONS: {
  key: 'targeting-automated-flows' | 'targeting-campaign-builder' | 'targeting';
  icon: React.ElementType;
  title: string;
  tagline: string;
  bullets: string[];
  diff: string;
  cta: string;
}[] = [
  {
    key: 'targeting-automated-flows',
    icon: Zap,
    title: 'Automated Flows',
    tagline: 'Always-on, signal-triggered journeys.',
    bullets: [
      'Listens for life events and category spikes.',
      'Routes to the right channel and cadence.',
      'Cohort × product roll-up of every flow.',
    ],
    diff: 'Replaces monthly batch lists with continuous, behavior-triggered outreach.',
    cta: 'Open',
  },
  {
    key: 'targeting-campaign-builder',
    icon: Megaphone,
    title: 'Campaign Builder',
    tagline: 'Author one-off campaigns in minutes.',
    bullets: [
      'AI brief drafts subject, body, and offer.',
      'Audience preview on lifestyle cohorts.',
      'Channel and timing with guardrails.',
    ],
    diff: 'Cuts campaign setup from days to minutes without leaving the platform.',
    cta: 'Open',
  },
  {
    key: 'targeting',
    icon: Route,
    title: 'Next-product',
    tagline: 'Per-customer ranked recommendations.',
    bullets: [
      'Grounded in transaction behavior.',
      'Pairs each rec with its behavioral trigger.',
      'Heatmap of where products over-index.',
    ],
    diff: 'Moves from blanket cross-sell lists to 1:1 next-best product calls.',
    cta: 'Open',
  },
];

export function TargetingOverviewView({ onNavigate }: TargetingOverviewViewProps) {
  return (
    <div className="max-w-[960px] mx-auto py-2">
      {/* Hero */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 mb-3">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Targeting</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
          Reach the right customer at the right moment
        </h1>
        <p className="mt-2 text-[14px] text-slate-600 leading-relaxed max-w-2xl">
          Three execution modes share one cohort engine — pick the one that fits the moment.
        </p>
      </div>

      {/* Three side-by-side cards */}
      <div className="grid grid-cols-3 gap-4">
        {FUNCTIONS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => onNavigate(f.key)}
              className="group h-full flex flex-col text-left rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:border-slate-300"
            >
              {/* Top: icon + title */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-700" />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 leading-tight">{f.title}</h3>
              </div>
              <p className="text-[12px] text-slate-600 leading-snug mb-3">{f.tagline}</p>

              {/* Middle: bullets */}
              <ul className="space-y-1.5 mb-3">
                {f.bullets.map((b) => (
                  <li key={b} className="flex gap-1.5 text-[12px] text-slate-700 leading-snug">
                    <span className="text-slate-400 shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Spacer */}
              <div className="flex-1" />

              {/* What's different */}
              <div className="rounded-md bg-blue-50/60 border border-blue-100 px-2.5 py-2 mb-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 mb-0.5">
                  What's different
                </div>
                <div className="text-[12px] text-slate-700 leading-snug">{f.diff}</div>
              </div>

              {/* CTA */}
              <div className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-700 group-hover:gap-1.5 transition-all">
                {f.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
