import { Fragment, useEffect, useState } from "react";
import { Repeat, Sparkles, X } from "lucide-react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { DECKMO, RICKY_SIGNAL_DETAILS, RICKY_SIGNAL_STORY } from "@/lib/deckmoScript";
import { RICKY_TRANSACTIONS, type RickyTransaction } from "@/lib/deckmoRickyTransactions";
import { FINANCIAL_PAYMENT_LABELS, formatSignalMoney, signalInlineSegments, signalPaymentSummary } from "@/lib/deckmoSignalAttributes";
import { cn } from "@/lib/utils";
import { isOutsideClauseHidden, shouldRevealStoryRows, STORY_ENTRANCE_DELAY_MS } from "@/lib/deckmoStoryReveal";
import { enrichRickyTransaction } from "@/lib/deckmoRickyEnrichment";

/** Deck-only story; other Ricky scenes retain their existing ledger layout. */

/** Families in story order, one entry each, tones matching the pills. */
const STORY_FAMILIES: { family: string; tone: string }[] = [];
for (const item of DECKMO.ricky.signals) {
  if (!STORY_FAMILIES.some((entry) => entry.family === item.family)) STORY_FAMILIES.push({ family: item.family, tone: item.tone });
}

/** The clause that closes each family row, so its period can fade with an outside clause. */
const LAST_IN_FAMILY = new Set<string>();
for (const entry of STORY_FAMILIES) {
  const clauses = RICKY_SIGNAL_STORY.filter((clause) => DECKMO.ricky.signals.find((item) => item.label === clause.label)?.family === entry.family);
  const last = clauses[clauses.length - 1];
  if (last) LAST_IN_FAMILY.add(last.label);
}

