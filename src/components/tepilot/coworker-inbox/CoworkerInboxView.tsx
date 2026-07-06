import { useState } from "react";
import { Sparkles, TrendingUp, MessageCircle, Zap, Bolt, ArrowUpRight, Radar, UserRoundCheck, LineChart, MessageSquare, FileText, Workflow, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROSTER,
  THREADS,
  ACTIVITY_FEED,
  WEEKLY_STATS,
  PERSON_ACTIVITY,
  type ActivityKind,
  type Person,
} from "./coworkerInboxData";
import { MessageBubble } from "./MessageBubble";

const KIND_STYLES: Record<ActivityKind, { dot: string; label: string; badge: string }> = {
  advisor:    { dot: "bg-purple-500", label: "Advisor",    badge: "bg-purple-50 text-purple-700 border-purple-200" },
  leadership: { dot: "bg-amber-500",  label: "Leadership", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  signal:     { dot: "bg-blue-500",   label: "Signal",     badge: "bg-blue-50 text-blue-700 border-blue-200" },
  reply:      { dot: "bg-emerald-500",label: "Reply",      badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export function CoworkerInboxView() {
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);

  const advisorThread = THREADS.find((t) => t.id === "t1")!;
  const leadershipThread = THREADS.find((t) => t.id === "t4")!;

  const peopleById: Record<string, Person> = {};
  for (const p of ROSTER) peopleById[p.id] = p;

  const emailDelta = WEEKLY_STATS.emailsSent - WEEKLY_STATS.emailsSentPrev;

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
                Ventus works alongside {WEEKLY_STATS.advisorsCount.toLocaleString()} advisors and {WEEKLY_STATS.leadersCount.toLocaleString()} leaders — via email, always on.
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-slate-100">
                <CapabilityTile icon={<Radar className="w-3.5 h-3.5" />} title="Continuous signal detection" body="Scans every transaction across all client books in real time for life events, liquidity, and risk signals." />
                <CapabilityTile icon={<UserRoundCheck className="w-3.5 h-3.5" />} title="Personalized advisor briefs" body="Emails each advisor the specific signals in their book with context, evidence, and recommended talking points." accentClass="text-purple-600" />
                <CapabilityTile icon={<LineChart className="w-3.5 h-3.5" />} title="Leadership intelligence" body="Sends leadership weekly trends, product-gap analysis, and campaign recommendations across the enterprise." accentClass="text-amber-600" />
                <CapabilityTile icon={<MessageSquare className="w-3.5 h-3.5" />} title="Instant conversational replies" body="Replies in under a second when an advisor or leader responds — deeper context, drafts, next actions, or follow-up questions on demand." accentClass="text-emerald-600" />
                <CapabilityTile icon={<FileText className="w-3.5 h-3.5" />} title="Draft generation" body="Produces client outreach copy, agendas, and campaign briefs ready for human review — never sends to end clients autonomously." />
                <CapabilityTile icon={<Workflow className="w-3.5 h-3.5" />} title="Coordinated hand-offs" body="Routes retention playbooks, escalations, and cross-advisor coordination without leadership having to chase." />
              </div>
              <div className="px-4 py-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 min-w-[80px] text-center text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border-purple-200">Advisor</span>
                  <p className="text-[13px] text-slate-600 leading-snug">Ventus emails each advisor personalized briefs with life-event signals, client-specific talking points, and ready-to-send outreach drafts — plus instant replies when they ask for deeper context or next-step recommendations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 min-w-[80px] text-center text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border-amber-200">Leadership</span>
                  <p className="text-[13px] text-slate-600 leading-snug">Ventus emails leadership weekly trend dashboards, enterprise-wide product-gap alerts, campaign recommendations with projected AUM uplift, and retention-risk summaries across the region.</p>
                </div>
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
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Human reply rate"
            value={`${WEEKLY_STATS.replyRatePct}%`}
            delta={`${WEEKLY_STATS.repliesCount.toLocaleString()} replies received`}
            deltaTone="neutral"
          />
          <KpiCard
            icon={<Zap className="w-3.5 h-3.5" />}
            label="Signals surfaced"
            value={WEEKLY_STATS.signalsSurfaced.toLocaleString()}
            delta={`across ${WEEKLY_STATS.advisorsCount.toLocaleString()} advisor books`}
            deltaTone="neutral"
          />
          <KpiCard
            icon={<Bolt className="w-3.5 h-3.5" />}
            label="Ventus reply latency"
            value={WEEKLY_STATS.ventusReplyLatency}
            delta="instant · always on"
            deltaTone="up"
          />
        </div>

        {/* 3. Activity feed + Team status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Activity feed */}
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="text-[13px] font-semibold text-slate-900">What Ventus is working on</h3>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-0.5">Live · updated continuously · showing {ACTIVITY_FEED.length} of {WEEKLY_STATS.actionsToday.toLocaleString()} today</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {ACTIVITY_FEED.map((a) => {
                const s = KIND_STYLES[a.kind];
                return (
                  <li key={a.id} className="px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="relative mt-1.5 shrink-0">
                      <span className={cn("block h-2 w-2 rounded-full", s.dot)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 rounded", s.badge)}>
                          {s.label}
                        </span>
                        <span className="text-[13px] text-slate-800">{a.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{a.ago}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Team status */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-[13px] font-semibold text-slate-900">Team status</h3>
              <p className="text-[11.5px] text-slate-500 mt-0.5">Sample of active collaborators ({ROSTER.length} of {WEEKLY_STATS.collaboratorsTotal.toLocaleString()})</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {ROSTER.map((p) => {
                const act = PERSON_ACTIVITY[p.id] ?? { threads: 0, pendingReplies: 0 };
                return (
                  <li key={p.id} className="px-3.5 py-2.5 flex items-center gap-2.5">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10.5px] font-bold">
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-medium text-slate-900 truncate">{p.name}</span>
                        <span className={cn(
                          "text-[9.5px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded border",
                          p.role === "advisor"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          {p.role === "advisor" ? "ADV" : "LEAD"}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 truncate">{p.title}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] font-semibold text-slate-800">{act.threads}</div>
                      <div className="text-[9.5px] text-slate-500">threads</div>
                      {act.pendingReplies > 0 && (
                        <div className="text-[9.5px] text-emerald-700 font-medium mt-0.5">
                          {act.pendingReplies} pending
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 4. Example conversations */}
        <div>
          <div className="flex items-baseline justify-between mb-2 px-1">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Example conversations</h3>
              <p className="text-[11.5px] text-slate-500 mt-0.5">How Ventus works with the wealth team</p>
            </div>
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Static preview
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <ExampleThreadCard
              roleLabel="Advisor"
              roleBadgeClass="bg-purple-50 text-purple-700 border-purple-200"
              recipient={peopleById[advisorThread.recipientId]}
              subject={advisorThread.subject}
              messages={advisorThread.messages}
            />
            <ExampleThreadCard
              roleLabel="Leadership"
              roleBadgeClass="bg-amber-50 text-amber-700 border-amber-200"
              recipient={peopleById[leadershipThread.recipientId]}
              subject={leadershipThread.subject}
              messages={leadershipThread.messages}
            />
          </div>
        </div>

        {/* 5. Footer disclaimer */}
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

function ExampleThreadCard({
  roleLabel,
  roleBadgeClass,
  recipient,
  subject,
  messages,
}: {
  roleLabel: string;
  roleBadgeClass: string;
  recipient: Person;
  subject: string;
  messages: import("./coworkerInboxData").Message[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 overflow-hidden">
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-2.5">
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">
          {recipient.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-slate-900 truncate">{recipient.name}</span>
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border", roleBadgeClass)}>
              {roleLabel}
            </span>
          </div>
          <div className="text-[11.5px] text-slate-500 truncate">{recipient.title}</div>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Subject</div>
        <div className="text-[13.5px] font-semibold text-slate-900">{subject}</div>
      </div>
      <div className="px-4 py-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} recipient={recipient} />
        ))}
      </div>
    </div>
  );
}
