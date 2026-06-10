import { useEffect, useMemo, useRef, useState } from "react";
import { MessagesSquare, Pause, Play, Wifi, Battery, TrendingUp } from "lucide-react";
import { TabHeader } from "./TabHeader";
import ConsumerAIChatView from "@/components/demo/ConsumerAIChatView";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { getDemoBankConfig } from "@/lib/demoBankConfig";
import {
  TRENDING_TOPICS,
  LIVE_QUESTION_FEED,
  INTENT_META,
  type TrendingTopic,
} from "@/lib/aiAssistantActivityData";
import { cn } from "@/lib/utils";

const TURN_INTERVAL_MS = 14000; // gap between auto-played user turns
const TOPIC_GAP_MS = 4000; // pause before rolling to next topic
const FEED_ROTATE_MS = 3500;

export function AIAssistantActivityView() {
  const customer = DEMO_CUSTOMERS[0];
  const bankCfg = getDemoBankConfig();
  const bankLabel = bankCfg.mode === "custom" ? bankCfg.bankShortName || bankCfg.bankName || "Our Bank" : "Our Bank";
  const firstName = (customer.profile?.name ?? "").split(" ")[0] || "there";

  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [turnIdx, setTurnIdx] = useState(0);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [chatKey, setChatKey] = useState(0); // remount when topic changes
  const [paused, setPaused] = useState(false);
  const [feedIdx, setFeedIdx] = useState(0);

  const activeTopic = TRENDING_TOPICS[activeTopicIdx];

  // Kick off the first turn whenever topic changes / chat remounts.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setPendingMessage(activeTopic.script[0]);
      setNonce((n) => n + 1);
      setTurnIdx(1);
    }, 1500);
    return () => clearTimeout(t);
  }, [chatKey, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Advance subsequent turns within the active topic.
  useEffect(() => {
    if (paused) return;
    if (turnIdx === 0) return;
    if (turnIdx >= activeTopic.script.length) {
      // Finished topic — pause then rotate to next.
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

  // Rolling live feed
  useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % LIVE_QUESTION_FEED.length), FEED_ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const handleSelectTopic = (idx: number) => {
    setActiveTopicIdx(idx);
    setChatKey((k) => k + 1);
    setTurnIdx(0);
    setPaused(false);
  };

  const feedItems = useMemo(() => {
    return [0, 1, 2, 3, 4].map((offset) => LIVE_QUESTION_FEED[(feedIdx + offset) % LIVE_QUESTION_FEED.length]);
  }, [feedIdx]);

  return (
    <div className="space-y-6">
      <TabHeader
        icon={<MessagesSquare className="w-4 h-4" />}
        title="AI Assistant Activity"
        subtitle="See what customers are asking the Ventus AI assistant about, in real time"
        howItWorks="Ventus clusters every consumer conversation by intent, lifestyle pillar, and life event, and surfaces the trending themes alongside a live preview of how the assistant responds."
        whyItMatters="Gives marketing, product, and advisor teams a direct read on what customers actually want help with — informing campaigns, product roadmaps, and proactive outreach."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active conversations (24h)", value: "Trending higher" },
          { label: "Avg. messages per chat", value: "Multi-turn" },
          { label: "Top intent today", value: "Spend recaps" },
          { label: "Self-serve resolution", value: "Mostly resolved in-app" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{k.label}</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Split panel */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: trending topics + live feed */}
        <div className="col-span-7 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[12px] font-semibold text-slate-800">Trending Topics</span>
              </div>
              <span className="text-[10px] text-slate-400">Click a topic to play it on the iPad →</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto scrollbar-light">
              {TRENDING_TOPICS.map((t, idx) => {
                const active = idx === activeTopicIdx;
                const intent = INTENT_META[t.intent];
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(idx)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 transition-colors flex gap-3 items-start",
                      active ? "bg-blue-50/60" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="text-xl leading-none mt-0.5">{t.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[12.5px] font-semibold", active ? "text-blue-800" : "text-slate-800")}>
                          {t.label}
                        </span>
                        <span className={cn("text-[9.5px] font-semibold px-1.5 py-0.5 rounded border", intent.color)}>
                          {intent.label}
                        </span>
                        {active && (
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                            Playing
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t.volumeBlurb} · <span className="text-slate-600 font-medium">{t.deltaBlurb}</span>
                      </div>
                      <div className="text-[11.5px] text-slate-600 italic mt-1 truncate">"{t.sampleQuestion}"</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live anonymized stream */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[12px] font-semibold text-slate-800">Live conversation stream</span>
              </div>
              <span className="text-[10px] text-slate-400">Anonymized</span>
            </div>
            <div className="px-3 py-2 space-y-1">
              {feedItems.map((q, i) => (
                <div
                  key={`${q}-${i}`}
                  className={cn(
                    "text-[11.5px] truncate transition-opacity",
                    i === 0 ? "text-slate-700 font-medium" : "text-slate-400"
                  )}
                >
                  · {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: iPad mockup */}
        <div className="col-span-5">
          <div className="flex flex-col items-center">
            <div
              className="relative rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col"
              style={{ width: "100%", maxWidth: 380, height: 600 }}
            >
              {/* Camera dot */}
              <div className="flex justify-center pt-1.5 pb-0.5 bg-white shrink-0">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              {/* Status bar */}
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
              {/* Chat */}
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

            {/* Caption + controls */}
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