/** revealStep: 0 = internal only, 1+ / undefined = everything shown. */
export function RickySignalStory({ revealStep, active = false }: { revealStep?: number; active?: boolean } = {}) {
  const externalShown = !isOutsideClauseHidden("external", revealStep);
  const revealRows = shouldRevealStoryRows(active, revealStep);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) setSelectedLabel(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => { setSelectedLabel(null); }, [revealStep]);

  const signal = DECKMO.ricky.signals.find((item) => item.label === selectedLabel);
  const detail = selectedLabel ? RICKY_SIGNAL_DETAILS[selectedLabel] : undefined;
  const external = signal && "externalEvidence" in signal ? signal.externalEvidence : null;
  const evidence = RICKY_TRANSACTIONS.filter((transaction) => transaction.signals.some((label) => label === selectedLabel));
  const payments = selectedLabel && FINANCIAL_PAYMENT_LABELS.includes(selectedLabel) ? signalPaymentSummary(selectedLabel) : null;

  function renderDetail() {
    if (!signal || !detail) return null;
    return <section id="ricky-story-detail" aria-label={`${signal.label} details`} >
      <header className="ricky-story-popover-head sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-deck-rule bg-background px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="ricky-story-family-label text-[10px] font-bold uppercase">{signal.family}</span><span className="ricky-story-popover-badge rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase text-deck-muted">{external ? "External signal" : "Internal ledger"}</span></div>
          <h4 className="mt-1.5 text-base font-bold leading-snug text-deck-navy">{signal.label}</h4>
          <p className="mt-1 text-sm text-foreground">{detail.summary}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedLabel(null)} aria-label="Close signal details" title="Close signal details" className="shrink-0"><X className="h-4 w-4" /></Button>
      </header>
      <div className="space-y-4 px-5 py-4">
        <div><h5 className="ricky-story-popover-heading text-[10px] font-bold uppercase text-deck-muted">Key details</h5><ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">{detail.facts.map((fact) => <li key={fact} className="rounded-md border border-deck-rule bg-muted/40 px-3 py-2">{fact}</li>)}</ul></div>
        {detail.merchants.length > 0 && <div><h5 className="ricky-story-popover-heading text-[10px] font-bold uppercase text-deck-muted">Merchants</h5><div className="mt-2 flex flex-wrap gap-1.5">{detail.merchants.map((merchant) => <span key={merchant} className="rounded-md border border-deck-rule bg-muted/40 px-2 py-0.5 text-xs font-semibold">{merchant}</span>)}</div></div>}
        {payments && <div data-monthly-payments>
          <h5 className="ricky-story-popover-heading text-[10px] font-bold uppercase text-deck-muted">Observed monthly payments</h5>
          {signal.label === "Amex Credit Cards" && <p className="mt-2 text-xs text-deck-muted">Annualized estimate: {formatSignalMoney(payments.totalCents)} observed across {payments.monthly.length} months ÷ {payments.monthly.length} × 12 = {formatSignalMoney(payments.annualizedCents)}/year. Not an actual full-year total.</p>}
          <dl className="mt-2 grid grid-cols-3 gap-x-5 gap-y-1 text-sm">{payments.monthly.map((row) => <div key={row.key} className="flex justify-between gap-2 border-b border-deck-rule py-1"><dt className="text-deck-muted">{row.month} {row.year}</dt><dd className="font-semibold tabular-nums text-deck-navy">{formatSignalMoney(row.cents)}</dd></div>)}</dl>
        </div>}
        {external ? <div className="rounded-lg border border-dashed border-deck-rule p-3"><h5 className="ricky-story-popover-heading flex items-center gap-1.5 text-[10px] font-bold uppercase text-deck-muted"><Sparkles className="h-3 w-3" />Outside evidence</h5><p className="mt-2 text-sm">{external.detail}</p><p className="mt-1 text-xs text-deck-muted">{external.provider} · {external.timing} · {external.confidence}</p></div>
        : <div data-enriched-transactions>
          <h5 className="ricky-story-popover-heading text-[10px] font-bold uppercase text-deck-muted">Supporting transactions · enriched ({evidence.length})</h5>
          <div className="mt-3 overflow-hidden rounded-lg border border-deck-rule">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[64px]" /><col className="w-[72px]" /><col /><col className="w-[96px]" /><col className="w-[260px]" /><col className="w-[140px]" /><col className="w-[170px]" /><col className="w-[96px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-deck-rule">
                  <th colSpan={4} className="ricky-story-table-group px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Raw Transaction <span className="font-normal normal-case tracking-normal">· as received from bank feed</span></th>
                  <th colSpan={4} className="ricky-story-table-group border-l-2 border-deck-rule px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Enriched output <span className="font-normal normal-case tracking-normal">· AI-labeled semantic intelligence</span></th>
                </tr>
                <tr className="ricky-story-table-cols border-b border-deck-rule text-[10px] font-semibold uppercase tracking-wider text-deck-muted">
                  <th className="px-3 py-2">Rail</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Amt</th>
                  <th className="border-l-2 border-deck-rule px-4 py-2">Merchant</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Subcategories</th>
                  <th className="px-3 py-2">Freq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deck-rule">{evidence.map((transaction) => <EnrichedRow key={transaction.id} transaction={transaction} merchants={detail.merchants} recurring={evidence.length >= 3} />)}</tbody>
            </table>
          </div>
        </div>}
      </div>
    </section>;
  }

  return <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-light pb-6" data-ricky-story>
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-deck-rule py-3">
      <h3 className="text-lg font-bold text-deck-navy">{DECKMO.ricky.profileTitle}</h3>
      <p className="text-xs font-semibold text-deck-muted">{DECKMO.ricky.profileFacts}</p>
    </div>
    <div aria-label="Ricky’s customer intelligence">
      {STORY_FAMILIES.map((entry, rowIndex) => <div key={entry.family} style={revealRows ? { animationDelay: `${STORY_ENTRANCE_DELAY_MS + rowIndex * 110}ms` } : undefined} data-story-family={entry.family} className={cn("ricky-story-row grid grid-cols-[160px_minmax(0,1fr)] border-b border-deck-rule last:border-b-0", revealRows && "ricky-story-reveal")}>
        <div className={cn("flex items-center gap-2.5 border-r border-deck-rule pr-4", `ricky-story-${entry.tone}`)}>
          <span className="ricky-story-dot h-2.5 w-2.5 shrink-0 rounded-full" />
          <span className="ricky-story-family-label text-xs font-bold uppercase">{entry.family}</span>
        </div>
        <p className="ricky-story-prose min-w-0 py-3 pl-7 text-[20px] font-medium leading-[1.9] text-deck-navy">
      {RICKY_SIGNAL_STORY.filter((clause) => DECKMO.ricky.signals.find((item) => item.label === clause.label)?.family === entry.family).map((clause, index) => {
        const item = DECKMO.ricky.signals.find((candidate) => candidate.label === clause.label);
        if (!item) return null;
        const selected = selectedLabel === item.label;
        return <Fragment key={item.label}>
          <span className="ricky-story-lead" data-revealed={item.source === "external" ? String(externalShown) : undefined}>{index === 0 ? clause.before.replace(/^\.\s*/, "") : /^[,;.]/.test(clause.before) ? clause.before : ` ${clause.before}`}</span>{" "}
           <Popover open={selected} onOpenChange={(open) => { if (!open) setSelectedLabel(null); }}>
          <PopoverAnchor asChild>
          <Button type="button" variant="outline" aria-label={item.label} aria-pressed={selected} aria-expanded={selected} data-signal-label={item.label} data-signal-family={item.family} data-signal-source={item.source} data-revealed={item.source === "external" ? String(externalShown) : undefined} tabIndex={item.source === "external" && !externalShown ? -1 : undefined} onClick={() => setSelectedLabel(selected ? null : item.label)} className={cn("ricky-story-pill inline h-auto max-w-full whitespace-normal rounded-lg px-2 py-1 align-baseline text-left text-[16px] font-semibold leading-[1.65] shadow-none", `ricky-story-${item.tone}`, selected && "ring-2 ring-deck-navy ring-offset-2")}>
            {item.source === "external" && <span className="mr-1.5 inline-flex items-center gap-1 align-middle text-[9px] font-bold uppercase"><Sparkles className="h-3 w-3" />Ext</span>}
            <span data-signal-attributes>{signalInlineSegments(item.label).map((segment, segmentIndex) => segment.kind === "attribute"
              ? <span key={segmentIndex} className="ricky-story-attribute" data-signal-attribute>{segment.text}</span>
              : <Fragment key={segmentIndex}>{segment.text}</Fragment>)}</span>
          </Button>
          </PopoverAnchor>
          {selected && <PopoverContent side="bottom" align="center" collisionPadding={24} onEscapeKeyDown={() => setSelectedLabel(null)} onInteractOutside={(event) => { const target = event.target as HTMLElement | null; if (target?.closest(`[data-signal-label="${CSS.escape(item.label)}"]`)) event.preventDefault(); }} className={cn("ricky-story-popover w-[min(1240px,calc(100vw-48px))] max-h-[min(72vh,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-contain scrollbar-light rounded-xl border bg-background p-0 text-foreground shadow-xl", `ricky-story-${item.tone}`)}>{renderDetail()}</PopoverContent>}
          </Popover>
          {LAST_IN_FAMILY.has(item.label) && <span className="ricky-story-lead" data-revealed={item.source === "external" ? String(externalShown) : undefined}>.</span>}
        </Fragment>;
      })}
        </p>
      </div>)}
    </div>
  </div>;
}

