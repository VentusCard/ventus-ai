import { Fragment, useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DECKMO, RICKY_SIGNAL_DETAILS, RICKY_SIGNAL_STORY } from "@/lib/deckmoScript";
import { RICKY_TRANSACTIONS } from "@/lib/deckmoRickyTransactions";
import { cn } from "@/lib/utils";

/** Deck-only story; other Ricky scenes retain their existing ledger layout. */

/** Families in story order, one entry each, tones matching the pills. */
const STORY_FAMILIES: { family: string; tone: string }[] = [];
for (const item of DECKMO.ricky.signals) {
  if (!STORY_FAMILIES.some((entry) => entry.family === item.family)) STORY_FAMILIES.push({ family: item.family, tone: item.tone });
}

export function RickySignalStory() {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (selectedLabel) detailRef.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [selectedLabel]);
  const signal = DECKMO.ricky.signals.find((item) => item.label === selectedLabel);
  const detail = selectedLabel ? RICKY_SIGNAL_DETAILS[selectedLabel] : undefined;
  const external = signal && "externalEvidence" in signal ? signal.externalEvidence : null;
  const evidence = RICKY_TRANSACTIONS.filter((transaction) => transaction.signals.some((label) => label === selectedLabel));

  return <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-light pb-6" data-ricky-story>
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-deck-rule py-4">
      <h3 className="text-lg font-bold text-deck-navy">{DECKMO.ricky.profileTitle}</h3>
      <p className="text-xs font-semibold text-deck-muted">{DECKMO.ricky.profileFacts}</p>
    </div>
    <div className="grid min-h-0 grid-cols-[170px_minmax(0,1fr)] gap-x-8 [@media(max-height:800px)]:grid-cols-[130px_minmax(0,1fr)] [@media(max-height:800px)]:gap-x-6">
      <div className="flex min-h-0 flex-col justify-center gap-6 border-r border-deck-rule pr-4 [@media(max-height:800px)]:gap-4" aria-label="Signal families">
        {STORY_FAMILIES.map((entry) => <div key={entry.family} className={`ricky-story-${entry.tone} flex items-center gap-2.5`}>
          <span className="ricky-story-dot h-2.5 w-2.5 shrink-0 rounded-full [@media(max-height:800px)]:h-2 [@media(max-height:800px)]:w-2" />
          <span className="ricky-story-family-label text-[12px] font-bold uppercase tracking-[0.08em] [@media(max-height:800px)]:text-[11px]">{entry.family}</span>
        </div>)}
      </div>
      <div className="min-w-0">
    <p className="text-[22px] font-medium leading-[2.5] text-deck-navy [@media(max-height:800px)]:text-[20px]" aria-label="Ricky’s customer intelligence">
      {RICKY_SIGNAL_STORY.map((clause) => {
        const item = DECKMO.ricky.signals.find((candidate) => candidate.label === clause.label);
        if (!item) return null;
        const selected = selectedLabel === item.label;
        return <Fragment key={item.label}>
          {clause.before}{" "}
          <Button type="button" variant="outline" aria-pressed={selected} aria-expanded={selected} aria-controls="ricky-story-detail" onClick={() => setSelectedLabel(selected ? null : item.label)} className={cn("ricky-story-pill inline-flex h-auto max-w-full items-center gap-2 whitespace-normal rounded-full px-3.5 py-1.5 align-middle text-[18px] font-semibold leading-snug shadow-none [@media(max-height:800px)]:text-[16px]", `ricky-story-${item.tone}`, selected && "ring-2 ring-deck-navy ring-offset-2")}>
            <span>{item.label}</span>
            {item.source === "external" && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-current/30 px-1.5 py-0.5 text-[9px] font-bold uppercase"><Sparkles className="h-3 w-3" />Ext</span>}
          </Button>{" "}
        </Fragment>;
      })}.
    </p>
    {signal && detail && <section ref={detailRef} id="ricky-story-detail" aria-label={`${signal.label} details`} className={cn("ricky-story-detail mt-6 animate-fade-in rounded-lg border bg-background p-5", `ricky-story-${signal.tone}`)}>
      <div className="flex items-start justify-between gap-4">
        <div><span className="text-[10px] font-bold uppercase text-deck-muted">{external ? "External" : "Internal ledger"}</span><h4 className="mt-1 text-lg font-bold text-deck-navy">{detail.summary}</h4></div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedLabel(null)} aria-label="Close signal details" title="Close signal details" className="shrink-0"><X className="h-4 w-4" /></Button>
      </div>
      <ul className="mt-3 grid gap-2 text-sm text-foreground sm:grid-cols-2">{detail.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
      <p className="mt-3 text-xs text-deck-muted">{detail.merchants.join(" · ")}</p>
      {external ? <div className="mt-4 border-t border-deck-rule pt-3"><p className="text-sm text-foreground">{external.detail}</p><p className="mt-1 text-xs text-deck-muted">{external.provider} · {external.timing} · {external.confidence}</p></div> : <details className="mt-4 border-t border-deck-rule pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-deck-navy">Supporting transactions ({evidence.length})</summary>
        <div className="mt-3 max-h-56 overflow-y-auto scrollbar-light">
          {evidence.map((transaction) => <div key={transaction.id} className="grid grid-cols-[70px_minmax(0,1fr)_110px] items-start gap-3 border-b border-deck-rule py-2 font-mono text-xs text-foreground"><span>{transaction.date}</span><span className="min-w-0 break-words">{transaction.description}</span><span className="text-right tabular-nums">{transaction.amount}</span></div>)}
        </div>
      </details>}
    </section>}
  </div>;
}