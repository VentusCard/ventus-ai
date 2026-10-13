import { Fragment, useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DECKMO, RICKY_SIGNAL_DETAILS, RICKY_SIGNAL_STORY } from "@/lib/deckmoScript";
import { RICKY_TRANSACTIONS } from "@/lib/deckmoRickyTransactions";
import { FINANCIAL_PAYMENT_LABELS, formatSignalMoney, signalAttributes, signalPaymentSummary } from "@/lib/deckmoSignalAttributes";
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
  const payments = selectedLabel && FINANCIAL_PAYMENT_LABELS.includes(selectedLabel) ? signalPaymentSummary(selectedLabel) : null;

  return <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-light pb-6" data-ricky-story>
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-deck-rule py-3">
      <h3 className="text-lg font-bold text-deck-navy">{DECKMO.ricky.profileTitle}</h3>
      <p className="text-xs font-semibold text-deck-muted">{DECKMO.ricky.profileFacts}</p>
    </div>
    <div aria-label="Ricky’s customer intelligence">
      {STORY_FAMILIES.map((entry) => <div key={entry.family} data-story-family={entry.family} className="ricky-story-row grid grid-cols-[160px_minmax(0,1fr)] border-b border-deck-rule last:border-b-0">
        <div className={cn("flex items-center gap-2.5 border-r border-deck-rule pr-4", `ricky-story-${entry.tone}`)}>
          <span className="ricky-story-dot h-2.5 w-2.5 shrink-0 rounded-full" />
          <span className="ricky-story-family-label text-xs font-bold uppercase">{entry.family}</span>
        </div>
        <p className="ricky-story-prose min-w-0 py-4 pl-7 text-[20px] font-medium leading-[2.2] text-deck-navy">
      {RICKY_SIGNAL_STORY.filter((clause) => DECKMO.ricky.signals.find((item) => item.label === clause.label)?.family === entry.family).map((clause, index) => {
        const item = DECKMO.ricky.signals.find((candidate) => candidate.label === clause.label);
        if (!item) return null;
        const selected = selectedLabel === item.label;
        return <Fragment key={item.label}>
          {index === 0 ? clause.before.replace(/^\.\s*/, "") : /^[,;.]/.test(clause.before) ? clause.before : ` ${clause.before}`}{" "}
           <Button type="button" variant="outline" aria-pressed={selected} aria-expanded={selected} aria-controls="ricky-story-detail" data-signal-label={item.label} data-signal-family={item.family} onClick={() => setSelectedLabel(selected ? null : item.label)} className={cn("ricky-story-pill inline-flex h-auto max-w-full flex-col items-start gap-1.5 whitespace-normal rounded-lg px-3 py-2 align-middle text-left text-[16px] font-semibold leading-snug shadow-none", `ricky-story-${item.tone}`, selected && "ring-2 ring-deck-navy ring-offset-2")}>
            <span className="flex max-w-full items-center gap-2"><span className="min-w-0">{item.label}</span>
            {item.source === "external" && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-current/30 px-1.5 py-0.5 text-[9px] font-bold uppercase"><Sparkles className="h-3 w-3" />Ext</span>}</span>
            <span data-signal-attributes className="flex max-w-full flex-wrap gap-1 text-[11px] font-medium leading-normal">{signalAttributes(item.label).map((attribute) => <span key={attribute} className="ricky-story-attribute rounded-full border px-2 py-0.5">{attribute}</span>)}</span>
          </Button>
        </Fragment>;
      })}.
        </p>
      </div>)}
    </div>
    {signal && detail && <section ref={detailRef} id="ricky-story-detail" aria-label={`${signal.label} details`} className={cn("ricky-story-detail ricky-story-evidence mt-5 animate-fade-in rounded-lg border bg-background p-5", `ricky-story-${signal.tone}`)}>
      <div className="flex items-start justify-between gap-4">
        <div><span className="text-[10px] font-bold uppercase text-deck-muted">{external ? "External" : "Internal ledger"}</span><h4 className="mt-1 text-lg font-bold text-deck-navy">{detail.summary}</h4></div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedLabel(null)} aria-label="Close signal details" title="Close signal details" className="shrink-0"><X className="h-4 w-4" /></Button>
      </div>
      <ul className="mt-3 grid gap-2 text-sm text-foreground sm:grid-cols-2">{detail.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
      <p className="mt-3 text-xs text-deck-muted">{detail.merchants.join(" · ")}</p>
      {payments && <div className="mt-4 border-t border-deck-rule pt-3" data-monthly-payments>
        <h5 className="text-sm font-semibold text-deck-navy">Observed monthly payments</h5>
        {signal?.label === "Amex Credit Cards" && <p className="mt-2 text-xs text-deck-muted">Annualized estimate: {formatSignalMoney(payments.totalCents)} observed across {payments.monthly.length} months ÷ {payments.monthly.length} × 12 = {formatSignalMoney(payments.annualizedCents)}/year. Not an actual full-year total.</p>}
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">{payments.monthly.map((row) => <div key={row.key} className="flex flex-wrap justify-between gap-x-2 border-b border-deck-rule py-1"><dt className="text-deck-muted">{row.month} {row.year}</dt><dd className="font-semibold tabular-nums text-deck-navy">{formatSignalMoney(row.cents)}</dd></div>)}</dl>
      </div>}
      {external ? <div className="mt-4 border-t border-deck-rule pt-3"><p className="text-sm text-foreground">{external.detail}</p><p className="mt-1 text-xs text-deck-muted">{external.provider} · {external.timing} · {external.confidence}</p></div> : <details className="mt-4 border-t border-deck-rule pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-deck-navy">Supporting transactions ({evidence.length})</summary>
        <div className="mt-3 max-h-56 overflow-y-auto scrollbar-light">
          {evidence.map((transaction) => <div key={transaction.id} className="grid grid-cols-[70px_minmax(0,1fr)_110px] items-start gap-3 border-b border-deck-rule py-2 font-mono text-xs text-foreground"><span>{transaction.date}</span><span className="min-w-0 break-words">{transaction.description}</span><span className="text-right tabular-nums">{transaction.amount}</span></div>)}
        </div>
      </details>}
    </section>}
  </div>;
}