function cleanMerchant(transaction: RickyTransaction, merchants: string[]) {
  const raw = transaction.description.toLowerCase();
  const match = merchants.find((merchant) => merchant.toLowerCase().split(/[\s,]+/).some((word) => word.length > 3 && raw.includes(word)));
  if (match) return match;
  const words = transaction.description.replace(/^(ACH (DEBIT|CREDIT)|ZELLE (TO|FROM)|WIRE (IN|OUT)|CHECK)\s+/i, "").split(/\s+/).filter((word) => /^[A-Z&'.*]+$/i.test(word)).slice(0, 3);
  return words.map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ").replace(/\*.*$/, "") || transaction.description;
}

function EnrichedRow({ transaction, merchants, recurring }: { transaction: RickyTransaction; merchants: string[]; recurring: boolean }) {
  const inflow = !transaction.amount.startsWith("(");
  const enrichment = enrichRickyTransaction(transaction);
  const merchant = enrichment.merchant === "Unclassified" ? cleanMerchant(transaction, merchants) : enrichment.merchant;
  const category = enrichment.category === "General" && transaction.mccLabel ? transaction.mccLabel : enrichment.category;
  const subcategories = enrichment.subcategories.join(" · ");
  return <tr data-enriched-row>
    <td className="px-3 py-3 text-[11px] text-deck-muted truncate" title={transaction.source}>{transaction.source}</td>
    <td className="px-3 py-3 text-[11px] tabular-nums text-deck-muted whitespace-nowrap">{transaction.date}</td>
    <td className="px-3 py-3 font-mono text-[11px] text-deck-navy truncate" title={transaction.description}>{transaction.description}</td>
    <td className={cn("px-4 py-3 text-right text-[12px] font-semibold tabular-nums text-deck-navy whitespace-nowrap", inflow && "underline decoration-dotted")}>{transaction.amount}</td>
    <td className="border-l-2 border-deck-rule px-4 py-3 text-[12px] font-semibold leading-snug text-deck-navy line-clamp-2" title={merchant}>{merchant}</td>
    <td className="px-3 py-3 text-[11px] text-deck-muted truncate" title={category}>{category}</td>
    <td className="px-3 py-3 text-[11px] text-deck-muted truncate" title={subcategories}>{subcategories}</td>
    <td className="px-3 py-3 text-[11px] text-deck-muted whitespace-nowrap"><span className="inline-flex items-center gap-1">{recurring && <Repeat className="h-3 w-3" />}{recurring ? "Recurring" : "One-off"}</span></td>
  </tr>;
}
