import { useState } from "react";
import { ArrowLeftRight, Banknote, ChevronDown, CreditCard, FileText, Send, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RICKY_TRANSACTIONS } from "@/lib/deckmoRickyTransactions";
import { groupRickyTransactionsByRail, rawRailFields, type RickyRail } from "@/lib/deckmoRickyRailGroups";
import { RICKY_KYC_PROFILE } from "@/lib/deckmoScript";

const groups = groupRickyTransactionsByRail(RICKY_TRANSACTIONS);
const kycFields = [
  { label: "Name", value: RICKY_KYC_PROFILE.name },
  { label: "Customer ID", value: RICKY_KYC_PROFILE.customerId },
  { label: "Age", value: String(RICKY_KYC_PROFILE.age) },
  { label: "Location", value: RICKY_KYC_PROFILE.location },
  { label: "Est. household income", value: RICKY_KYC_PROFILE.estimatedHouseholdIncome },
  { label: "Relationship tier", value: RICKY_KYC_PROFILE.relationshipTier },
];
const railDisplay: Record<RickyRail, { icon: LucideIcon; schema: string; tone: string }> = {
  Cards: { icon: CreditCard, schema: "Merchant descriptor · Card source · MCC", tone: "ricky-rail-cards" },
  ACH: { icon: ArrowLeftRight, schema: "ACH descriptor · Debit / credit · Identifier", tone: "ricky-rail-ach" },
  Checks: { icon: FileText, schema: "Check number · Payee", tone: "ricky-rail-checks" },
  Wire: { icon: Banknote, schema: "Wire descriptor · Reference", tone: "ricky-rail-wire" },
  Zelle: { icon: Send, schema: "Payment descriptor · Recipient / memo", tone: "ricky-rail-zelle" },
};

const railColumns: Record<RickyRail, { label: string; width: string }[]> = {
  Cards: [{ label: "Date", width: "w-[76px]" }, { label: "Card source", width: "w-[102px]" }, { label: "Raw descriptor", width: "" }, { label: "MCC", width: "w-[48px]" }, { label: "Amount", width: "w-[108px]" }],
  ACH: [{ label: "Date", width: "w-[76px]" }, { label: "Raw descriptor", width: "" }, { label: "Direction", width: "w-[64px]" }, { label: "Identifier", width: "w-[84px]" }, { label: "Amount", width: "w-[108px]" }],
  Checks: [{ label: "Date", width: "w-[76px]" }, { label: "Check number", width: "w-[80px]" }, { label: "Raw descriptor", width: "" }, { label: "Amount", width: "w-[108px]" }],
  Wire: [{ label: "Date", width: "w-[76px]" }, { label: "Raw descriptor", width: "" }, { label: "Reference", width: "w-[108px]" }, { label: "Amount", width: "w-[108px]" }],
  Zelle: [{ label: "Date", width: "w-[76px]" }, { label: "Raw descriptor", width: "" }, { label: "Recipient / memo", width: "w-[116px]" }, { label: "Amount", width: "w-[108px]" }],
};

export function RickyRailAccordion() {
  const [openRail, setOpenRail] = useState<RickyRail | "KYC" | null>("Cards");
  const kycOpen = openRail === "KYC";
  return <div className="w-full" aria-label="Ricky customer profile and transactions by payment rail">
    <div className="ricky-rail border-b border-deck-rule">
      <Button variant="ghost" aria-expanded={kycOpen} aria-controls="ricky-kyc" onClick={() => setOpenRail(kycOpen ? null : "KYC")} className={cn("h-auto w-full justify-start gap-3 whitespace-normal rounded-none px-4 py-3.5 text-left hover:bg-deck-surface", kycOpen && "ricky-rail-header")}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-deck-rule text-deck-navy"><UserRound className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-deck-navy">KYC</span><span className="mt-0.5 block text-[10px] font-medium leading-relaxed text-deck-muted">Identity · Customer profile · Relationship tier</span></span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-deck-muted transition-transform motion-reduce:transition-none", kycOpen && "rotate-180")} />
      </Button>
      <div id="ricky-kyc" hidden={!kycOpen} role="region" aria-label="KYC customer profile" className="max-h-[clamp(150px,42vh,400px)] overflow-y-auto bg-background scrollbar-light">
        <table className="w-full table-fixed border-collapse text-left" aria-label="KYC customer profile">
          <colgroup><col className="w-[180px]" /><col /></colgroup>
          <thead className="border-t border-deck-rule bg-deck-surface"><tr><th scope="col" className="px-3 py-2 text-[9px] font-semibold text-deck-muted">Field</th><th scope="col" className="px-3 py-2 text-[9px] font-semibold text-deck-muted">Value</th></tr></thead>
          <tbody>{kycFields.map(({ label, value }) => <tr key={label} className="h-9 border-t border-deck-rule"><th scope="row" className="px-3 py-2 text-[10px] font-semibold text-deck-muted">{label}</th><td title={value} className="px-3 py-2 text-[10px] font-semibold text-deck-navy">{value}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
    {groups.map(({ rail, examples }) => {
      const display = railDisplay[rail];
      const Icon = display.icon;
      const open = openRail === rail;
      return <div key={rail} className={cn("ricky-rail border-b border-deck-rule", display.tone)}>
        <Button variant="ghost" aria-expanded={open} aria-controls={`ricky-rail-${rail}`} onClick={() => setOpenRail(open ? null : rail)} className={cn("h-auto w-full justify-start gap-3 whitespace-normal rounded-none px-4 py-3.5 text-left hover:bg-deck-surface", open && "ricky-rail-header")}>
          <span className="ricky-rail-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border"><Icon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-deck-navy">{rail}<span className="ml-2 text-[10px] font-semibold tabular-nums text-deck-muted">{examples.length} transactions</span></span><span className="mt-0.5 block text-[10px] font-medium leading-relaxed text-deck-muted">{display.schema}</span></span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-deck-muted transition-transform motion-reduce:transition-none", open && "rotate-180")} />
        </Button>
        <div id={`ricky-rail-${rail}`} hidden={!open} role="region" aria-label={`${rail} transactions`} className="max-h-[clamp(150px,42vh,400px)] overflow-y-auto bg-background scrollbar-light">
          <table className="w-full table-fixed border-collapse text-left" aria-label={`${rail} transactions`}>
            <colgroup>{railColumns[rail].map((column) => <col key={column.label} className={column.width} />)}</colgroup>
            <thead className="border-t border-deck-rule bg-deck-surface">
              <tr>{railColumns[rail].map((column) => <th key={column.label} scope="col" title={column.label} className={cn("truncate px-2 py-2 text-[9px] font-semibold text-deck-muted first:pl-3 last:pr-3", column.label === "Amount" && "text-right")}>{column.label}</th>)}</tr>
            </thead>
            <tbody>{examples.map((transaction) => {
              const fields = rawRailFields(transaction);
              return <tr key={transaction.id} className="h-9 border-t border-deck-rule">
                {railColumns[rail].map((column) => {
                  const value = column.label === "Raw descriptor" ? transaction.description : fields.find((field) => field.label === column.label)?.value ?? "—";
                  return <td key={column.label} title={value} className={cn("truncate whitespace-nowrap px-2 py-2 font-mono text-[10px] font-semibold tabular-nums text-deck-navy first:pl-3 last:pr-3", column.label === "Amount" && "text-right")}>{value}</td>;
                })}
              </tr>;
            })}</tbody>
          </table>
        </div>
      </div>;
    })}
  </div>;
}