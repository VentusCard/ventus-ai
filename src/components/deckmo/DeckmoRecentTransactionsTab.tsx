import { useState } from "react";
import {
  Banknote,
  Battery,
  Check,
  ChevronDown,
  CupSoda,
  Dumbbell,
  HandCoins,
  House,
  Landmark,
  ReceiptText,
  Trees,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DECKMO } from "@/lib/deckmoScript";

type Rail = (typeof DECKMO.immediate.activity)[number]["rail"];

const RAIL_TONES: Record<Rail, { chip: string; icon: string }> = {
  CARD: { chip: "border-blue-200 bg-blue-50 text-blue-700", icon: "bg-blue-100 text-blue-700" },
  ACH: { chip: "border-violet-200 bg-violet-50 text-violet-700", icon: "bg-violet-100 text-violet-700" },
  CHECK: { chip: "border-amber-200 bg-amber-50 text-amber-800", icon: "bg-amber-100 text-amber-800" },
  WIRE: { chip: "border-teal-200 bg-teal-50 text-teal-700", icon: "bg-teal-100 text-teal-700" },
  RTP: { chip: "border-cyan-200 bg-cyan-50 text-cyan-700", icon: "bg-cyan-100 text-cyan-700" },
  ATM: { chip: "border-slate-200 bg-slate-100 text-slate-700", icon: "bg-slate-100 text-slate-700" },
};

const PURCHASE_ICONS = {
  sports: Dumbbell,
  utilities: Zap,
  "shared-expense": HandCoins,
  cash: Banknote,
  landscaping: Trees,
  home: House,
  vending: CupSoda,
} as const;

export function DeckmoRecentTransactionsTab() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [confirmations, setConfirmations] = useState<Record<number, "yes" | "no">>({});
  const data = DECKMO.immediate;

  return (
    <div className="mx-auto h-[620px] w-[350px]">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[16px] border-[6px] border-slate-300 bg-background shadow-2xl">
        <div className="flex shrink-0 justify-center bg-background pb-0.5 pt-1">
          <div className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
        <div className="flex shrink-0 items-center justify-between bg-background px-5 py-1 text-[10px] font-medium text-slate-400">
          <span>9:41 AM</span>
          <span className="font-semibold text-[11px] text-slate-600">Our Bank · Ricky</span>
          <div className="flex items-center gap-1.5"><Wifi className="h-3 w-3" /><Battery className="h-3.5 w-3.5" /></div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background px-4 pb-4 pt-3 exec-light-scroll">
          <div className="flex items-end justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-500">{data.account}</p>
              <h3 className="mt-0.5 text-lg font-bold text-slate-950">{data.phoneTitle}</h3>
            </div>
            <span className="text-[9px] font-medium text-slate-400">Latest first</span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.activity.map((tx, index) => {
              const isOpen = expanded === index;
              const tone = RAIL_TONES[tx.rail];
              const PurchaseIcon = PURCHASE_ICONS[tx.icon];
              const isConfirm = tx.needsConfirmation === true;
              const confirmState = confirmations[index];
              const confirmed = confirmState === "yes";
              return (
                <div key={`${tx.rail}-${tx.raw}`} className="py-1">
                  <Button
                    variant="ghost"
                    aria-expanded={isOpen}
                    onClick={(event) => { event.stopPropagation(); setExpanded(isOpen ? null : index); }}
                    className="h-auto w-full rounded-md px-1.5 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", tone.icon)}>
                      <PurchaseIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="shrink-0 text-[9px] font-medium text-slate-400">{tx.date}</span>
                        <span className={cn("truncate text-[12px] font-bold text-slate-900", isConfirm && "text-[11.5px]")}>
                          {isConfirm && !confirmed ? `${tx.clean}?` : tx.clean}
                        </span>
                        <span className="ml-auto shrink-0 text-[11px] font-bold tabular-nums text-slate-900">{tx.amount}</span>
                      </span>
                      {isConfirm ? (
                        <span className="mt-0.5 flex items-center gap-1.5">
                          {confirmed ? (
                            <span className="flex shrink-0 items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1 py-px text-[7px] font-bold text-emerald-700"><Check className="h-2 w-2" />Confirmed</span>
                          ) : (
                            <span className="shrink-0 rounded border border-amber-300 bg-amber-50 px-1 py-px text-[7px] font-bold text-amber-700">Confirm</span>
                          )}
                          <span className={cn("shrink-0 rounded border px-1 py-px text-[7px] font-bold", tone.chip)}>{tx.rail}</span>
                        </span>
                      ) : (
                        <span className={cn("shrink-0 rounded border px-1 py-px text-[7px] font-bold", tone.chip)}>{tx.rail}</span>
                      )}
                      </span>
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-300 motion-reduce:transition-none", isOpen && "rotate-180")} />
                  </Button>

                  <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <div className="ml-12 mr-1 border-l-2 border-blue-200 pl-3 pb-2 pt-1">
                        <p className="text-[8px] font-bold uppercase text-slate-400">Original statement</p>
                        <p className="mt-0.5 font-mono text-[9px] text-slate-500 line-through decoration-slate-300">{tx.raw}</p>
                        {isConfirm && <p className="mt-1 text-[9px] text-slate-500">{tx.meta}</p>}
                        <p className="mt-2 text-[9px] font-semibold text-slate-700">{tx.pattern}</p>
                        <p className="mt-1 text-[9px] leading-relaxed text-slate-500">{tx.explanation}</p>
                        {isConfirm ? (
                          confirmState ? (
                            <p className="mt-2 text-[9px] font-semibold text-emerald-700">
                              {confirmed ? "Thanks — this transaction is now labeled." : "Thanks — we'll take another look."}
                            </p>
                          ) : (
                            <div className="mt-2 flex gap-1.5">
                              <Button size="sm" onClick={(event) => { event.stopPropagation(); setConfirmations((c) => ({ ...c, [index]: "yes" })); }} className="h-7 px-3 py-1 text-[9px]">Yes, that's right</Button>
                              <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); setConfirmations((c) => ({ ...c, [index]: "no" })); }} className="h-7 border-slate-200 bg-background px-3 py-1 text-[9px] text-slate-600">No, something else</Button>
                            </div>
                          )
                        ) : (
                          <Button size="sm" onClick={(event) => event.stopPropagation()} className="mt-2 h-7 px-3 py-1 text-[9px]">Yes, that's mine</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 border-t border-slate-200 bg-slate-50/80 px-2">
          <div className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-blue-600">
            <ReceiptText className="h-4 w-4" /><span className="text-[10px] font-semibold">Activity</span><div className="absolute left-1/4 right-1/4 top-0 h-0.5 rounded-full bg-blue-500" />
          </div>
          {["Rewards", "Membership", "AI"].map((label) => <div key={label} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-slate-400"><Landmark className="h-4 w-4" /><span className="text-[10px] font-semibold">{label}</span></div>)}
        </div>
      </div>
    </div>
  );
}