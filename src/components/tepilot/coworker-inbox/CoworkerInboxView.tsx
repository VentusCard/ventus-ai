import { useState } from "react";
import { Sparkles, ChevronDown, Clock, History, MessageSquare, Workflow, Radar, FileText, MessageCircle, Bolt, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROSTER,
  WEEKLY_STATS,
  PERSON_ACTIVITY,
  TEAM_DESTINATIONS,
  type Person,
  type TeamDestination,
} from "./coworkerInboxData";

export function CoworkerInboxView() {
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);

  const emailDelta = WEEKLY_STATS.emailsSent - WEEKLY_STATS.emailsSentPrev;
  const teamsCount = TEAM_DESTINATIONS.length;

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-4 pb-6">
        {/* 1. Status header strip */}
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[13px] font-semibold text-slate-900">Ventus AI Coworker</span>
            <span className="text-[12px] text-emerald-700 font-medium">Active</span>
          </div>
          <div className="hidden md:block text-[12px] text-slate-500">
            Working alongside {WEEKLY_STATS.advisorsCount.toLocaleString()} advisors and {WEEKLY_STATS.leadersCount.toLocaleString()} leaders · Last activity {WEEKLY_STATS.lastActivityAgo}
          </div>
          <div className="text-[12px] text-slate-600">
            <span className="font-semibold text-slate-900">{WEEKLY_STATS.emailsSent.toLocaleString()}</span> emails this week ·{" "}
            <span className="font-semibold text-slate-900">{WEEKLY_STATS.repliesCount.toLocaleString()}</span> replies ·{" "}
            <span className="font-semibold text-slate-900">{WEEKLY_STATS.activeThreads.toLocaleString()}</span> active threads
          </div>
        </div>

        {/* 1.5 Capabilities panel */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setCapabilitiesOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50/60 transition-colors"
          >
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Ventus AI Coworker Capabilities</h3>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Ventus emails {WEEKLY_STATS.collaboratorsTotal.toLocaleString()} bank colleagues personalized intelligence briefs — always thinking, always on.
              </p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                capabilitiesOpen && "rotate-180"
              )}
            />
          </button>
          {capabilitiesOpen && (
            <>
              <div className="px-4 py-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 min-w-[80px] text-center text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border-purple-200">Advisor</span>
                  <p className="text-[13px] text-slate-800 leading-snug">Ventus emails each advisor personalized briefs with life-event signals, client-specific talking points, and ready-to-send outreach drafts — plus instant replies when they ask for deeper context or next-step recommendations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 min-w-[80px] text-center text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border-amber-200">Leadership</span>
                  <p className="text-[13px] text-slate-800 leading-snug">Ventus emails leadership weekly trend dashboards, enterprise-wide product-gap alerts, campaign recommendations with projected AUM uplift, and retention-risk summaries across the region.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-slate-100">
                <CapabilityTile icon={<Radar className="w-3.5 h-3.5" />} title="Continuous signal detection" body="Scans every transaction across all client books in real time for life events, liquidity, and risk signals." />
                <CapabilityTile icon={<FileText className="w-3.5 h-3.5" />} title="Insight emails" body="Builds and sends personalized email briefs to each bank colleague with the exact insights they need for their role." />
                <CapabilityTile icon={<History className="w-3.5 h-3.5" />} title="Context memory" body="Remembers every thread, client history, and past recommendation — conversations pick up exactly where they left off." />
                <CapabilityTile icon={<MessageSquare className="w-3.5 h-3.5" />} title="Instant conversational replies" body="Replies in under a second when an advisor or leader responds — deeper context, drafts, next actions, or follow-up questions on demand." accentClass="text-emerald-600" />
                <CapabilityTile icon={<Clock className="w-3.5 h-3.5" />} title="Always-on coverage" body="Operates continuously across time zones — no queues, no downtime, no missed signals." />
                <CapabilityTile icon={<Workflow className="w-3.5 h-3.5" />} title="Coordinated hand-offs" body="Routes retention playbooks, escalations, and cross-advisor coordination without leadership having to chase." />
              </div>
            </>
          )}
        </div>

        {/* 2. KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={<MessageCircle className="w-3.5 h-3.5" />}
            label="Emails sent this week"
            value={WEEKLY_STATS.emailsSent.toLocaleString()}
            delta={`↑ ${((emailDelta / WEEKLY_STATS.emailsSentPrev) * 100).toFixed(1)}% vs last week`}
            deltaTone="up"
          />
          <KpiCard
            icon={<Users className="w-3.5 h-3.5" />}
            label="Bank colleagues covered"
            value={WEEKLY_STATS.collaboratorsTotal.toLocaleString()}
            delta={`${WEEKLY_STATS.advisorsCount.toLocaleString()} advisors · ${WEEKLY_STATS.leadersCount.toLocaleString()} leaders`}
            deltaTone="neutral"
          />
          <KpiCard
            icon={<Radar className="w-3.5 h-3.5" />}
            label="Insights surfaced"
            value={WEEKLY_STATS.signalsSurfaced.toLocaleString()}
            delta={`across ${WEEKLY_STATS.advisorsCount.toLocaleString()} advisor books`}
            deltaTone="neutral"
          />
          <KpiCard
            icon={<Bolt className="w-3.5 h-3.5" />}
            label="Reply latency"
            value={WEEKLY_STATS.ventusReplyLatency}
            delta="when colleagues write back"
            deltaTone="up"
          />
        </div>

        {/* 3. Intelligence Delivery Destinations */}
        <div>
          <div className="px-1 mb-2.5 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-slate-900">Intelligence Delivery Destinations</h3>
            <span className="text-[11px] text-slate-500">{teamsCount} banking teams · {WEEKLY_STATS.emailsSent.toLocaleString()} insight emails delivered</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {TEAM_DESTINATIONS.map((team) => (
              <TeamDestinationCard key={team.id} team={team} />
            ))}
          </div>
        </div>

        {/* 4. Footer disclaimer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Sparkles className="w-3 h-3" />
          Static demo — activity, threads, and stats are illustrative.
        </div>
      </div>
    </div>
  );
}

// ----- Sub-components -----

function KpiCard({
  icon,
  label,
  value,
  delta,
  deltaTone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down" | "neutral";
}) {
  const deltaColor =
    deltaTone === "up" ? "text-emerald-700" : deltaTone === "down" ? "text-rose-700" : "text-slate-500";
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-bold text-slate-900 leading-none">{value}</div>
      <div className={cn("mt-1 text-[11px]", deltaColor)}>{delta}</div>
    </div>
  );
}

const ACCENT_STYLES: Record<TeamDestination["accent"], { bar: string; chipBg: string; chipText: string; insightDot: string; hoverBorder: string }> = {
  indigo: { bar: "bg-indigo-500", chipBg: "bg-indigo-50", chipText: "text-indigo-700", insightDot: "bg-indigo-400", hoverBorder: "hover:border-indigo-300" },
  emerald: { bar: "bg-emerald-500", chipBg: "bg-emerald-50", chipText: "text-emerald-700", insightDot: "bg-emerald-400", hoverBorder: "hover:border-emerald-300" },
  amber: { bar: "bg-amber-500", chipBg: "bg-amber-50", chipText: "text-amber-700", insightDot: "bg-amber-400", hoverBorder: "hover:border-amber-300" },
  rose: { bar: "bg-rose-500", chipBg: "bg-rose-50", chipText: "text-rose-700", insightDot: "bg-rose-400", hoverBorder: "hover:border-rose-300" },
  violet: { bar: "bg-violet-500", chipBg: "bg-violet-50", chipText: "text-violet-700", insightDot: "bg-violet-400", hoverBorder: "hover:border-violet-300" },
  sky: { bar: "bg-sky-500", chipBg: "bg-sky-50", chipText: "text-sky-700", insightDot: "bg-sky-400", hoverBorder: "hover:border-sky-300" },
};

function TeamDestinationCard({ team }: { team: TeamDestination }) {
  const styles = ACCENT_STYLES[team.accent];
  const delta = team.weeklyCount - team.weeklyPrev;
  const deltaPct = ((delta / team.weeklyPrev) * 100).toFixed(1);
  const deltaUp = delta >= 0;

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white overflow-hidden transition-colors", styles.hoverBorder)}>
      <div className={cn("h-1 w-full", styles.bar)} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-slate-900 truncate">{team.name}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">{team.emailType}</p>
          </div>
          <span className={cn("shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded", styles.chipBg, styles.chipText)}>
            {team.emailType}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[24px] font-bold text-slate-900 leading-none">{team.weeklyCount.toLocaleString()}</span>
          <span className={cn("text-[11px] font-medium", deltaUp ? "text-emerald-700" : "text-rose-700")}>
            {deltaUp ? "↑" : "↓"} {Math.abs(Number(deltaPct))}% vs last week
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-slate-50 px-2.5 py-2 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-900">{team.stat1.value}</div>
            <div className="text-[10px] text-slate-500">{team.stat1.label}</div>
          </div>
          <div className="rounded-md bg-slate-50 px-2.5 py-2 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-900">{team.stat2.value}</div>
            <div className="text-[10px] text-slate-500">{team.stat2.label}</div>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5">
          {team.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", styles.insightDot)} />
              <span className="text-[11.5px] leading-snug text-slate-700">{insight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[10.5px] text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Last delivery {team.lastDeliveryAgo}
        </div>
      </div>
    </div>
  );
}

function CapabilityTile({
  icon,
  title,
  body,
  accentClass = "text-slate-700",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accentClass?: string;
}) {
  return (
    <div className="p-4 border-b border-r border-slate-100 last:border-r-0 [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0">
      <div className={cn("flex items-center gap-1.5 mb-1.5", accentClass)}>
        {icon}
        <span className="text-[12.5px] font-semibold text-slate-900">{title}</span>
      </div>
      <p className="text-[12px] leading-snug text-slate-600">{body}</p>
    </div>
  );
}
