import { useState } from "react";
import { ArrowLeftRight, Banknote, ChevronDown, CreditCard, FileText, Send, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RICKY_TRANSACTIONS } from "@/lib/deckmoRickyTransactions";
import { groupRickyTransactionsByRail, rawRailFields, type RickyRail } from "@/lib/deckmoRickyRailGroups";

const groups = groupRickyTransactionsByRail(RICKY_TRANSACTIONS);
const railDisplay: Record<RickyRail, { icon: LucideIcon; schema: string; tone: string }> = {
  Cards: { icon: CreditCard, schema: "Merchant descriptor · Card source · MCC", tone: "ricky-rail-cards" },
  ACH: { icon: ArrowLeftRight, schema: "ACH descriptor · Debit / credit · Identifier", tone: "ricky-rail-ach" },
  Checks: { icon: FileText, schema: "Check number · Payee", tone: "ricky-rail-checks" },
  Wire: { icon: Banknote, schema: "Wire descriptor · Reference", tone: "ricky-rail-wire" },
  Zelle: { icon: Send, schema: "Payment descriptor · Recipient / memo", tone: "ricky-rail-zelle" },
};

export function RickyRailAccordion() {
  const [openRail, setOpenRail] = useState<RickyRail | null>("Cards");
  return <div className="w-full" aria-label="Ricky transactions by payment rail">
    {groups.map(({ rail, examples }) => {
      const display = railDisplay[rail];
      const Icon = display.icon;
      const open = openRail === rail;
      return <div key={rail} className={cn("ricky-rail border-b border-deck-rule", display.tone)}>
        <Button variant="ghost" aria-expanded={open} aria-controls={`ricky-rail-${rail}`} onClick={() => setOpenRail(open ? null : rail)} className={cn("h-auto w-full justify-start gap-3 whitespace-normal rounded-none px-4 py-3.5 text-left hover:bg-deck-surface", open && "ricky-rail-header")}>
          <span className="ricky-rail-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border"><Icon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-deck-navy">{rail}</span><span className="mt-0.5 block text-[10px] font-medium leading-relaxed text-deck-muted">{display.schema}</span></span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-deck-muted transition-transform motion-reduce:transition-none", open && "rotate-180")} />
        </Button>
        <div id={`ricky-rail-${rail}`} hidden={!open} role="region" aria-label={`${rail} transaction examples`} className="bg-background">
          {examples.map((transaction) => <div key={transaction.id} className="border-t border-deck-rule px-4 py-3">
            <p className="mb-1 text-[9px] font-semibold uppercase text-deck-muted">{rail === "Cards" ? "Raw merchant descriptor" : "Raw descriptor"}</p>
            <p className="break-words font-mono text-[11px] font-semibold leading-relaxed text-deck-navy">{transaction.description}</p>
            <dl className="mt-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-x-3 gap-y-2">
              {rawRailFields(transaction).map((field) => <div key={field.label} className={cn("min-w-0", field.label === "Amount" && "col-start-4 row-start-1 text-right")}>
                <dt className="text-[9px] font-medium text-deck-muted">{field.label}</dt>
                <dd className="mt-0.5 break-words font-mono text-[10px] font-semibold tabular-nums text-deck-navy">{field.value}</dd>
              </div>)}
            </dl>
          </div>)}
        </div>
      </div>;
    })}
  </div>;
}