import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import {
  ADVISOR,
  VENTUS,
  REPLY_MESSAGES,
  DigestBody,
  deriveAdvisorConversationContext,
} from "@/components/tepilot/advisor-console/AdvisorConversationThread";

const AUTO_MS = 6500;

interface StageMessage {
  sender: "ventus" | "advisor";
  time: string;
  navLabel: string;
  kind: "digest" | "reply";
  subject: string;
  quoted?: string;
  body: React.ReactNode;
}

const CoworkerEmailReel = () => {
  const clients = useMemo(() => generateDashboardClients(60), []);
  const ctx = useMemo(() => deriveAdvisorConversationContext(clients), [clients]);

  const stages: StageMessage[] = useMemo(() => {
    const subject = `Daily digest — ${ctx.totalSignals} signals to action`;
    const first: StageMessage = {
      sender: "ventus",
      time: "9:14 AM",
      navLabel: "9:14",
      kind: "digest",
      subject,
      body: <DigestBody grouped={ctx.grouped} totalSignals={ctx.totalSignals} compact />,
    };
    const rest: StageMessage[] = REPLY_MESSAGES.map((m) => ({
      sender: m.sender,
      time: m.time,
      navLabel: m.navLabel,
      kind: "reply",
      subject: `Re: ${subject}`,
      quoted: m.quoted,
      body: m.render?.({
        nameA: ctx.nameA,
        nameB: ctx.nameB,
        labelA: ctx.labelA,
        labelB: ctx.labelB,
        eventTypeA: ctx.eventTypeA,
        eventTypeB: ctx.eventTypeB,
        travelCardCohort: ctx.travelCardCohort,
        digestRows: ctx.digestRows,
      }),
    }));
    return [first, ...rest];
  }, [ctx]);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0); // 0..1 progress
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());

  // reset progress when index changes
  useEffect(() => {
    startRef.current = performance.now();
    setTick(0);
  }, [idx]);

  useEffect(() => {
    const active = playing && !hover;
    if (!active) return;
    let cancelled = false;
    const step = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / AUTO_MS);
      setTick(t);
      if (t >= 1) {
        setIdx((i) => (i + 1) % stages.length);
      } else {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [idx, playing, hover, stages.length]);

  const msg = stages[idx];
  const isVentus = msg.sender === "ventus";
  const senderProfile = isVentus ? VENTUS : ADVISOR;

  const goto = (i: number) => setIdx(((i % stages.length) + stages.length) % stages.length);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-2xl bg-white overflow-hidden flex flex-col border border-slate-200"
      style={{ height: 620, boxShadow: "0 20px 60px rgba(15, 23, 42, 0.10)" }}
    >
      {/* Top bar: pill + segmented progress */}
      <div className="shrink-0 border-b border-slate-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-700">
                AI Coworker ↔ Advisor
              </span>
            </span>
            <span className="text-[11px] text-slate-500 tabular-nums">
              {msg.time} · {idx + 1} of {stages.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label={playing ? "Pause auto-play" : "Resume auto-play"}
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => goto(idx - 1)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => goto(idx + 1)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Segmented progress rail */}
        <div className="px-5 pb-3 flex items-center gap-1">
          {stages.map((s, i) => {
            const state: "done" | "active" | "pending" =
              i < idx ? "done" : i === idx ? "active" : "pending";
            const fill = state === "done" ? 1 : state === "active" ? tick : 0;
            const barColor = s.sender === "ventus" ? "bg-purple-500" : "bg-slate-700";
            return (
              <button
                key={i}
                type="button"
                onClick={() => goto(i)}
                className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden relative group"
                aria-label={`Jump to message ${i + 1}`}
              >
                <span
                  className={cn("absolute inset-y-0 left-0", barColor)}
                  style={{ width: `${fill * 100}%`, transition: state === "done" ? "width 200ms" : undefined }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sender row */}
      <div className="shrink-0 px-6 py-3.5 border-b border-slate-100 flex items-center gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0",
            isVentus ? "bg-gradient-to-br from-purple-500 to-blue-600" : "bg-slate-700"
          )}
        >
          {senderProfile.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-slate-900 truncate">
            <span className="font-semibold">{senderProfile.name}</span>
            <span className="text-slate-400 font-normal"> · &lt;{senderProfile.email}&gt;</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            <span className="text-slate-400">to</span>{" "}
            {isVentus ? ADVISOR.name : VENTUS.name}
            <span className="mx-2 text-slate-300">·</span>
            <span className="font-medium text-slate-700">{msg.subject}</span>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full border",
            msg.kind === "digest"
              ? "bg-purple-50 border-purple-200 text-purple-700"
              : "bg-slate-50 border-slate-200 text-slate-600"
          )}
        >
          {msg.kind === "digest" ? "Daily Digest" : "Reply"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div key={idx} className="animate-fade-in px-6 py-5 max-w-3xl mx-auto space-y-3 text-[13px] leading-relaxed text-slate-700">
          {msg.kind === "reply" && msg.quoted && (
            <div className="border-l-2 border-slate-200 pl-3 text-[11px] text-slate-500 italic">
              {msg.quoted}
            </div>
          )}
          <div className="space-y-3">{msg.body}</div>
          <div className="pt-4 mt-2 border-t border-slate-100 text-[12px] text-slate-600">
            <p className="text-slate-900 font-medium">
              — {isVentus ? "Ventus" : ADVISOR.name.split(" ")[0]}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isVentus ? "Sent by Ventus Coworker · ventusai.com" : `Sent from Outlook · ${ADVISOR.email}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoworkerEmailReel;
