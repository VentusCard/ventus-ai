import { useEffect, useState } from "react";
import { MessagesSquare, Pause, Play, Wifi, Battery, TrendingUp, ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import { TabHeader } from "./TabHeader";
import ConsumerAIChatView from "@/components/demo/ConsumerAIChatView";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { getDemoBankConfig } from "@/lib/demoBankConfig";
import {
  TRENDING_TOPICS,
  INTENT_META,
  INTENT_MIX,
  ASSISTANT_KPIS,
  type TrendingTopic,
} from "@/lib/aiAssistantActivityData";
import { cn } from "@/lib/utils";

const TURN_INTERVAL_MS = 14000;
const TOPIC_GAP_MS = 4000;

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 64;
  const h = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeltaPill({ deltaPct }: { deltaPct: number }) {
  const flat = Math.abs(deltaPct) < 1;
  const up = deltaPct > 0;
  const cls = flat
    ? "bg-slate-100 text-slate-600 border-slate-200"
    : up
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;
  const text = flat ? "flat" : `${up ? "+" : ""}${deltaPct}%`;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10.5px] font-semibold px-1.5 py-0.5 rounded border", cls)}>
      <Icon className="w-2.5 h-2.5" />
      {text}
    </span>
  );
}

function KpiTile({ label, value, delta, positive = true }: { label: string; value: string; delta: string; positive?: boolean }) {
  const cls = positive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-xl font-bold text-slate-900 leading-none">{value}</div>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border", cls)}>{delta}</span>
      </div>
    </div>
  );
}

