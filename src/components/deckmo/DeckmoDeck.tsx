import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, ChevronRight, ExternalLink, Gift, Grid2X2, Home, Mail, Monitor, Plane, Search, ShieldCheck, Sparkles, Target, UserRound, Wallet, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DECKMO, DECKMO_STEPS, type DeckmoBeatId } from "@/lib/deckmoScript";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import { BankdemoBankTools, BankdemoImmediate, BankdemoLongTerm, BankdemoMidTerm, BankdemoSegmentCampaign } from "./DeckmoBankdemoScenes";

const TONES = {
  blue: { dot: "bg-blue-500", border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700" },
  amber: { dot: "bg-amber-500", border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700" },
  emerald: { dot: "bg-emerald-500", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  violet: { dot: "bg-violet-500", border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700" },
  rose: { dot: "bg-rose-500", border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700" },
} as const;

type Tone = keyof typeof TONES;

type SceneProps = { step: number };

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
  return (
    <div className="mx-auto flex h-full w-full max-w-[1560px] flex-col justify-center px-[clamp(32px,4vw,72px)] py-10 [@media(max-height:800px)]:py-6">
      <div className="w-full">
        <Reveal show={step >= 0}>
          <p className="text-balance text-[clamp(44px,5vw,76px)] font-bold leading-[1.03] tracking-normal text-slate-950">{DECKMO.opener.lines[0]}</p>
        </Reveal>
        <Reveal show={step >= 1} className="mt-3 [@media(max-height:800px)]:mt-2">
          <p className="text-balance text-[clamp(34px,3.9vw,58px)] font-bold leading-[1.06] tracking-normal text-slate-950">{DECKMO.opener.lines[1]}</p>
        </Reveal>
        <div className="mt-[clamp(40px,5vh,72px)] grid grid-cols-[auto_auto_auto_auto_auto] items-baseline gap-x-[clamp(14px,1.6vw,28px)] [@media(max-height:800px)]:mt-8">
          {comparison.map((row, index) => {
            const blue = index === 1;
            // Today reveals as one block at step 2; With Ventus builds one segment per beat from step 3.
            const revealFor = (segmentIndex: number) =>
              (blue ? step >= 3 + segmentIndex : step >= 2) ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0";
            return (
              <Fragment key={row.label}>
                <div className={cn("col-span-5 transition-all duration-700 motion-reduce:transition-none", index === 1 && "mt-[clamp(28px,3.4vh,48px)] [@media(max-height:800px)]:mt-6", revealFor(0))}>
                  <p className={cn("text-[13px] font-bold uppercase tracking-[0.18em]", blue ? "text-blue-600" : "text-deck-muted")}>{row.label}</p>
                </div>
                {row.segments.map((segment, s) => (
                  <Fragment key={segment}>
                    {s > 0 && (
                      <div className={cn("mt-2 px-1 text-[clamp(18px,1.7vw,30px)] font-bold transition-all duration-700 motion-reduce:transition-none", revealFor(s), blue ? "text-blue-600" : "text-deck-muted")}>=</div>
                    )}
                    <div className={cn("mt-2 whitespace-nowrap text-[clamp(18px,1.7vw,30px)] font-bold leading-snug transition-all duration-700 motion-reduce:transition-none", revealFor(s), blue ? "text-blue-600" : "text-slate-950")}>{segment}</div>
                  </Fragment>
                ))}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Visibility({ step }: SceneProps) {
  const d = DECKMO.visibility;
  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col px-10 pt-8 xl:px-14 [@media(max-height:800px)]:pt-5">
      <Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      <div className="mt-7 grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] gap-8 [@media(max-height:800px)]:mt-5">
        <InsideLedger data={d.inside} />
        <div className="border-l border-dashed border-deck-rule" />
        <OutsideTicker data={d.outside} revealed={step > 0} />
      </div>
    </div>
  );
}

const RAIL_STYLES: Record<string, { badge: string; row: string }> = {
  CARD: { badge: "border-blue-200 bg-blue-50 text-blue-700", row: "bg-blue-50/50" },
  ACH: { badge: "border-violet-200 bg-violet-50 text-violet-700", row: "bg-violet-50/40" },
  CHECK: { badge: "border-amber-200 bg-amber-50 text-amber-700", row: "bg-amber-50/40" },
  WIRE: { badge: "border-teal-200 bg-teal-50 text-teal-700", row: "bg-teal-50/40" },
  RTP: { badge: "border-cyan-200 bg-cyan-50 text-cyan-700", row: "bg-cyan-50/40" },
  ATM: { badge: "border-slate-200 bg-slate-100 text-slate-600", row: "bg-slate-50/60" },
};

function InsideLedger({ data }: { data: typeof DECKMO.visibility.inside }) {
  const repeatedRows = [0, 1, 2];
  return (
    <div className="flex min-h-0 flex-col">
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
          <div className="deckmo-visibility-ticker">
            {repeatedRows.map((group) => (
              <div key={group} aria-hidden={group > 0 || undefined}>
                {data.rows.map((row) => (
                  <div key={`${group}-${row.id}-${row.description}`} className={cn("grid min-h-[30px] grid-cols-[68px_78px_minmax(0,1fr)_84px] items-center gap-2 border-b border-deck-rule px-3 py-1 text-[10px] text-deck-muted", (RAIL_STYLES[row.rail] ?? RAIL_STYLES.CARD).row)}>
                    <span className="font-mono text-[9px] text-deck-muted">{row.id}</span>
                    <span className={cn("w-fit border px-1.5 py-0.5 text-[8px] font-bold uppercase", (RAIL_STYLES[row.rail] ?? RAIL_STYLES.CARD).badge)}>{row.rail}</span>
                    <span className="min-w-0 truncate font-mono text-[10px] font-semibold text-deck-navy">{row.description}{"mcc" in row && <span className="ml-2 text-[8px] font-medium text-deck-muted">MCC {row.mcc} · {row.mccLabel}</span>}</span>
                    <span className={cn("text-right font-mono text-[10px] font-semibold tabular-nums", row.amount.startsWith("+") ? "text-emerald-700" : "text-deck-navy")}>{row.amount}</span>

                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutsideTicker({ data, revealed }: { data: typeof DECKMO.visibility.outside; revealed: boolean }) {
  const repeatedRows = [0, 1, 2];
  return <div className="flex min-h-0 flex-col"><div className="shrink-0 pb-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-deck-muted">{data.header}</p><p className="mt-1 text-sm text-deck-muted">{data.caption}</p></div><div className="relative min-h-0 flex-1 overflow-hidden border-x border-t border-dashed border-deck-rule bg-deck-surface/40"><div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-background to-transparent" /><div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-background to-transparent" /><div className={cn("deckmo-visibility-ticker deckmo-visibility-ticker-slow px-4 transition-all duration-700 motion-reduce:transition-none", !revealed && "blur-[5px] opacity-20")}>{repeatedRows.map(group=><div key={group} className="space-y-3 py-3" aria-hidden={group>0||undefined}>{data.rows.map(row=><div key={`${group}-${row}`} className="flex min-h-[64px] items-center gap-3 border border-deck-rule bg-background px-4 py-3 opacity-70 shadow-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-deck-surface text-deck-muted"><ExternalLink className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1 text-sm font-semibold text-deck-muted">{row}</span><span className="shrink-0 text-xs italic text-deck-muted">{data.status}</span></div>)}</div>)}</div><div className={cn("pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 transition-all duration-700",revealed?"translate-y-3 opacity-0":"translate-y-0 opacity-100")}><p className="max-w-sm bg-background/90 px-6 py-4 text-center font-deck-serif text-xl text-deck-muted shadow-sm">{data.empty}</p></div></div></div>;
}

function SourceCard({ source, tone, align }: { source: typeof DECKMO.livingView.inside | typeof DECKMO.livingView.outside; tone: "blue" | "amber"; align: "left" | "right" }) {
  const t = TONES[tone];
  return <div className={cn("relative min-w-0 rounded-lg border bg-background p-6 shadow-[0_10px_30px_hsl(var(--deck-navy)/0.045)] transition-shadow duration-500 [@media(max-height:800px)]:p-5", t.border, align === "right" && "text-right")}><div className={cn("absolute top-0 h-1 w-14", t.dot, align === "left" ? "left-6" : "right-6")} /><p className={cn("break-words text-[10px] font-bold uppercase tracking-[0.16em]", t.text)}>{source.header}</p><h3 className="mt-3 break-words text-[clamp(16px,1.35vw,20px)] font-bold leading-snug text-foreground">{source.title}</h3><div className={cn("mt-5 flex min-w-0 flex-wrap gap-2 [@media(max-height:800px)]:mt-4", align === "right" && "justify-end")}>{source.chips.map(chip => <span key={chip} className={cn("max-w-full whitespace-normal break-words rounded-full border px-3 py-1.5 text-center text-[clamp(10px,0.8vw,12px)] font-semibold leading-tight", t.border, t.bg, t.text)}>{chip}</span>)}</div></div>;
}

function LivingView({ step }: SceneProps) {
  const d = DECKMO.livingView;
  const active = step > 0;
  return <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-8 py-8 xl:px-12 [@media(max-height:800px)]:py-4"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} /><div className="mt-8 grid min-h-0 flex-1 grid-cols-[minmax(190px,1fr)_clamp(40px,6vw,88px)_minmax(240px,300px)_clamp(40px,6vw,88px)_minmax(190px,1fr)] items-center [@media(max-height:800px)]:mt-5"><SourceCard source={d.inside} tone="blue" align="left" /><div className="relative h-px overflow-visible bg-blue-200"><div className={cn("absolute inset-y-0 left-0 bg-deck-blue transition-all duration-700 motion-reduce:transition-none", active ? "w-full" : "w-3/5")} /><span className={cn("deck-signal-left absolute -top-[3px] h-2 w-2 rounded-full bg-deck-blue shadow-[0_0_12px_hsl(var(--deck-blue)/0.65)]", !active && "opacity-75")} /><ChevronRight className="absolute -right-2.5 -top-2.5 h-5 w-5 text-deck-blue" /></div><div className="relative flex min-h-[310px] min-w-0 flex-col items-center justify-center text-center [@media(max-height:800px)]:min-h-[280px]"><div className={cn("absolute h-64 w-64 max-w-full rounded-full border bg-deck-surface/50 transition-all duration-700 motion-reduce:transition-none [@media(max-height:800px)]:h-56 [@media(max-height:800px)]:w-56", active ? "scale-100 border-deck-blue/25" : "scale-95 border-deck-blue/15")} /><div className="deck-breathe-ring absolute h-56 w-56 max-w-full rounded-full border border-deck-blue/45 motion-reduce:scale-100 motion-reduce:opacity-30 [@media(max-height:800px)]:h-48 [@media(max-height:800px)]:w-48"/><div className="deck-breathe-ring deck-breathe-ring-delayed absolute h-64 w-64 max-w-full rounded-full border border-deck-blue/30 motion-reduce:scale-100 motion-reduce:opacity-20 [@media(max-height:800px)]:h-56 [@media(max-height:800px)]:w-56"/><div className={cn("deck-node-breathe relative flex h-36 w-36 items-center justify-center rounded-full border bg-background transition-all duration-700 motion-reduce:transform-none [@media(max-height:800px)]:h-32 [@media(max-height:800px)]:w-32", active ? "border-deck-blue/70" : "border-deck-blue/35")}><div className="flex h-28 w-28 items-center justify-center rounded-full bg-deck-surface [@media(max-height:800px)]:h-24 [@media(max-height:800px)]:w-24"><UserRound className={cn("h-12 w-12 transition-colors duration-700", active ? "text-deck-blue" : "text-deck-muted")} /></div></div><p className={cn("relative mt-5 max-w-full break-words text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-700", active ? "text-deck-blue" : "text-deck-muted")}>{d.result.header}</p><p className="relative mt-2 max-w-[320px] break-words text-[clamp(18px,1.55vw,23px)] font-bold leading-tight text-foreground">{d.result.body}</p></div><div className="relative h-px overflow-visible bg-amber-200"><div className={cn("absolute inset-y-0 right-0 bg-deck-gold transition-all duration-700 motion-reduce:transition-none", active ? "w-full" : "w-3/5")} /><span className={cn("deck-signal-right absolute -top-[3px] h-2 w-2 rounded-full bg-deck-gold shadow-[0_0_12px_hsl(var(--deck-gold)/0.65)]", !active && "opacity-75")} /><ChevronRight className="absolute -left-2.5 -top-2.5 h-5 w-5 rotate-180 text-deck-gold" /></div><SourceCard source={d.outside} tone="amber" align="right" /></div></div>;
}

function SignalPill({ signal }: { signal: typeof DECKMO.ricky.signals[number] }) { const t=TONES[signal.tone]; return <div className={cn("rounded-lg border p-3",t.border,t.bg)}><div className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full",t.dot)}/><span className={cn("text-[10px] font-bold uppercase tracking-wider",t.text)}>{signal.family}</span></div><p className="mt-1 text-sm font-semibold text-slate-800">{signal.label}</p></div>; }

function Ricky({ step }: SceneProps) { const d=DECKMO.ricky; return <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-14"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><div className="mt-8 grid flex-1 grid-cols-[1fr_120px_1fr] items-center gap-6"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{step===0?d.rawLabel:d.signalLabel}</p><div className="mt-4 min-h-[350px]">{step===0?<div className="space-y-3">{d.raw.map(x=><div key={x} className="border-b border-slate-100 py-3 font-mono text-sm text-slate-400">{x}</div>)}</div>:<div className="grid grid-cols-2 gap-3">{d.signals.map((s,i)=><Reveal key={s.label} show delay={i*90}><SignalPill signal={s}/></Reveal>)}</div>}</div></div><div className="relative h-px bg-slate-200"><div className={cn("absolute inset-y-0 left-0 bg-blue-500 transition-all duration-700",step>0?"w-full":"w-0")}/><ChevronRight className="absolute -right-3 -top-3 h-6 w-6 text-blue-500"/></div><Reveal show={step>0}><div className="rounded-2xl border-2 border-blue-300 bg-white p-7 shadow-[0_0_28px_rgba(147,197,253,0.3)]"><UserRound className="h-9 w-9 text-blue-600"/><h3 className="mt-5 text-2xl font-bold text-slate-900">{d.profileTitle}</h3><p className="mt-3 text-base leading-relaxed text-slate-600">{d.profileBody}</p></div></Reveal></div></div>; }

function PhoneFrame({ title, children }: { title:string; children:React.ReactNode }) { return <div className="mx-auto flex h-[570px] w-[330px] flex-col overflow-hidden rounded-[30px] border-[8px] border-slate-300 bg-white shadow-2xl"><div className="flex h-7 shrink-0 items-center justify-center bg-white"><span className="h-2 w-2 rounded-full bg-slate-300"/></div><div className="flex items-center justify-between border-b border-slate-100 px-4 py-2"><span className="text-[9px] text-slate-400">{DECKMO.chrome.phoneTime}</span><span className="text-[11px] font-bold text-slate-700">{title}</span><span className="text-[9px] text-slate-400">{DECKMO.chrome.phoneMenu}</span></div><div className="min-h-0 flex-1 overflow-hidden">{children}</div><div className="flex h-7 shrink-0 items-center justify-center"><span className="h-1 w-24 rounded-full bg-slate-300"/></div></div>; }

function Callouts({ items, step }: { items: readonly string[] | readonly {title:string;body:string}[]; step:number }) { return <div className="space-y-3">{items.map((item,index)=>{const title=typeof item==="string"?item:item.title; const body=typeof item==="string"?null:item.body; return <Reveal key={title} show={step>=index}><div className={cn("rounded-xl border p-4 transition-colors",step===index?"border-blue-300 bg-blue-50":"border-slate-200 bg-white")}><div className="flex items-start gap-3"><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",step===index?"bg-blue-600 text-white":"bg-slate-100 text-slate-500")}>{index+1}</span><div><p className="text-sm font-bold text-slate-900">{title}</p>{body&&<p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>}</div></div></div></Reveal>})}</div>; }

function Immediate({step}:SceneProps){const d=DECKMO.immediate;return <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[1fr_370px_380px] items-center gap-10 px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><PhoneFrame title={d.phoneTitle}><div className="h-full overflow-y-auto px-3 py-3"><p className="mb-3 text-[10px] font-semibold text-slate-400">{d.account}</p>{d.transactions.map((tx,index)=><div key={tx.raw} className={cn("mb-2 rounded-xl border p-3 transition-all duration-500",step>=index?"border-blue-200 bg-blue-50/50":"border-slate-100 bg-white")}><p className={cn("font-mono text-[9px]",step>=index?"text-slate-400":"text-slate-600")}>{tx.raw}</p>{step>=index&&<Reveal show><p className="mt-1 text-[12px] font-bold text-slate-800">{tx.clean}</p><p className="mt-1 text-[9px] text-slate-500">{tx.meta}</p><span className="mt-2 inline-flex rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[8px] font-semibold text-blue-700">{tx.badge}</span></Reveal>}</div>)}{step>=3&&<div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 shadow-lg"><p className="text-[11px] font-bold text-slate-900">{d.explainer.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-500">{d.explainer.body}</p><div className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-center text-[9px] font-bold text-white">{d.explainer.action}</div></div>}</div></PhoneFrame><Callouts items={d.popups} step={step}/></div>}

function MidTerm({step}:SceneProps){const d=DECKMO.midTerm;return <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[1fr_370px_360px] items-center gap-10 px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><PhoneFrame title={d.phoneTitle}><div className="h-full overflow-y-auto p-3"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-[8px] font-bold tracking-wider text-blue-700">{d.topPick.label}</p><Plane className="mt-3 h-7 w-7 text-blue-600"/><p className="mt-2 text-base font-bold text-slate-900">{d.topPick.title}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-600">{d.topPick.body}</p><p className="mt-3 text-[10px] font-bold text-blue-700">{d.topPick.benefit}</p><p className="mt-3 rounded-lg bg-blue-600 py-2 text-center text-[9px] font-bold text-white">{d.topPick.action}</p></div>{step>=1&&<div className="mt-3 flex gap-1.5 overflow-hidden">{d.categories.map((c,i)=><span key={c} className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-semibold",i===0?"border-blue-200 bg-blue-50 text-blue-700":"border-slate-200 text-slate-500")}>{c}</span>)}</div>}{step>=2&&<div className="mt-3 space-y-2">{d.deals.map(x=><div key={x.title} className="rounded-lg border border-slate-200 bg-white p-2.5"><div className="flex justify-between gap-2"><p className="text-[10px] font-bold text-slate-800">{x.title}</p><span className="text-[8px] font-semibold text-blue-600">{x.family}</span></div><p className="mt-1 text-[9px] text-slate-500">{x.detail}</p></div>)}</div>}{step>=3&&<div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3"><Home className="h-5 w-5 text-amber-600"/><p className="mt-2 text-[11px] font-bold text-slate-900">{d.product.title}</p><p className="mt-1 text-[9px] text-slate-600">{d.product.body}</p><p className="mt-2 text-[11px] font-bold text-amber-700">{d.product.benefit}</p></div>}{step>=4&&<div className="mt-3 rounded-xl border border-slate-200 p-3"><p className="text-[10px] font-bold text-slate-900">{d.placement.title}</p><div className="mt-2 flex flex-wrap gap-1">{d.placement.channels.map(x=><span key={x} className="rounded bg-slate-100 px-2 py-1 text-[8px] text-slate-600">{x}</span>)}</div></div>}</div></PhoneFrame><Callouts items={d.popups} step={step}/></div>}

function LongTerm({step}:SceneProps){const d=DECKMO.longTerm;const stages=[d.event,d.advisor,d.outreach];return <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[1fr_370px_360px] items-center gap-10 px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><PhoneFrame title={d.phoneTitle}><div className="h-full p-4"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UserRound className="h-5 w-5"/></div><div><p className="text-[11px] font-bold text-slate-800">{d.phoneTitle}</p><p className="text-[9px] text-slate-500">{DECKMO.ricky.profileBody}</p></div></div><div className="mt-4 space-y-3">{stages.map((stage,index)=><Reveal key={stage.title} show={step>=index}><div className={cn("rounded-xl border p-3",index===0?"border-amber-200 bg-amber-50":index===1?"border-blue-200 bg-blue-50":"border-emerald-200 bg-emerald-50")}><p className="text-[8px] font-bold tracking-wider text-slate-500">{stage.label}</p><p className="mt-1 text-[12px] font-bold text-slate-900">{stage.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{stage.body}</p>{"action" in stage&&<p className="mt-2 rounded-lg bg-emerald-600 py-2 text-center text-[9px] font-bold text-white">{stage.action}</p>}</div></Reveal>)}</div></div></PhoneFrame><Callouts items={d.popups} step={step}/></div>}

function BrowserFrame({children}:{children:React.ReactNode}){return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl"><div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3"><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><div className="mx-auto h-5 w-1/2 rounded bg-white"/></div><div className="h-[510px] p-5">{children}</div></div>}

function BankTools({step}:SceneProps){const d=DECKMO.bankTools;const s=d.screens[step];return <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-12"><Header eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle}/><div className="mt-6 flex gap-2">{d.screens.map((screen,index)=><span key={screen.id} className={cn("rounded-full border px-4 py-2 text-xs font-bold",index===step?"border-blue-300 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-400")}>{screen.tab}</span>)}</div><div className="mt-4"><BrowserFrame><div className="grid h-full grid-cols-[280px_1fr] gap-6"><div className="border-r border-slate-200 pr-5"><p className="text-xs font-bold tracking-wider text-blue-600">{s.tab}</p><h3 className="mt-3 text-2xl font-bold text-slate-900">{s.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-500">{s.description}</p></div><BankToolContent step={step}/></div></BrowserFrame></div></div>}

function BankToolContent({step}:{step:number}){const s=DECKMO.bankTools.screens[step];if(s.id==="database")return <div className="grid grid-cols-5 gap-3 content-start">{s.families.map(f=>{const t=TONES[f.tone];return <div key={f.label} className={cn("rounded-lg border bg-white p-4",t.border)}><span className={cn("block h-1 w-8 rounded",t.dot)}/><p className="mt-5 text-sm font-bold text-slate-900">{f.label}</p><p className={cn("mt-2 text-3xl font-bold",t.text)}>{f.count}</p><p className="text-[10px] text-slate-400">{DECKMO.bankTools.screens[0].actions[0]}</p></div>})}<div className="col-span-5 mt-3 flex gap-3">{s.actions.map(a=><span key={a} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">{a}</span>)}</div></div>;if(s.id==="flows")return <div className="grid grid-cols-2 gap-4 content-start">{s.flows.map(flow=><div key={flow.name} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-600"/><p className="text-sm font-bold text-slate-900">{flow.name}</p></div><div className="mt-4 space-y-2">{flow.triggers.map(x=><div key={x} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><Target className="h-3.5 w-3.5 text-slate-400"/>{x}</div>)}</div></div>)}<div className="col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-4"><div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-rose-600"/><div><p className="text-[10px] font-bold tracking-wider text-rose-700">{s.guardrail.label}</p><p className="mt-1 text-sm font-bold text-slate-900">{s.guardrail.title}</p><p className="mt-1 text-xs text-slate-600">{s.guardrail.body}</p></div></div></div></div>;return <div className="grid grid-cols-[1fr_250px] gap-4"><div className="space-y-3">{s.inbox.map((mail,index)=><div key={mail.role} className={cn("rounded-xl border p-4",index===0?"border-blue-200 bg-blue-50":"border-slate-200 bg-white")}><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600"/><p className="text-xs font-bold text-slate-500">{mail.role}</p></div><p className="mt-2 text-sm font-bold text-slate-900">{mail.subject}</p><p className="mt-1 text-xs text-slate-500">{mail.preview}</p></div>)}</div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><Sparkles className="h-6 w-6 text-blue-600"/><p className="mt-4 text-sm font-bold text-slate-900">{s.reply}</p></div></div>}

function Close({step}:SceneProps){const d=DECKMO.close;return <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-12 text-center"><img src={ventusLogo} alt="Ventus AI" className="mb-10 h-8 w-auto object-contain"/><Eyebrow>{d.eyebrow}</Eyebrow><div className="mt-6 space-y-5">{d.lines.map((line,index)=><Reveal key={line} show={step>=index}><p className={cn("font-bold tracking-normal text-slate-950",index===2?"text-[clamp(42px,5vw,72px)] text-blue-600":"text-[clamp(25px,2.8vw,42px)]")}>{line}</p></Reveal>)}</div><Reveal show={step>=3} className="mt-10"><div className="flex justify-center gap-3">{d.outcomes.map(o=><span key={o} className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700">{o}</span>)}</div><div className="mt-8 flex items-center justify-center gap-5"><Button asChild><Link to={d.href}>{d.cta}<ArrowRight className="h-4 w-4"/></Link></Button><p className="text-sm font-semibold text-slate-500">{d.exhibit}</p></div></Reveal></div>}

const SCENES: Record<DeckmoBeatId,(props:SceneProps)=>React.ReactNode>={opener:Opener,visibility:Visibility,"living-view":LivingView,ricky:Ricky,immediate:BankdemoImmediate,"mid-term":BankdemoMidTerm,"segment-campaign":BankdemoSegmentCampaign,"long-term":BankdemoLongTerm,"bank-tools":BankdemoBankTools,close:Close};

export function DeckmoDeck(){const [globalStep,setGlobalStep]=useState(0);const [presenterOpen,setPresenterOpen]=useState(false);const scroller=useRef<HTMLDivElement>(null);const sectionRefs=useRef<(HTMLElement|null)[]>([]);const current=DECKMO_STEPS[globalStep];const activeBeat=DECKMO.beats[current.section];const slideNumber=String(globalStep+1).padStart(2,"0");const slideTotal=String(DECKMO_STEPS.length).padStart(2,"0");
const jump=useCallback((index:number)=>{const bounded=Math.max(0,Math.min(DECKMO_STEPS.length-1,index));setGlobalStep(bounded);const next=DECKMO_STEPS[bounded];sectionRefs.current[next.section]?.scrollIntoView({behavior:"smooth",block:"start"});},[]);
const firstStepBySection=useMemo(()=>DECKMO.beats.map((_,section)=>DECKMO_STEPS.findIndex(x=>x.section===section)),[]);
useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==="p"){e.preventDefault();setPresenterOpen(v=>!v);return}if(presenterOpen&&e.key==="Escape"){setPresenterOpen(false);return}if(["ArrowRight","ArrowDown"].includes(e.key)){e.preventDefault();jump(globalStep+1)}if(["ArrowLeft","ArrowUp"].includes(e.key)){e.preventDefault();jump(globalStep-1)}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[globalStep,jump,presenterOpen]);
useEffect(()=>{const root=scroller.current;if(!root)return;const observer=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const section=Number((visible.target as HTMLElement).dataset.section);if(Number.isFinite(section)&&section!==current.section)setGlobalStep(firstStepBySection[section]);},{root,threshold:[0.55,0.8]});sectionRefs.current.forEach(el=>el&&observer.observe(el));return()=>observer.disconnect()},[current.section,firstStepBySection]);
const handleCanvasClick=(e:React.MouseEvent)=>{const target=e.target as HTMLElement;if(target.closest("button,a,input,[role='dialog']"))return;jump(globalStep+1)};
return <div className="demo-page relative h-screen w-screen overflow-hidden bg-background font-deck text-foreground">
  <header className="absolute inset-x-0 top-0 z-40 flex h-20 items-center justify-between border-b border-deck-rule bg-background px-12">
    <div className="flex min-w-0 items-center gap-4"><img src={ventusLogo} alt="Ventus AI" className="h-7 w-auto shrink-0 object-contain"/><span className="h-6 w-px shrink-0 bg-deck-rule"/><span className="truncate font-deck-serif text-2xl text-deck-navy" aria-live="polite">{activeBeat.nav}</span></div>
     <div className="flex shrink-0 items-center gap-6 text-xs font-semibold uppercase tracking-wide text-deck-muted"><span>WWW.VENTUSAI.COM</span></div>
  </header>
  <div ref={scroller} onClick={handleCanvasClick} className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth">{DECKMO.beats.map((beat,section)=>{const Scene=SCENES[beat.id];const step=section===current.section?current.step:section<current.section?beat.steps-1:0;return <section key={beat.id} ref={el=>{sectionRefs.current[section]=el}} data-section={section} className="relative h-screen min-h-[700px] snap-start overflow-hidden bg-background pb-14 pt-20"><div className="h-full"><Scene step={step}/></div></section>})}</div>
  <footer className="absolute inset-x-0 bottom-0 z-40 flex h-14 items-center justify-between border-t border-deck-rule bg-background px-12">
    <div className="flex items-center gap-6"><div className="flex items-center gap-1.5"><Button variant="outline" size="icon" className="h-7 w-7 rounded-sm border-deck-rule text-deck-navy hover:bg-deck-surface" onClick={()=>jump(globalStep-1)} disabled={globalStep===0} aria-label={DECKMO.chrome.previous}><ArrowLeft className="h-3.5 w-3.5"/></Button><Button variant="outline" size="icon" className="h-7 w-7 rounded-sm border-deck-rule text-deck-navy hover:bg-deck-surface" onClick={()=>jump(globalStep+1)} disabled={globalStep===DECKMO_STEPS.length-1} aria-label={DECKMO.chrome.next}><ArrowRight className="h-3.5 w-3.5"/></Button></div><div className="text-[10px] font-medium uppercase text-deck-muted">Slide <span className="font-semibold text-deck-navy">{slideNumber}</span> / {slideTotal}</div></div>
    <div className="absolute inset-x-0 top-0 h-px bg-deck-surface"><div className="h-full bg-deck-blue transition-[width] duration-200 motion-reduce:transition-none" style={{width:`${((globalStep+1)/DECKMO_STEPS.length)*100}%`}}/></div>
    <div className="flex items-center gap-6"><span className="text-xs font-semibold uppercase tracking-wide text-deck-navy">Confidential</span><span className="h-6 w-px bg-deck-rule"/><Button variant="ghost" className="h-8 rounded-sm px-3 text-deck-navy hover:bg-deck-surface" onClick={()=>setPresenterOpen(true)} aria-label={DECKMO.chrome.presenterTitle}><Grid2X2 className="mr-2 h-3.5 w-3.5"/><span className="text-[10px] font-semibold uppercase">Presenter view</span></Button></div>
  </footer>
  {presenterOpen&&<div role="dialog" aria-modal="true" aria-label={DECKMO.chrome.presenterTitle} className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 p-10 backdrop-blur-sm" onClick={()=>setPresenterOpen(false)}><div className="w-full max-w-3xl rounded-sm border border-deck-rule bg-background p-8 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b border-deck-rule pb-5"><div><p className="font-deck-serif text-2xl text-deck-navy">{DECKMO.chrome.presenterTitle}</p><p className="mt-1 text-xs text-deck-muted">Select a section or press P to return to the presentation.</p></div><Button variant="ghost" size="icon" className="rounded-sm text-deck-navy" onClick={()=>setPresenterOpen(false)} aria-label={DECKMO.chrome.presenterClose}><X/></Button></div><div className="mt-6 grid grid-cols-2 gap-2">{DECKMO.beats.map((beat,index)=><Button key={beat.id} variant="outline" onClick={()=>{jump(firstStepBySection[index]);setPresenterOpen(false)}} className={cn("h-auto justify-start rounded-sm border-deck-rule p-4 text-left hover:bg-deck-surface",index===current.section&&"border-deck-blue bg-deck-surface")}><span className={cn("mr-4 flex h-7 w-7 items-center justify-center border border-deck-rule text-xs font-semibold text-deck-muted",index===current.section&&"border-deck-blue bg-deck-blue text-primary-foreground")}>{String(index+1).padStart(2,"0")}</span><span><span className="block text-sm font-semibold text-deck-navy">{beat.nav}</span><span className="mt-0.5 block text-[10px] font-normal uppercase text-deck-muted">{beat.steps} {DECKMO.chrome.stepUnit}</span></span></Button>)}</div></div></div>}
</div>}

export function DeckmoDesktopGuard({children}:{children:React.ReactNode}){const [desktop,setDesktop]=useState(()=>typeof window==="undefined"?true:window.innerWidth>=1024);useEffect(()=>{const check=()=>setDesktop(window.innerWidth>=1024);window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check)},[]);if(desktop)return <>{children}</>;return <div className="flex h-screen w-screen items-center justify-center bg-white px-6 font-sans"><div className="max-w-sm text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50"><Monitor className="h-8 w-8 text-blue-600"/></div><h1 className="mt-6 text-2xl font-bold text-slate-900">{DECKMO.chrome.desktopTitle}</h1><p className="mt-3 text-sm leading-relaxed text-slate-500">{DECKMO.chrome.desktopBody}</p><Button asChild className="mt-8"><Link to="/">{DECKMO.chrome.returnHome}</Link></Button></div></div>}
