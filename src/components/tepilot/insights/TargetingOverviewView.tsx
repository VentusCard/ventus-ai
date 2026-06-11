import { Zap, Megaphone, Route, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  accent: string;
}[] = [
  {
    key: 'targeting-automated-flows',
    icon: Zap,
    title: 'Automated Flows',
    tagline: 'Always-on journeys triggered by lifestyle signals.',
    bullets: [
      'Listens for life events, category spikes, and wallet-share leaks in real time.',
      'Routes each customer to the right message, channel, and cadence.',
      'Cohort × product roll-up shows where flows over- and under-index.',
    ],
    diff: 'Replaces monthly batch lists with continuous, behavior-triggered outreach.',
    cta: 'Open Automated Flows',
    accent: 'from-amber-50 to-white border-amber-200',
  },
  {
    key: 'targeting-campaign-builder',
    icon: Megaphone,
    title: 'Campaign Builder',
    tagline: 'Author one-off campaigns in minutes, not days.',
    bullets: [
      'AI brief drafts subject, body, and offer from a one-line prompt.',
      'Audience preview reuses the same lifestyle cohorts as Analytics.',
      'Channel and timing controls with built-in guardrails.',
    ],
    diff: 'Cuts campaign setup from days to minutes without leaving the platform.',
    cta: 'Open Campaign Builder',
    accent: 'from-rose-50 to-white border-rose-200',
  },
  {
    key: 'targeting',
    icon: Route,
    title: 'Next-product',
    tagline: 'Per-customer ranked product recommendations.',
    bullets: [
      'Grounded in transaction behavior, not generic propensity models.',
      'Pairs each recommendation with the behavioral trigger behind it.',
      'Cohort × product heatmap highlights where each product over-indexes.',
    ],
    diff: 'Moves from blanket cross-sell lists to 1:1 next-best product calls.',
    cta: 'Open Next-product',
    accent: 'from-blue-50 to-white border-blue-200',
  },
];

export function TargetingOverviewView({ onNavigate }: TargetingOverviewViewProps) {
  return (
    <div className="max-w-[1100px] mx-auto py-2">
      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 mb-3">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Targeting</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">
          Reach the right customer at the right moment
        </h1>
        <p className="mt-3 text-[15px] text-slate-600 leading-relaxed max-w-3xl">
          The Targeting suite turns enriched lifestyle signals into action — deciding who to contact,
          what to say, and when to send it. Three execution modes share one cohort engine.
        </p>
      </div>

      {/* Why it matters */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { k: 'Lifestyle-driven', v: 'Beyond demographics and FICO bands.' },
          { k: 'Trigger-based', v: 'Replaces batch blasts with live signals.' },
          { k: 'One cohort engine', v: 'Same audience logic across all three modes.' },
        ].map((p) => (
          <div key={p.k} className="border border-slate-200 rounded-lg px-4 py-3 bg-white">
            <div className="text-[12px] font-semibold text-slate-900">{p.k}</div>
            <div className="text-[12px] text-slate-600 mt-0.5">{p.v}</div>
          </div>
        ))}
      </div>

      {/* Function cards */}
      <div className="space-y-4">
        {FUNCTIONS.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => onNavigate(f.key)}
              className={cn(
                "group w-full text-left rounded-xl border bg-gradient-to-br p-5 transition-all hover:shadow-md hover:border-slate-300",
                f.accent
              )}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[13px] font-medium text-blue-700 group-hover:gap-1.5 transition-all">
                      {f.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-700 mt-0.5">{f.tagline}</p>

                  <ul className="mt-3 space-y-1.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[13px] text-slate-700">
                        <span className="text-slate-400 mt-1.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 inline-flex items-start gap-2 px-3 py-1.5 rounded-md bg-white/70 border border-slate-200">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">What's different</span>
                    <span className="text-[12px] text-slate-700">{f.diff}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* How they work together */}
      <div className="mt-10 border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">How they work together</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: 1, t: 'Surface', d: 'Analytics identifies a cohort, signal, or wallet-share leak worth acting on.' },
            { n: 2, t: 'Execute', d: 'Pick the right mode — always-on flow, one-off campaign, or 1:1 next-best product.' },
            { n: 3, t: 'Measure', d: 'Outcomes flow back to Rewards and Analytics dashboards for tuning.' },
          ].map((s) => (
            <div key={s.n} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[13px] font-semibold flex items-center justify-center mb-2">
                {s.n}
              </div>
              <div className="text-[14px] font-semibold text-slate-900">{s.t}</div>
              <div className="text-[12px] text-slate-600 mt-1 leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-slate-500 italic">
          All three modes share the same enrichment + cohort engine — no duplicated audience logic.
        </p>
      </div>
    </div>
  );
}