export function AIAssistantActivityView({ hideHeader }: { hideHeader?: boolean } = {}) {
  const customer = DEMO_CUSTOMERS[0];
  const bankCfg = getDemoBankConfig();
  const bankLabel = "Our Bank";
  const firstName = (customer.profile?.name ?? "").split(" ")[0] || "there";

  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [turnIdx, setTurnIdx] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [chatKey, setChatKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [intentFilter, setIntentFilter] = useState<TrendingTopic["intent"] | "all">("all");
  const [sortBy, setSortBy] = useState<"vol" | "delta">("vol");

  const activeTopic: TrendingTopic = TRENDING_TOPICS[activeTopicIdx];

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setPendingMessage(activeTopic.script[0]);
      setNonce((n) => n + 1);
      setTurnIdx(1);
    }, 1500);
    return () => clearTimeout(t);
  }, [chatKey, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused) return;
    if (turnIdx === 0) return;
    if (turnIdx >= activeTopic.script.length) {
      const t = setTimeout(() => {
        setActiveTopicIdx((i) => (i + 1) % TRENDING_TOPICS.length);
        setChatKey((k) => k + 1);
        setTurnIdx(0);
      }, TOPIC_GAP_MS + 4000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPendingMessage(activeTopic.script[turnIdx]);
      setNonce((n) => n + 1);
      setTurnIdx((i) => i + 1);
    }, TURN_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [turnIdx, activeTopic, paused]);

  const handleSelectTopic = (idx: number) => {
    setActiveTopicIdx(idx);
    setChatKey((k) => k + 1);
    setTurnIdx(0);
    setPaused(false);
  };

  return (
    <div className="space-y-6">
      {!hideHeader && <TabHeader
        icon={<MessagesSquare className="w-4 h-4" />}
        title="AI Banking Assistant "
        subtitle="What customers are asking the assistant — by volume, intent, and trend"
        howItWorks="Ventus clusters every consumer conversation by intent, lifestyle pillar, and life event, and surfaces the trending themes alongside a live preview of how the assistant responds."
        whyItMatters="Gives marketing, product, and advisor teams a direct read on what customers actually want help with — informing campaigns, product roadmaps, and proactive outreach."
      />}

      {/* Ventus AI key insight */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-white px-4 py-3 flex items-start gap-3">
        <div className="shrink-0 w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">
            Ventus AI · Key insight
          </div>
          <div className="text-[13.5px] font-semibold text-slate-900 mt-0.5">
            Travel and life-event questions are driving this week's volume spike.
          </div>
          <div className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
            Summer travel planning (+58%) and summer trip recaps (+42%) led the last 24 hours of growth. First-home buying resources crossed 2.8k conversations — the highest of any life-event topic this quarter.
          </div>
        </div>
        <div className="flex items-stretch gap-3 shrink-0 pl-3 border-l border-slate-200">
          <span className="text-[10px] text-slate-400 self-center">Updated 2 min ago</span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        <KpiTile label="Conversations (24h)" value={ASSISTANT_KPIS.conversations24h.value} delta={ASSISTANT_KPIS.conversations24h.delta} />
        <KpiTile label="Avg. messages per chat" value={ASSISTANT_KPIS.avgMessages.value} delta={ASSISTANT_KPIS.avgMessages.delta} />
        <KpiTile label="Self-serve resolution" value={ASSISTANT_KPIS.selfServeResolution.value} delta={ASSISTANT_KPIS.selfServeResolution.delta} />
        <KpiTile label="Avg. response time" value={ASSISTANT_KPIS.avgResponseTime.value} delta={ASSISTANT_KPIS.avgResponseTime.delta} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: insights */}
        <div className="col-span-8 space-y-3">
          {/* Intent mix */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <span className="text-[12px] font-semibold text-slate-800">Intent Mix (last 24h)</span>
              <span className="text-[10px] text-slate-400">
                {INTENT_MIX.reduce((s, e) => s + e.count, 0).toLocaleString()} conversations
              </span>
            </div>
            <div className="px-3 py-3">
              {/* stacked bar */}
              <div className="flex h-2.5 rounded-full overflow-hidden border border-slate-200">
                {INTENT_MIX.map((e) => (
                  <div
                    key={e.intent}
                    style={{ width: `${e.pct}%`, backgroundColor: INTENT_META[e.intent].barColor }}
                    title={`${INTENT_META[e.intent].label} · ${e.pct}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {INTENT_MIX.map((e) => {
                  const meta = INTENT_META[e.intent];
                  return (
                    <div key={e.intent} className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-sm mt-1 shrink-0" style={{ backgroundColor: meta.barColor }} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-700 truncate">{meta.label}</div>
                        <div className="text-[10.5px] text-slate-500">
                          {e.pct}% · {e.count.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trending topics */}
          {(() => {
            const intentCounts: Record<string, number> = { all: TRENDING_TOPICS.length };
            for (const t of TRENDING_TOPICS) intentCounts[t.intent] = (intentCounts[t.intent] ?? 0) + 1;
            const filtered = TRENDING_TOPICS
              .map((t, originalIdx) => ({ t, originalIdx }))
              .filter(({ t }) => intentFilter === "all" || t.intent === intentFilter)
              .sort((a, b) =>
                sortBy === "vol" ? b.t.volume - a.t.volume : b.t.deltaPct - a.t.deltaPct
              );
            const filterPills: Array<{ key: TrendingTopic["intent"] | "all"; label: string; color?: string; bg?: string; border?: string }> = [
              { key: "all", label: "All" },
              ...(Object.keys(INTENT_META) as TrendingTopic["intent"][]).map((k) => ({
                key: k,
                label: INTENT_META[k].label,
                color: INTENT_META[k].barColor,
              })),
            ];
            return (
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[12px] font-semibold text-slate-800">Trending Topics</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Click a topic to play it on the iPad →</span>
                </div>

                {/* Filter row */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {filterPills.map((p) => {
                      const active = intentFilter === p.key;
                      const count = intentCounts[p.key] ?? 0;
                      return (
                        <button
                          key={p.key}
                          onClick={() => setIntentFilter(p.key)}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-full border transition-colors",
                            active
                              ? "bg-white"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          )}
                          style={
                            active && p.color
                              ? {
                                  color: p.color,
                                  borderColor: p.color,
                                  backgroundColor: `${p.color}14`,
                                }
                              : active
                                ? { color: "#1e40af", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }
                                : undefined
                          }
                        >
                          {p.color && (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          )}
                          {p.label}
                          <span className={cn("tabular-nums opacity-70")}>· {count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] text-slate-400 font-semibold">
                    <span className="uppercase tracking-wider mr-1">Sort</span>
                    <button
                      onClick={() => setSortBy("vol")}
                      className={cn(
                        "px-1.5 py-0.5 rounded border",
                        sortBy === "vol"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-transparent text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      Vol ▾
                    </button>
                    <button
                      onClick={() => setSortBy("delta")}
                      className={cn(
                        "px-1.5 py-0.5 rounded border",
                        sortBy === "delta"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-transparent text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      Δ 7d ▾
                    </button>
                  </div>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_90px_70px_80px] gap-3 px-3 py-1.5 border-b border-slate-100 text-[9.5px] uppercase tracking-wider text-slate-400 font-semibold">
                  <div>Topic</div>
                  <div className="text-right">Vol (24h)</div>
                  <div className="text-right">Δ 7d</div>
                  <div className="text-right">Trend</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto scrollbar-light">
                  {filtered.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11px] text-slate-500">
                      No topics in this intent.
                    </div>
                  )}
                  {filtered.map(({ t, originalIdx }) => {
                    const active = originalIdx === activeTopicIdx;
                    const intent = INTENT_META[t.intent];
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTopic(originalIdx)}
                        className={cn(
                          "w-full text-left grid grid-cols-[1fr_90px_70px_80px] gap-3 items-center px-3 py-2 transition-colors",
                          active ? "bg-blue-50/60" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex gap-2.5 items-start min-w-0">
                          <div className="text-lg leading-none mt-0.5">{t.emoji}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("text-[12.5px] font-semibold truncate", active ? "text-blue-800" : "text-slate-800")}>
                                {t.label}
                              </span>
                              <span className={cn("text-[9.5px] font-semibold px-1.5 py-0.5 rounded border", intent.pillClass)}>
                                {intent.label}
                              </span>
                              {active && (
                                <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                                  Playing
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 italic mt-0.5 truncate">"{t.sampleQuestion}"</div>
                          </div>
                        </div>
                        <div className="text-right text-[12.5px] font-bold text-slate-800 tabular-nums">
                          {t.volume.toLocaleString()}
                        </div>
                        <div className="text-right">
                          <DeltaPill deltaPct={t.deltaPct} />
                        </div>
                        <div className="flex justify-end">
                          <Sparkline data={t.spark} color={intent.barColor} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right: iPad mockup */}
        <div className="col-span-4">
          <div className="flex flex-col items-center">
            <div
              className="relative rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col"
              style={{ width: "100%", maxWidth: 380, height: 600 }}
            >
              <div className="flex justify-center pt-1.5 pb-0.5 bg-white shrink-0">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <div className="flex items-center justify-between px-5 py-1 bg-white text-[10px] text-slate-400 font-medium shrink-0">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-slate-600 text-[11px]">{bankLabel} · {firstName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex-1 min-h-0 bg-white overflow-hidden flex flex-col">
                <ConsumerAIChatView
                  key={chatKey}
                  customer={customer}
                  initialMessage={pendingMessage}
                  messageNonce={nonce}
                  onInitialMessageConsumed={() => setPendingMessage(null)}
                />
              </div>
            </div>

            <div className="w-full max-w-[380px] mt-3 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 truncate pr-2">
                <span className="text-slate-400">Watching:</span>{" "}
                <span className="font-semibold text-slate-700">
                  {activeTopic.emoji} {activeTopic.label}
                </span>
              </div>
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-md px-2 py-1 bg-white transition-colors"
              >
                {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {paused ? "Resume" : "Pause"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 max-w-[380px] text-center">
              Live preview of the Ventus AI assistant. Type in the chat to take over the demo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
