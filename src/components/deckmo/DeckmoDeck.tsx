import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, ChevronDown, ChevronRight, ExternalLink, Gift, GraduationCap, Grid2X2, Heart, Home, Mail, Monitor, Plane, Search, ShieldCheck, Sparkles, Target, UserRound, Wallet, X, Zap, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DECKMO, DECKMO_STEPS, type DeckmoBeatId } from "@/lib/deckmoScript";
import { RICKY_TRANSACTIONS, type RickySignalLabel } from "@/lib/deckmoRickyTransactions";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import ventusLogoBlue from "@/assets/ventus-ai-wordmark-blue.png";
import { BankdemoBankTools, BankdemoImmediate, BankdemoLongTerm, BankdemoMidTerm, BankdemoRetention } from "./DeckmoBankdemoScenes";

const TONES = {
  blue: { dot: "bg-blue-500", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", fullBg: "bg-blue-100", hoverBg: "hover:bg-blue-200", fullText: "text-blue-900 hover:text-blue-900", pillBorder: "border-blue-300" },
  amber: { dot: "bg-amber-500", border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", fullBg: "bg-amber-100", hoverBg: "hover:bg-amber-200", fullText: "text-amber-900 hover:text-amber-900", pillBorder: "border-amber-300" },
  emerald: { dot: "bg-emerald-500", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", fullBg: "bg-emerald-100", hoverBg: "hover:bg-emerald-200", fullText: "text-emerald-900 hover:text-emerald-900", pillBorder: "border-emerald-300" },
  violet: { dot: "bg-violet-500", border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700", fullBg: "bg-violet-100", hoverBg: "hover:bg-violet-200", fullText: "text-violet-900 hover:text-violet-900", pillBorder: "border-violet-300" },
  rose: { dot: "bg-rose-500", border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700", fullBg: "bg-rose-100", hoverBg: "hover:bg-rose-200", fullText: "text-rose-900 hover:text-rose-900", pillBorder: "border-rose-300" },
} as const;

type Tone = keyof typeof TONES;

const RICKY_ROW_TONES: Record<Tone, string> = {
  blue: "border-l-[4px] border-l-blue-500 bg-blue-100/90",
  amber: "border-l-[4px] border-l-amber-500 bg-amber-100/90",
  emerald: "border-l-[4px] border-l-emerald-500 bg-emerald-100/90",
  violet: "border-l-[4px] border-l-violet-500 bg-violet-100/90",
  rose: "border-l-[4px] border-l-rose-500 bg-rose-100/90",
};

type SceneProps = { step: number; active?: boolean };

const VISIBILITY_ROLLER_SPEED = 40;

function VerticalRoller({ active, pixelsPerSecond, className, children }: { active: boolean; pixelsPerSecond: number; className?: string; children: React.ReactNode }) {
  const rollerRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const roller = rollerRef.current;
    const firstCopy = firstCopyRef.current;
    if (!roller || !firstCopy) return;

    roller.style.transform = "translate3d(0, 0, 0)";
    if (!active) return;

    let frame = 0;
    let offset = 0;
    let lastTime = performance.now();
    let copyHeight = firstCopy.getBoundingClientRect().height;
    const resizeObserver = new ResizeObserver(() => {
      copyHeight = firstCopy.getBoundingClientRect().height;
    });
    resizeObserver.observe(firstCopy);

    const animate = (time: number) => {
      const elapsed = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      if (copyHeight > 0) {
        offset = (offset + pixelsPerSecond * elapsed) % copyHeight;
        roller.style.transform = `translate3d(0, ${-offset}px, 0)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      roller.style.transform = "translate3d(0, 0, 0)";
    };
  }, [active, pixelsPerSecond]);

  return (
    <div ref={rollerRef} className={cn("will-change-transform", className)}>
      <div ref={firstCopyRef}>{children}</div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-blue-600">{children}</p>;
}

function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="max-w-[1180px]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-balance text-[clamp(34px,3.6vw,58px)] font-bold leading-[1.04] tracking-normal text-slate-950">{title}</h2>
      {subtitle && <p className="mt-4 max-w-[1060px] text-[clamp(16px,1.35vw,21px)] leading-relaxed text-slate-600">{subtitle}</p>}
    </header>
  );
}

function Reveal({ show, delay = 0, children, className }: { show: boolean; delay?: number; children: React.ReactNode; className?: string }) {
  return <div className={cn("transition-all duration-700 motion-reduce:transition-none", show ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0", className)} style={{ transitionDelay: show ? `${delay}ms` : "0ms" }}>{children}</div>;
}

function Opener({ step }: SceneProps) {
  const comparison = [DECKMO.opener.comparison.today, DECKMO.opener.comparison.ventus];
  const comparisonStarted = step >= 2;
  return (
    <div className="relative mx-auto h-full w-full max-w-[1560px] px-[clamp(32px,4vw,72px)]">
      <div className={cn(
        "absolute inset-x-[clamp(32px,4vw,72px)] transition-[top,transform] duration-700 ease-in-out motion-reduce:transition-none",
        comparisonStarted
          ? "top-[clamp(28px,7vh,64px)] translate-y-0"
          : "top-1/2 -translate-y-1/2",
      )}>
        <Reveal show={step >= 0}>
          <p className="text-balance text-[clamp(44px,5vw,76px)] font-bold leading-[1.03] tracking-normal text-slate-950">{DECKMO.opener.lines[0]}</p>
        </Reveal>
        <Reveal show={step >= 1} className="mt-7">
          <p className="text-balance text-[clamp(34px,3.9vw,58px)] font-bold leading-[1.06] tracking-normal text-slate-950">{DECKMO.opener.lines[1]}</p>
        </Reveal>
      </div>

      <div className={cn(
        "absolute inset-x-[clamp(32px,4vw,72px)] top-[41%] grid grid-cols-[max-content_auto_max-content_auto_max-content] items-baseline justify-between gap-x-[clamp(8px,1vw,18px)] transition-opacity duration-500 motion-reduce:transition-none",
        comparisonStarted ? "opacity-100" : "pointer-events-none opacity-0",
      )}>
          {comparison.map((row, index) => {
            const blue = index === 1;
            // Today reveals as one block at step 2; With Ventus builds one segment per beat from step 3.
            const revealFor = (segmentIndex: number) =>
              (blue ? step >= 3 + segmentIndex : step >= 2) ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0";
            return (
              <Fragment key={row.label}>
                <div className={cn("col-span-5 mb-3 transition-all duration-700 motion-reduce:transition-none", index === 1 && "mt-[clamp(52px,7vh,78px)]", revealFor(0))}>
                  {blue ? (
                    <p className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      <span>{row.label}</span>
                      <img src="/ventus-ai-logo.png" alt="Ventus AI" className="h-[17px] w-auto object-contain" />
                    </p>
                  ) : (
                    <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-deck-muted">{row.label}</p>
                  )}
                </div>
                {row.segments.map((segment, s) => (
                  <Fragment key={segment}>
                    {s > 0 && (
                      <div className={cn("px-1 text-center text-[clamp(17px,2vw,34px)] font-bold transition-all duration-700 motion-reduce:transition-none", revealFor(s), blue ? "text-blue-600" : "text-deck-muted")}>=</div>
                    )}
                    <div className={cn("whitespace-nowrap text-[clamp(17px,2vw,34px)] font-bold leading-snug transition-all duration-700 motion-reduce:transition-none", revealFor(s), blue ? "text-blue-600" : "text-slate-950")}>{segment}</div>
                  </Fragment>
                ))}
              </Fragment>
            );
          })}
      </div>
    </div>
  );
}

function Visibility({ step, active = false }: SceneProps) {
  const d = DECKMO.visibility;
  const moved = step > 0;
  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col px-10 pt-8 xl:px-14 [@media(max-height:800px)]:pt-5">
      <Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <div className="relative mt-7 min-h-0 flex-1 [@media(max-height:800px)]:mt-5">
        <div className={cn(
          "absolute inset-y-0 transition-all duration-700 ease-in-out motion-reduce:transition-none",
          moved ? "left-0 w-[calc(50%-24px)] translate-x-0" : "left-1/2 w-[900px] max-w-full -translate-x-1/2"
        )}>
          <InsideLedger data={d.inside} active={active} />
        </div>
        <div className={cn(
          "absolute inset-y-0 right-0 w-[calc(50%-24px)] transition-all duration-700 ease-in-out motion-reduce:transition-none",
          moved ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-[5px]"
        )}>
          <OutsideTicker data={d.outside} revealed={moved} active={active} />
        </div>
        <div className={cn(
          "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-deck-rule transition-opacity duration-700 motion-reduce:transition-none",
          moved ? "opacity-100" : "opacity-0"
        )} />
      </div>
    </div>
  );
}

const RAIL_STYLES: Record<string, { badge: string; row: string }> = {
  CARD: { badge: "border-blue-300 bg-blue-100 text-blue-800", row: "bg-blue-100/70" },
  ACH: { badge: "border-violet-300 bg-violet-100 text-violet-800", row: "bg-violet-100/60" },
  CHECK: { badge: "border-amber-300 bg-amber-100 text-amber-800", row: "bg-amber-100/60" },
  WIRE: { badge: "border-teal-300 bg-teal-100 text-teal-800", row: "bg-teal-100/60" },
  RTP: { badge: "border-cyan-300 bg-cyan-100 text-cyan-800", row: "bg-cyan-100/60" },
  ATM: { badge: "border-slate-300 bg-slate-200 text-slate-700", row: "bg-slate-100" },
  "Premium Card": { badge: "border-blue-300 bg-blue-100 text-blue-800", row: "bg-blue-100/70" },
  "Cashback Card": { badge: "border-emerald-300 bg-emerald-100 text-emerald-800", row: "bg-emerald-100/60" },
  Checks: { badge: "border-amber-300 bg-amber-100 text-amber-800", row: "bg-amber-100/60" },
  Wire: { badge: "border-teal-300 bg-teal-100 text-teal-800", row: "bg-teal-100/60" },
  Zelle: { badge: "border-violet-300 bg-violet-100 text-violet-800", row: "bg-violet-100/60" },
};

function InsideLedger({ data, active }: { data: typeof DECKMO.visibility.inside; active: boolean }) {
  const trackRows = [0, 1, 2, 3, 4, 5];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 pb-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{data.header}</p>
        </div>
        <p className="mt-1 text-sm text-deck-muted">{data.caption}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col border-x border-t border-blue-200 bg-background">
        <div className="grid shrink-0 grid-cols-[68px_78px_minmax(0,1fr)_84px] gap-2 border-b border-blue-200 bg-blue-50 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-700">
          <span>Account</span><span>Rail</span><span>Raw description</span><span className="text-right">Amount</span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" />
          <VerticalRoller active={active} pixelsPerSecond={VISIBILITY_ROLLER_SPEED}>
            {trackRows.map((group) => data.rows.map((row) => (
                  <div key={`${group}-${row.id}-${row.description}`} className={cn("grid min-h-[30px] grid-cols-[68px_78px_minmax(0,1fr)_84px] items-center gap-2 border-b border-deck-rule px-3 py-1 text-[10px] text-deck-muted", (RAIL_STYLES[row.rail] ?? RAIL_STYLES.CARD).row)}>
                    <span className="font-mono text-[9px] text-deck-muted">{row.id}</span>
                    <span className={cn("w-fit border px-1.5 py-0.5 text-[8px] font-bold uppercase", (RAIL_STYLES[row.rail] ?? RAIL_STYLES.CARD).badge)}>{row.rail}</span>
                    <span className="min-w-0 truncate font-mono text-[10px] font-semibold text-deck-navy">{row.description}{"mcc" in row && <span className="ml-2 text-[8px] font-medium text-deck-muted">MCC {row.mcc} · {row.mccLabel}</span>}</span>
                    <span className={cn("text-right font-mono text-[10px] font-semibold tabular-nums", row.amount.startsWith("+") ? "text-emerald-700" : "text-deck-navy")}>{row.amount}</span>
                  </div>
            )))}
          </VerticalRoller>
        </div>
      </div>
    </div>
  );
}

const OUTSIDE_ICONS: Record<string, LucideIcon> = {
  "Bought a house": Home,
  "Changed to a new job": BriefcaseBusiness,
  "Got married": Heart,
  "Started a business": Building2,
  "Took a trip overseas": Plane,
  "Children going to college": GraduationCap,
  "And everything in between": Sparkles,
};

function OutsideTicker({ data, revealed, active }: { data: typeof DECKMO.visibility.outside; revealed: boolean; active: boolean }) {
  const trackRows = [0, 1, 2];
  return <div className="flex h-full min-h-0 flex-col"><div className="shrink-0 pb-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-deck-muted">{data.header}</p><p className="mt-1 text-sm text-deck-muted">{data.caption}</p></div><div className="relative min-h-0 flex-1 overflow-hidden border-x border-t border-dashed border-deck-rule bg-deck-surface/40"><div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-background via-background/80 to-transparent" /><div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-background via-background/80 to-transparent" /><VerticalRoller active={active} pixelsPerSecond={VISIBILITY_ROLLER_SPEED} className={cn("px-4 transition-[filter,opacity] duration-700 motion-reduce:transition-none", !revealed && "blur-[5px] opacity-20")}>{trackRows.map(group=><div key={group} className="space-y-3 py-3">{data.rows.map(row=><div key={`${group}-${row}`} className="flex min-h-[64px] items-center gap-3 border border-deck-rule bg-background px-4 py-3 opacity-70 shadow-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-deck-surface text-deck-muted">{(() => { const RowIcon = OUTSIDE_ICONS[row] ?? ExternalLink; return <RowIcon className="h-3.5 w-3.5" />; })()}</span><span className="min-w-0 flex-1 text-sm font-semibold text-deck-muted">{row}</span><span className="shrink-0 text-xs italic text-deck-muted">{data.status}</span></div>)}</div>)}</VerticalRoller><div className={cn("pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 transition-all duration-700",revealed?"translate-y-3 opacity-0":"translate-y-0 opacity-100")}><p className="max-w-sm bg-background/90 px-6 py-4 text-center font-deck-serif text-xl text-deck-muted shadow-sm">{data.empty}</p></div></div></div>;
}

function SourceCard({ source, tone, align }: { source: typeof DECKMO.livingView.inside | typeof DECKMO.livingView.outside; tone: "blue" | "amber"; align: "left" | "right" }) {
  const t = TONES[tone];
  return <div className={cn("relative min-w-0 rounded-lg border bg-background p-6 shadow-[0_10px_30px_hsl(var(--deck-navy)/0.045)] transition-shadow duration-500 [@media(max-height:800px)]:p-5", t.border, align === "right" && "text-right")}><div className={cn("absolute top-0 h-1 w-14", t.dot, align === "left" ? "left-6" : "right-6")} /><p className={cn("break-words text-[10px] font-bold uppercase tracking-[0.16em]", t.text)}>{source.header}</p><h3 className="mt-3 break-words text-[clamp(16px,1.35vw,20px)] font-bold leading-snug text-foreground">{source.title}</h3><div className={cn("mt-5 flex min-w-0 flex-wrap gap-2 [@media(max-height:800px)]:mt-4", align === "right" && "justify-end")}>{source.chips.map(chip => <span key={chip} className={cn("max-w-full whitespace-normal break-words rounded-full border px-3 py-1.5 text-center text-[clamp(10px,0.8vw,12px)] font-semibold leading-tight", t.border, t.bg, t.text)}>{chip}</span>)}</div></div>;
}

function LivingView({ step, active: sectionActive = false }: SceneProps) {
  const d = DECKMO.livingView;
  const synthesized = step > 0;
  const questionsRevealed = step > 1;
  const flowing = sectionActive;
  return <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-8 py-8 xl:px-12 [@media(max-height:800px)]:py-4"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} /><div className="flex min-h-0 flex-1 -translate-y-12 flex-col"><div className="mt-8 grid min-h-0 flex-1 grid-cols-[minmax(190px,1fr)_clamp(40px,6vw,88px)_minmax(240px,300px)_clamp(40px,6vw,88px)_minmax(190px,1fr)] items-center [@media(max-height:800px)]:mt-5"><SourceCard source={d.inside} tone="blue" align="left" /><div className="relative z-20 h-px overflow-visible bg-blue-200"><div className="absolute inset-y-0 left-0 w-full bg-deck-blue" /><span className={cn("absolute -top-[3px] h-2 w-2 rounded-full bg-deck-blue shadow-[0_0_12px_hsl(var(--deck-blue)/0.65)] motion-reduce:right-0", flowing ? "deck-signal-left" : "right-0 opacity-60")} /><ChevronRight className="absolute -right-1.5 top-1/2 h-5 w-5 -translate-y-1/2 text-deck-blue" /></div><div className="relative z-10 flex min-h-[250px] min-w-0 flex-col items-center justify-center text-center [@media(max-height:800px)]:min-h-[220px]"><div className="absolute h-64 w-64 max-w-full rounded-full bg-background [@media(max-height:800px)]:h-56 [@media(max-height:800px)]:w-56" /><div className={cn("absolute h-64 w-64 max-w-full rounded-full border bg-deck-surface/50 transition-all duration-700 motion-reduce:transition-none [@media(max-height:800px)]:h-56 [@media(max-height:800px)]:w-56", synthesized ? "scale-100 border-deck-blue/25" : "scale-95 border-deck-blue/15")} /><div className={cn("absolute h-56 w-56 max-w-full rounded-full border border-deck-blue/45 motion-reduce:scale-100 motion-reduce:opacity-30 [@media(max-height:800px)]:h-48 [@media(max-height:800px)]:w-48", flowing && "deck-breathe-ring")}/><div className={cn("absolute h-64 w-64 max-w-full rounded-full border border-deck-blue/30 motion-reduce:scale-100 motion-reduce:opacity-20 [@media(max-height:800px)]:h-56 [@media(max-height:800px)]:w-56", flowing && "deck-breathe-ring deck-breathe-ring-delayed")}/><div className={cn("relative flex h-36 w-36 items-center justify-center rounded-full border bg-background transition-all duration-700 motion-reduce:transform-none [@media(max-height:800px)]:h-32 [@media(max-height:800px)]:w-32", flowing && "deck-node-breathe", synthesized ? "border-deck-blue/70" : "border-deck-blue/35")}><div className="flex h-28 w-28 items-center justify-center rounded-full bg-deck-surface [@media(max-height:800px)]:h-24 [@media(max-height:800px)]:w-24"><UserRound className={cn("h-12 w-12 transition-colors duration-700", synthesized ? "text-deck-blue" : "text-deck-muted")} /></div></div><p className={cn("relative mt-5 max-w-full break-words text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-700", synthesized ? "text-deck-blue" : "text-deck-muted")}>{d.result.header}</p></div><div className="relative z-20 h-px overflow-visible bg-amber-200"><div className="absolute inset-y-0 right-0 w-full bg-deck-gold" /><span className={cn("absolute -top-[3px] h-2 w-2 rounded-full bg-deck-gold shadow-[0_0_12px_hsl(var(--deck-gold)/0.65)] motion-reduce:left-0", flowing ? "deck-signal-right" : "left-0 opacity-60")} /><ChevronRight className="absolute -left-1.5 top-1/2 h-5 w-5 -translate-y-1/2 rotate-180 text-deck-gold" /></div><SourceCard source={d.outside} tone="amber" align="right" /></div><div className={cn("shrink-0 transition-opacity duration-300 motion-reduce:transition-none", synthesized ? "opacity-100" : "pointer-events-none opacity-0")}><div className={cn("relative mx-auto -mt-[112px] h-[112px] w-px origin-top overflow-visible bg-deck-blue/60 transition-transform delay-150 duration-500 motion-reduce:transition-none", synthesized ? "scale-y-100" : "scale-y-0")}><span className={cn("absolute -left-[3px] h-2 w-2 rounded-full bg-deck-blue shadow-[0_0_12px_hsl(var(--deck-blue)/0.65)] motion-reduce:top-0", flowing ? "deck-signal-down" : "top-0 opacity-60")} /></div><ChevronDown className={cn("mx-auto -mt-0.5 mb-1 h-3.5 w-3.5 text-deck-blue/70 transition-[opacity,transform] delay-150 duration-500 motion-reduce:transition-none motion-reduce:transform-none", synthesized ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-75 opacity-0")} /><div className={cn("relative h-[114px] rounded-lg border border-deck-rule bg-background px-8 shadow-[0_10px_30px_hsl(var(--deck-navy)/0.045)] transition-all delay-500 duration-700 motion-reduce:transition-none [@media(max-height:800px)]:h-[98px] [@media(max-height:800px)]:px-6", synthesized ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}><div className={cn("absolute inset-x-8 items-center transition-[top,transform] duration-500 ease-in-out motion-reduce:transition-none [@media(max-height:800px)]:inset-x-6", "flex justify-between", questionsRevealed ? "top-4 translate-y-0 [@media(max-height:800px)]:top-3" : "top-1/2 -translate-y-1/2")}>{d.synthesis.families.map((family) => { const t = TONES[family.tone as keyof typeof TONES]; return <div key={family.name} className="flex min-w-0 items-center gap-2.5 max-xl:gap-1.5"><span className={cn("shrink-0 rounded-full max-xl:h-2 max-xl:w-2", questionsRevealed ? "h-2.5 w-2.5" : "h-3 w-3", t.dot)} /><span className={cn("font-bold max-xl:text-[11px] [@media(max-width:1200px)_and_(max-height:800px)]:text-[11px]", questionsRevealed ? "text-[15px] [@media(max-height:800px)]:text-[13px]" : "text-[18px] [@media(max-height:800px)]:text-[14px]", t.text)}>{family.name}</span></div>; })}</div><p className={cn("absolute inset-x-8 bottom-4 text-center text-[clamp(19px,1.8vw,28px)] font-bold leading-tight text-slate-950 transition-all delay-200 duration-500 motion-reduce:transition-none [@media(max-height:800px)]:inset-x-6 [@media(max-height:800px)]:bottom-3", questionsRevealed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")} aria-hidden={!questionsRevealed}>{d.synthesis.question}</p></div></div></div></div>;
}

function SignalFamilyCard({ signals, selectedLabel, onSelect, cascadeDelay = 0 }: { signals: (typeof DECKMO.ricky.signals[number])[]; selectedLabel: string | null; onSelect: (label: string) => void; cascadeDelay?: number }) {
  const first = signals[0];
  if (!first) return null;
  const tone = TONES[first.tone];
  return (
    <div className="min-w-0">
      <div className="deck-ricky-cascade flex items-center gap-2" style={{ animationDelay: `${cascadeDelay}ms` }}>
        <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />
        <span className={cn("text-[11px] font-bold uppercase tracking-[0.12em]", tone.text)}>{first.family}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 [@media(max-width:1200px)_and_(max-height:800px)]:mt-1.5 [@media(max-width:1200px)_and_(max-height:800px)]:gap-1.5">
        {signals.map((signal, index) => {
          const selected = selectedLabel === signal.label;
          return <Button key={signal.label} type="button" variant="outline" aria-pressed={selected} onClick={() => onSelect(signal.label)} style={{ animationDelay: `${cascadeDelay + ((index + 1) * 70)}ms` }} className={cn("deck-ricky-cascade h-auto min-h-11 max-w-full whitespace-normal rounded-full border px-4 py-2.5 text-left text-[14px] font-semibold leading-tight shadow-none transition-[filter,box-shadow] hover:brightness-95 [@media(max-height:800px)]:text-[13px] [@media(max-width:1200px)_and_(max-height:800px)]:min-h-9 [@media(max-width:1200px)_and_(max-height:800px)]:px-3 [@media(max-width:1200px)_and_(max-height:800px)]:py-1.5 [@media(max-width:1200px)_and_(max-height:800px)]:text-[11px]", tone.pillBorder, cn(tone.fullBg, tone.hoverBg, tone.fullText), selected && "ring-2 ring-slate-900 ring-offset-1 shadow-md")}><span>{signal.label}</span>{signal.source === "external" && <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-700"><Sparkles className="h-3 w-3" />Ext</span>}</Button>;
        })}
      </div>
    </div>
  );
}

function Ricky({ step, active = false }: SceneProps) {
  const d = DECKMO.ricky;
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [rollComplete, setRollComplete] = useState(false);
  const selectedSignal = d.signals.find((signal) => signal.label === selectedLabel);
  const selectedExternalEvidence = selectedSignal && "externalEvidence" in selectedSignal ? selectedSignal.externalEvidence : null;
  const displayedTransactions = selectedLabel && selectedSignal?.source === "internal"
    ? RICKY_TRANSACTIONS.filter((transaction) => transaction.signals.some((signal) => signal === selectedLabel))
    : RICKY_TRANSACTIONS;
  const selectSignal = (label: string) => setSelectedLabel((current) => current === label ? null : label);
  const families = d.signals.reduce<Record<string, (typeof d.signals[number])[]>>((grouped, signal) => {
    (grouped[signal.family] ??= []).push(signal);
    return grouped;
  }, {});

  useEffect(() => {
    setRollComplete(false);
    if (!active || step !== 1) return;
    const timer = window.setTimeout(() => setRollComplete(true), 2200);
    return () => window.clearTimeout(timer);
  }, [active, step]);

  const signalTone = (labels: RickySignalLabel[]) => {
    const matchingSignal = d.signals.find((candidate) => candidate.source === "internal" && labels.includes(candidate.label as RickySignalLabel));
    return matchingSignal?.tone as Tone | undefined;
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1560px] flex-col px-10 pt-8 xl:px-14 [@media(max-height:800px)]:pt-5">
      <Header eyebrow={d.eyebrow} title={d.title} />
      <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden border border-deck-rule bg-background shadow-[0_14px_36px_hsl(var(--deck-navy)/0.05)] [@media(max-height:800px)]:mt-4">
        <div className="flex shrink-0 items-center gap-3 border-b border-deck-rule bg-gradient-to-b from-background to-deck-surface/60 px-6 py-2.5 [@media(max-height:800px)]:px-5 [@media(max-height:800px)]:py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-blue-200 bg-blue-50 text-deck-blue shadow-sm [@media(max-height:800px)]:h-6 [@media(max-height:800px)]:w-6">
            <UserRound className="h-4 w-4 [@media(max-height:800px)]:h-3.5 [@media(max-height:800px)]:w-3.5" />
          </div>
          <h3 className="shrink-0 font-display text-[clamp(15px,1.1vw,18px)] font-bold leading-none text-deck-navy">{d.profileTitle}</h3>
          <span className="h-4 w-px shrink-0 bg-deck-rule" />
          <p className="min-w-0 truncate text-[11px] font-semibold tracking-wide text-slate-500 [@media(max-height:800px)]:text-[10px]">{d.profileFacts}</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="flex min-h-0 flex-col border-r border-deck-rule bg-deck-surface/50">
          {selectedExternalEvidence ? <div className="flex min-h-0 flex-1 items-start p-5">
            <div className="w-full border border-violet-200 bg-violet-50/50 p-5">
              <div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-violet-200 bg-background text-violet-600"><Sparkles className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-base font-bold text-slate-900">{selectedSignal?.label}</p><span className="rounded-full border border-violet-200 bg-background px-2.5 py-1 text-[10px] font-bold uppercase text-violet-700">{selectedExternalEvidence.confidence}</span></div><p className="mt-2 text-sm leading-relaxed text-slate-600">{selectedExternalEvidence.detail}</p></div></div>
              <div className="mt-5 grid grid-cols-2 border-t border-violet-200 pt-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-600">Source</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedExternalEvidence.provider}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-600">Timing</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedExternalEvidence.timing}</p></div></div>
            </div>
          </div> : <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 scrollbar-light">
            <div className="sticky top-0 z-10 grid grid-cols-[54px_94px_minmax(0,1fr)_90px] gap-3 border-b border-slate-300 bg-slate-50 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400"><span>Date</span><span>Source</span><span>Transaction</span><span className="text-right">Amount</span></div>
            <div className={cn(active && step === 1 && !rollComplete && "deck-ricky-ledger-roll")}>
              {displayedTransactions.map((transaction) => {
                const tone = signalTone(transaction.signals);
                const highlighted = (rollComplete || selectedLabel !== null) && tone !== undefined;
                const rowTone = tone ? RICKY_ROW_TONES[tone] : undefined;
                return (
                <div key={transaction.id} className={cn("grid grid-cols-[54px_94px_minmax(0,1fr)_90px] items-center gap-3 border-b border-l-[3px] border-b-slate-200/80 border-l-transparent py-2 pl-2 transition-colors duration-500", highlighted && "deck-ricky-row-highlight", highlighted && rowTone)}>
                  <span className="font-mono text-[9px] font-semibold tabular-nums text-slate-400">{transaction.date}</span>
                   <span className={cn("h-fit truncate rounded-sm border px-1.5 py-0.5 text-center text-[8px] font-bold", (RAIL_STYLES[transaction.source] ?? RAIL_STYLES.CARD).badge)}>{transaction.source}</span>
                   <p className="min-w-0 truncate font-mono text-[10px] font-bold text-slate-800">{transaction.description}{transaction.mcc && <span className="ml-2 text-[8px] font-medium text-slate-500">MCC {transaction.mcc} · {transaction.mccLabel}</span>}</p>
                  <span className="text-right font-mono text-[11px] font-bold tabular-nums text-slate-800">{transaction.amount}</span>
                </div>
              );})}
            </div>
          </div>}
        </section>

        <section className="flex min-h-0 flex-col bg-background px-7 py-5 [@media(max-height:800px)]:px-6 [@media(max-height:800px)]:py-4">
          <div className="flex min-h-0 flex-1 flex-col">
            {step > 0 && <>
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-deck-rule pb-3">
                <p className="deck-ricky-cascade text-[10px] font-bold uppercase tracking-[0.16em] text-deck-muted">{d.signalLabel}</p>
              </div>
              <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between gap-y-2 [@media(max-height:800px)]:mt-3 [@media(max-height:800px)]:gap-y-1.5">
                {Object.values(families).map((signals, index) => (
                  <SignalFamilyCard key={signals[0]?.family} signals={signals} selectedLabel={selectedLabel} onSelect={selectSignal} cascadeDelay={180 + (index * 150)} />
                ))}
              </div>
            </>}
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ title, children }: { title:string; children:React.ReactNode }) { return <div className="mx-auto flex h-[570px] w-[330px] flex-col overflow-hidden rounded-[30px] border-[8px] border-slate-300 bg-white shadow-2xl"><div className="flex h-7 shrink-0 items-center justify-center bg-white"><span className="h-2 w-2 rounded-full bg-slate-300"/></div><div className="flex items-center justify-between border-b border-slate-100 px-4 py-2"><span className="text-[9px] text-slate-400">{DECKMO.chrome.phoneTime}</span><span className="text-[11px] font-bold text-slate-700">{title}</span><span className="text-[9px] text-slate-400">{DECKMO.chrome.phoneMenu}</span></div><div className="min-h-0 flex-1 overflow-hidden">{children}</div><div className="flex h-7 shrink-0 items-center justify-center"><span className="h-1 w-24 rounded-full bg-slate-300"/></div></div>; }

function Callouts({ items, step }: { items: readonly string[] | readonly {title:string;body:string}[]; step:number }) { return <div className="space-y-3">{items.map((item,index)=>{const title=typeof item==="string"?item:item.title; const body=typeof item==="string"?null:item.body; return <Reveal key={title} show={step>=index}><div className={cn("rounded-xl border p-4 transition-colors",step===index?"border-blue-300 bg-blue-50":"border-slate-200 bg-white")}><div className="flex items-start gap-3"><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",step===index?"bg-blue-600 text-white":"bg-slate-100 text-slate-500")}>{index+1}</span><div><p className="text-sm font-bold text-slate-900">{title}</p>{body&&<p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>}</div></div></div></Reveal>})}</div>; }

function Immediate({step}:SceneProps){const d=DECKMO.immediate;return <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[1fr_370px_380px] items-center gap-10 px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><PhoneFrame title={d.phoneTitle}><div className="h-full overflow-y-auto px-3 py-3"><p className="mb-3 text-[10px] font-semibold text-slate-400">{d.account}</p>{d.activity.map((tx,index)=><div key={tx.raw} className={cn("mb-2 rounded-xl border p-3 transition-all duration-500",step>=index?"border-blue-200 bg-blue-50/50":"border-slate-100 bg-white")}><p className={cn("font-mono text-[9px]",step>=index?"text-slate-400":"text-slate-600")}>{tx.raw}</p>{step>=index&&<Reveal show><p className="mt-1 text-[12px] font-bold text-slate-800">{tx.clean}</p><p className="mt-1 text-[9px] text-slate-500">{tx.meta}</p><span className="mt-2 inline-flex rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[8px] font-semibold text-blue-700">{tx.pattern}</span></Reveal>}</div>)}{step>=3&&<div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 shadow-lg"><p className="text-[11px] font-bold text-slate-900">{d.explainer.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-500">{d.explainer.body}</p><div className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-center text-[9px] font-bold text-white">{d.explainer.action}</div></div>}</div></PhoneFrame><Callouts items={d.popups} step={step}/></div>}

function MidTerm({step}:SceneProps){const d=DECKMO.midTerm;return <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[1fr_370px_360px] items-center gap-10 px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><PhoneFrame title={d.phoneTitle}><div className="h-full overflow-y-auto p-3"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-[8px] font-bold tracking-wider text-blue-700">{d.topPick.label}</p><Plane className="mt-3 h-7 w-7 text-blue-600"/><p className="mt-2 text-base font-bold text-slate-900">{d.topPick.title}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-600">{d.topPick.body}</p><p className="mt-3 text-[10px] font-bold text-blue-700">{d.topPick.benefit}</p><p className="mt-3 rounded-lg bg-blue-600 py-2 text-center text-[9px] font-bold text-white">{d.topPick.action}</p></div>{step>=1&&<div className="mt-3 flex gap-1.5 overflow-hidden">{d.categories.map((c,i)=><span key={c} className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-semibold",i===0?"border-blue-200 bg-blue-50 text-blue-700":"border-slate-200 text-slate-500")}>{c}</span>)}</div>}{step>=2&&<div className="mt-3 space-y-2">{d.deals.map(x=><div key={x.title} className="rounded-lg border border-slate-200 bg-white p-2.5"><div className="flex justify-between gap-2"><p className="text-[10px] font-bold text-slate-800">{x.title}</p><span className="text-[8px] font-semibold text-blue-600">{x.family}</span></div><p className="mt-1 text-[9px] text-slate-500">{x.detail}</p></div>)}</div>}{step>=3&&<div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><Home className="h-5 w-5 text-amber-600"/><p className="mt-2 text-[11px] font-bold text-slate-900">{d.product.title}</p><p className="mt-1 text-[9px] text-slate-600">{d.product.body}</p><p className="mt-2 text-[11px] font-bold text-amber-700">{d.product.benefit}</p></div>}{step>=4&&<div className="mt-3 rounded-xl border border-slate-200 p-3"><p className="text-[10px] font-bold text-slate-900">{d.placement.title}</p><div className="mt-2 flex flex-wrap gap-1">{d.placement.channels.map(x=><span key={x} className="rounded bg-slate-100 px-2 py-1 text-[8px] text-slate-600">{x}</span>)}</div></div>}</div></PhoneFrame><Callouts items={d.popups} step={step}/></div>}

function LongTerm({step}:SceneProps){const d=DECKMO.longTerm;const stages=[d.event,d.advisor,d.outreach];return <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[1fr_370px_360px] items-center gap-10 px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><PhoneFrame title={d.phoneTitle}><div className="h-full p-4"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UserRound className="h-5 w-5"/></div><div><p className="text-[11px] font-bold text-slate-800">{d.phoneTitle}</p><p className="text-[9px] text-slate-500">{DECKMO.ricky.profileBody}</p></div></div><div className="mt-4 space-y-3">{stages.map((stage,index)=><Reveal key={stage.title} show={step>=index}><div className={cn("rounded-xl border p-3",index===0?"border-amber-200 bg-amber-50":index===1?"border-blue-200 bg-blue-50":"border-emerald-200 bg-emerald-50")}><p className="text-[8px] font-bold tracking-wider text-slate-500">{stage.label}</p><p className="mt-1 text-[12px] font-bold text-slate-900">{stage.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{stage.body}</p>{"action" in stage&&<p className="mt-2 rounded-lg bg-emerald-600 py-2 text-center text-[9px] font-bold text-white">{stage.action}</p>}</div></Reveal>)}</div></div></PhoneFrame><Callouts items={d.popups} step={step}/></div>}

function BrowserFrame({children}:{children:React.ReactNode}){return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl"><div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3"><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><div className="mx-auto h-5 w-1/2 rounded bg-white"/></div><div className="h-[510px] p-5">{children}</div></div>}

function BankTools({step}:SceneProps){const d=DECKMO.bankTools;const s=d.screens[step];return <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><div className="mt-6 flex gap-2">{d.screens.map((screen,index)=><span key={screen.id} className={cn("rounded-full border px-4 py-2 text-xs font-bold",index===step?"border-blue-300 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-400")}>{screen.tab}</span>)}</div><div className="mt-4"><BrowserFrame><div className="grid h-full grid-cols-[280px_1fr] gap-6"><div className="border-r border-slate-200 pr-5"><p className="text-xs font-bold tracking-wider text-blue-600">{s.tab}</p><h3 className="mt-3 text-2xl font-bold text-slate-900">{s.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-500">{s.description}</p></div><BankToolContent step={step}/></div></BrowserFrame></div></div>}

function BankToolContent({step}:{step:number}){const s=DECKMO.bankTools.screens[step];if(s.id==="database")return <div className="grid grid-cols-5 gap-3 content-start">{s.families.map(f=>{const t=TONES[f.tone];return <div key={f.label} className={cn("rounded-lg border bg-white p-4",t.border)}><span className={cn("block h-1 w-8 rounded",t.dot)}/><p className="mt-5 text-sm font-bold text-slate-900">{f.label}</p><p className={cn("mt-2 text-3xl font-bold",t.text)}>{f.count}</p><p className="text-[10px] text-slate-400">{DECKMO.bankTools.screens[0].actions[0]}</p></div>})}<div className="col-span-5 mt-3 flex gap-3">{s.actions.map(a=><span key={a} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">{a}</span>)}</div></div>;if(s.id==="flows")return <div className="grid grid-cols-2 gap-4 content-start">{s.flows.map(flow=><div key={flow.name} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-600"/><p className="text-sm font-bold text-slate-900">{flow.name}</p></div><div className="mt-4 space-y-2">{flow.triggers.map(x=><div key={x} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><Target className="h-3.5 w-3.5 text-slate-400"/>{x}</div>)}</div></div>)}<div className="col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-4"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-rose-600"/><div><p className="text-[10px] font-bold tracking-wider text-rose-700">{s.guardrail.label}</p><p className="mt-1 text-sm font-bold text-slate-900">{s.guardrail.title}</p><p className="mt-1 text-xs text-slate-600">{s.guardrail.body}</p></div></div></div></div>;return <div className="grid grid-cols-[1fr_250px] gap-4"><div className="space-y-3">{s.inbox.map((mail,index)=><div key={mail.role} className={cn("rounded-xl border p-4",index===0?"border-blue-200 bg-blue-50":"border-slate-200 bg-white")}><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600"/><p className="text-xs font-bold text-slate-500">{mail.role}</p></div><p className="mt-2 text-sm font-bold text-slate-900">{mail.subject}</p><p className="mt-1 text-xs text-slate-500">{mail.preview}</p></div>)}</div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><Sparkles className="h-6 w-6 text-blue-600"/><p className="mt-4 text-sm font-bold text-slate-900">{s.reply}</p></div></div>}

function Close({step}:SceneProps){const d=DECKMO.close;return <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-12 text-center"><img src={ventusLogo} alt="Ventus AI" className="mb-10 h-8 w-auto object-contain"/><Eyebrow>{d.eyebrow}</Eyebrow><div className="mt-6 space-y-5">{d.lines.map((line,index)=><Reveal key={line} show={step>=index}><p className={cn("font-bold tracking-normal text-slate-950",index===2?"text-[clamp(42px,5vw,72px)] text-blue-600":"text-[clamp(25px,2.8vw,42px)]")}>{line}</p></Reveal>)}</div><Reveal show={step>=3} className="mt-10"><div className="flex justify-center gap-3">{d.outcomes.map(o=><span key={o} className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700">{o}</span>)}</div><div className="mt-8 flex items-center justify-center gap-5"><Button asChild><Link to={d.href}>{d.cta}<ArrowRight className="h-4 w-4"/></Link></Button><p className="text-sm font-semibold text-slate-500">{d.exhibit}</p></div></Reveal></div>}

const SCENES: Record<DeckmoBeatId,(props:SceneProps)=>React.ReactNode>={opener:Opener,visibility:Visibility,"living-view":LivingView,ricky:Ricky,immediate:BankdemoImmediate,"mid-term":BankdemoMidTerm,"long-term":BankdemoLongTerm,retention:BankdemoRetention,"bank-tools":BankdemoBankTools,close:Close};

export function DeckmoDeck(){const [globalStep,setGlobalStep]=useState(0);const [presenterOpen,setPresenterOpen]=useState(false);const scroller=useRef<HTMLDivElement>(null);const sectionRefs=useRef<(HTMLElement|null)[]>([]);const current=DECKMO_STEPS[globalStep];const activeBeat=DECKMO.beats[current.section];const hasSub="sub" in current&&!!current.sub;const beatNum=current.screen+1;const slideNumber=hasSub?`${current.section+1}.${beatNum}.${current.sub}`:`${current.section+1}${activeBeat.steps>1?`.${beatNum}`:""}`;const slideTotal=String(DECKMO.beats.length);
const navLock=useRef<number|null>(null);
const jump=useCallback((index:number)=>{const bounded=Math.max(0,Math.min(DECKMO_STEPS.length-1,index));setGlobalStep(bounded);const next=DECKMO_STEPS[bounded];if(navLock.current)window.clearTimeout(navLock.current);navLock.current=window.setTimeout(()=>{navLock.current=null},900);sectionRefs.current[next.section]?.scrollIntoView({behavior:"smooth",block:"start"});},[]);
const firstStepBySection=useMemo(()=>DECKMO.beats.map((_,section)=>DECKMO_STEPS.findIndex(x=>x.section===section)),[]);
useEffect(()=>()=>{if(navLock.current)window.clearTimeout(navLock.current)},[]);
useEffect(()=>{const onKey=(e:KeyboardEvent)=>{const t=e.target as HTMLElement|null;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.tagName==="SELECT"||t.isContentEditable))return;if(e.key.toLowerCase()==="p"){e.preventDefault();setPresenterOpen(v=>!v);return}if(e.key==="Escape"){if(presenterOpen){e.preventDefault();setPresenterOpen(false)}return}if(presenterOpen)return;if(["ArrowRight","ArrowDown"].includes(e.key)){e.preventDefault();jump(globalStep+1);return}if(["ArrowLeft","ArrowUp"].includes(e.key)){e.preventDefault();jump(globalStep-1)}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[globalStep,jump,presenterOpen]);
useEffect(()=>{const root=scroller.current;if(!root)return;const observer=new IntersectionObserver(entries=>{if(navLock.current)return;const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const section=Number((visible.target as HTMLElement).dataset.section);if(Number.isFinite(section)&&section!==current.section)setGlobalStep(firstStepBySection[section]);},{root,threshold:[0.55,0.8]});sectionRefs.current.forEach(el=>el&&observer.observe(el));return()=>observer.disconnect()},[current.section,firstStepBySection]);
return <div className="demo-page relative h-screen w-screen overflow-hidden bg-background font-deck text-foreground">
  <header className="absolute inset-x-0 top-0 z-40 flex h-20 items-center justify-between border-b border-deck-rule bg-background px-12">
    <div className="flex min-w-0 items-center gap-4"><img src={ventusLogoBlue} alt="Ventus AI" className="h-7 w-auto shrink-0 object-contain"/><span className="h-6 w-px shrink-0 bg-deck-rule"/><span className="truncate font-deck-serif text-2xl text-deck-navy" aria-live="polite">{activeBeat.nav}</span></div>
      <div className="flex shrink-0 items-center gap-6 text-xs font-semibold uppercase tracking-wide text-deck-muted"><span>INTERACTIVE PRESENTATION</span></div>
  </header>
  <div ref={scroller} className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth">{DECKMO.beats.map((beat,section)=>{const Scene=SCENES[beat.id];const active=section===current.section;const step=active?current.step:section<current.section?beat.steps-1:0;return <section key={beat.id} ref={el=>{sectionRefs.current[section]=el}} data-section={section} className="relative h-screen min-h-[700px] snap-start overflow-hidden bg-background pb-14 pt-20"><div className="h-full"><Scene step={step} active={active}/></div></section>})}</div>
  <footer className="absolute inset-x-0 bottom-0 z-40 flex h-14 items-center justify-between border-t border-deck-rule bg-background px-12">
    <div className="flex items-center gap-6"><div className="flex items-center gap-1.5"><Button variant="outline" size="icon" className="h-7 w-7 rounded-sm border-deck-rule text-deck-navy hover:bg-deck-surface" onClick={()=>jump(globalStep-1)} disabled={globalStep===0} aria-label={DECKMO.chrome.previous}><ArrowLeft className="h-3.5 w-3.5"/></Button><Button variant="outline" size="icon" className="h-7 w-7 rounded-sm border-deck-rule text-deck-navy hover:bg-deck-surface" onClick={()=>jump(globalStep+1)} disabled={globalStep===DECKMO_STEPS.length-1} aria-label={DECKMO.chrome.next}><ArrowRight className="h-3.5 w-3.5"/></Button></div><div className="text-[10px] font-medium uppercase text-deck-muted">Slide <span className="font-semibold text-deck-navy">{slideNumber}</span> / {slideTotal}</div></div>
    <div className="absolute inset-x-0 top-0 h-px bg-deck-surface"><div className="h-full bg-deck-blue transition-[width] duration-200 motion-reduce:transition-none" style={{width:`${((globalStep+1)/DECKMO_STEPS.length)*100}%`}}/></div>
     <div className="flex items-center gap-6"><span className="text-xs font-semibold uppercase tracking-wide text-deck-navy">Confidential</span><span className="h-6 w-px bg-deck-rule"/><Button variant="ghost" className="h-8 rounded-sm px-3 text-deck-navy hover:bg-deck-surface" onClick={()=>setPresenterOpen(true)} aria-label={DECKMO.chrome.presenterTitle}><Grid2X2 className="mr-2 h-3.5 w-3.5"/><span className="text-[10px] font-semibold uppercase">TABLE OF CONTENT</span></Button></div>
  </footer>
  {presenterOpen&&<div role="dialog" aria-modal="true" aria-label={DECKMO.chrome.presenterTitle} className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 p-10 backdrop-blur-sm" onClick={()=>setPresenterOpen(false)}><div className="w-full max-w-3xl rounded-sm border border-deck-rule bg-background p-8 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b border-deck-rule pb-5"><div><p className="font-deck-serif text-2xl text-deck-navy">{DECKMO.chrome.presenterTitle}</p><p className="mt-1 text-xs text-deck-muted">Select a section or press P to return to the presentation.</p></div><Button variant="ghost" size="icon" className="rounded-sm text-deck-navy" onClick={()=>setPresenterOpen(false)} aria-label={DECKMO.chrome.presenterClose}><X/></Button></div><div className="mt-6 grid grid-cols-2 gap-2">{DECKMO.beats.map((beat,index)=><Button key={beat.id} variant="outline" onClick={()=>{jump(firstStepBySection[index]);setPresenterOpen(false)}} className={cn("h-auto justify-start rounded-sm border-deck-rule p-4 text-left hover:bg-deck-surface",index===current.section&&"border-deck-blue bg-deck-surface")}><span className={cn("mr-4 flex h-7 w-7 items-center justify-center border border-deck-rule text-xs font-semibold text-deck-muted",index===current.section&&"border-deck-blue bg-deck-blue text-primary-foreground")}>{String(index+1).padStart(2,"0")}</span><span><span className="block text-sm font-semibold text-deck-navy">{beat.nav}</span><span className="mt-0.5 block text-[10px] font-normal uppercase text-deck-muted">{beat.steps} {DECKMO.chrome.stepUnit}</span></span></Button>)}</div></div></div>}
</div>}

export function DeckmoDesktopGuard({children}:{children:React.ReactNode}){const [desktop,setDesktop]=useState(()=>typeof window==="undefined"?true:window.innerWidth>=1024);useEffect(()=>{const check=()=>setDesktop(window.innerWidth>=1024);window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check)},[]);if(desktop)return <>{children}</>;return <div className="flex h-screen w-screen items-center justify-center bg-white px-6 font-sans"><div className="max-w-sm text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50"><Monitor className="h-8 w-8 text-blue-600"/></div><h1 className="mt-6 text-2xl font-bold text-slate-900">{DECKMO.chrome.desktopTitle}</h1><p className="mt-3 text-sm leading-relaxed text-slate-500">{DECKMO.chrome.desktopBody}</p><Button asChild className="mt-8"><Link to="/">{DECKMO.chrome.returnHome}</Link></Button></div></div>}
