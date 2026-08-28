import { useState } from "react";
import { Sparkles, Clock, History, MessageSquare, Workflow, Radar, FileText, MessageCircle, Bolt, Users, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WEEKLY_STATS,
  TEAM_DESTINATIONS,
  type TeamDestination,
} from "./coworkerInboxData";
import { PulseDot } from "@/components/tepilot/common/PulseDot";

export function CoworkerInboxView() {
  const [capabilitiesExpanded, setCapabilitiesExpanded] = useState(false);
  const emailDelta = WEEKLY_STATS.emailsSent - WEEKLY_STATS.emailsSentPrev;

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-4 pb-6">
        {/* 1. Status header strip */}
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <PulseDot colorClass="bg-emerald-500" sizeClass="h-2.5 w-2.5" />
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

        {/* 3. Capabilities panel */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Ventus AI Coworker Capabilities</h3>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                Ventus emails {WEEKLY_STATS.collaboratorsTotal.toLocaleString()} bank colleagues personalized intelligence briefs — always thinking, always on.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCapabilitiesExpanded((v) => !v)}
              className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
              aria-expanded={capabilitiesExpanded}
            >
              {capabilitiesExpanded ? "Hide" : "Show"} capabilities
              {capabilitiesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          {capabilitiesExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-slate-100">
              <CapabilityTile icon={<Radar className="w-3.5 h-3.5" />} title="Continuous signal detection" body="Scans every transaction across all client books in real time for life events, liquidity, and risk signals." />
              <CapabilityTile icon={<FileText className="w-3.5 h-3.5" />} title="Insight emails" body="Builds and sends personalized email briefs to each bank colleague with the exact insights they need for their role." />
              <CapabilityTile icon={<History className="w-3.5 h-3.5" />} title="Context memory" body="Remembers every thread, client history, and past recommendation — conversations pick up exactly where they left off." />
              <CapabilityTile icon={<MessageSquare className="w-3.5 h-3.5" />} title="Instant conversational replies" body="Replies in under a second when an advisor or leader responds — deeper context, drafts, next actions, or follow-up questions on demand." accentClass="text-emerald-600" />
              <CapabilityTile icon={<Clock className="w-3.5 h-3.5" />} title="Always-on coverage" body="Operates continuously across time zones — no queues, no downtime, no missed signals." />
              <CapabilityTile icon={<Workflow className="w-3.5 h-3.5" />} title="Coordinated hand-offs" body="Routes retention playbooks, escalations, and cross-advisor coordination without leadership having to chase." />
            </div>
          )}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Intelligence delivery destinations</h4>
              <span className="text-[11px] text-slate-500">{TEAM_DESTINATIONS.length} banking teams · {WEEKLY_STATS.emailsSent.toLocaleString()} insight emails delivered</span>
            </div>
            <div className="flex flex-col gap-2">
              {TEAM_DESTINATIONS.map((team) => (
                <TeamDestinationSliver key={team.id} team={team} />
              ))}
            </div>
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

function TeamDestinationSliver({ team }: { team: TeamDestination }) {
  const styles = ACCENT_STYLES[team.accent];
  const delta = team.weeklyCount - team.weeklyPrev;
  const deltaPct = ((delta / team.weeklyPrev) * 100).toFixed(1);
  const deltaUp = delta >= 0;
  const primaryInsight = team.insights[0];

  return (
    <div className={cn("group rounded-lg border border-slate-200 bg-white overflow-hidden transition-colors hover:bg-slate-50/60", styles.hoverBorder)}>
      <div className="flex items-stretch">
        <div className={cn("w-1 shrink-0", styles.bar)} />
        <div className="flex-1 px-3.5 py-3 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <h4 className="text-[13px] font-semibold text-slate-900 truncate">{team.name}</h4>
              <span className={cn("shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", styles.chipBg, styles.chipText)}>
                {team.emailType}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[18px] font-bold text-slate-900 leading-none">{team.weeklyCount.toLocaleString()}</span>
              <span className={cn("text-[11px] font-medium", deltaUp ? "text-emerald-700" : "text-rose-700")}>
                {deltaUp ? "↑" : "↓"} {Math.abs(Number(deltaPct))}%
              </span>
            </div>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <PulseDot colorClass={styles.insightDot} sizeClass="h-1.5 w-1.5" className="shrink-0" />
              <span className="text-[11.5px] leading-snug text-slate-600 truncate">{primaryInsight}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[10.5px] text-slate-500">
              <PulseDot colorClass="bg-emerald-500" sizeClass="h-1.5 w-1.5" />
              {team.lastDeliveryAgo}
            </div>
          </div>
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
