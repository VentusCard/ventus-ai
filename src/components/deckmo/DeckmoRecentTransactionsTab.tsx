import { useState, type FormEvent } from "react";
import {
  Banknote,
  Battery,
  Check,
  ChevronLeft,
  CupSoda,
  Dumbbell,
  HandCoins,
  HelpCircle,
  House,
  Landmark,
  Briefcase,
  Music,
  ReceiptText,
  Sparkles,
  Trees,
  Tv,
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
  streaming: Tv,
  music: Music,
  business: Briefcase,
} as const;

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

export function DeckmoRecentTransactionsTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmations, setConfirmations] = useState<Record<number, "yes" | "no">>({});
  const [corrections, setCorrections] = useState<Record<number, string>>({});
  const [correctionOpen, setCorrectionOpen] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const data = DECKMO.immediate;
  const tx = selected === null ? null : data.activity[selected];

  const closeDetail = () => {
    setSelected(null);
    setCorrectionOpen(null);
    setDraft("");
  };

  const submitCorrection = (event: FormEvent, index: number, needsConfirm: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    const suggestion = draft.trim().slice(0, 80);
    if (!suggestion) return;
    setCorrections((c) => ({ ...c, [index]: suggestion }));
    if (needsConfirm) setConfirmations((c) => ({ ...c, [index]: "no" }));
    setCorrectionOpen(null);
    setDraft("");
  };

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

        <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
          {/* List screen */}
          <div
            className={cn(
              "absolute inset-0 overflow-y-auto px-4 pb-4 pt-3 exec-light-scroll transition-transform duration-300 motion-reduce:transition-none",
              tx ? "-translate-x-full" : "translate-x-0",
            )}
          >
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-500">{data.account}</p>
                <h3 className="mt-0.5 text-lg font-bold text-slate-950">{data.phoneTitle}</h3>
              </div>
              <span className="text-[9px] font-medium text-slate-400">Latest first</span>
            </div>

            <div className="divide-y divide-slate-100">
              {data.activity.map((row, index) => {
                const tone = RAIL_TONES[row.rail];
                const PurchaseIcon = PURCHASE_ICONS[row.icon];
                const isConfirm = row.needsConfirmation === true;
                const confirmed = confirmations[index] === "yes";
                const correction = corrections[index];
                return (
                  <div
                    key={`${row.rail}-${row.raw}`}
                    className={cn("rounded-md py-1", isConfirm && !confirmed && "border border-amber-200 bg-amber-50")}
                  >
                    <Button
                      variant="ghost"
                      onClick={(event) => { stop(event); setSelected(index); }}
                      className="h-auto w-full rounded-md px-1.5 py-1.5 text-left hover:bg-slate-50"
                    >
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", tone.icon)}>
                        <PurchaseIcon className="h-4 w-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="shrink-0 text-[9px] font-medium text-slate-400">{row.date}</span>
                        <span className="truncate text-[12px] font-bold text-slate-900">
                          {correction ? correction : isConfirm && !confirmed ? `${row.clean}?` : row.clean}
                        </span>
                        {correction && (
                          <span className="shrink-0 rounded border border-amber-200 bg-amber-50 px-1 py-px text-[7px] font-bold text-amber-800">Review</span>
                        )}
                        <span className="ml-auto shrink-0 text-[11px] font-bold tabular-nums text-slate-900">{row.amount}</span>
                        <span className={cn("shrink-0 rounded border px-1 py-px text-[7px] font-bold", tone.chip)}>{row.rail}</span>
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail screen */}
          <div
            className={cn(
              "absolute inset-0 overflow-y-auto bg-background exec-light-scroll transition-transform duration-300 motion-reduce:transition-none",
              tx ? "translate-x-0" : "translate-x-full",
            )}
            aria-hidden={!tx}
          >
            {tx && selected !== null && (() => {
              const tone = RAIL_TONES[tx.rail];
              const PurchaseIcon = PURCHASE_ICONS[tx.icon];
              const isConfirm = tx.needsConfirmation === true;
              const confirmState = confirmations[selected];
              const confirmed = confirmState === "yes";
              return (
                <div className="flex min-h-full flex-col">
                  <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-slate-200 bg-background/95 px-2 py-2 backdrop-blur">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => { stop(event); closeDetail(); }}
                      className="h-7 gap-0.5 px-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <span className="text-[11px] font-bold text-slate-900">Transaction</span>
                  </div>

                  <div className="px-4 pb-5 pt-4">
                    <div className="flex items-start gap-3">
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", tone.icon)}>
                        <PurchaseIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-bold leading-tight text-slate-950">
                          {isConfirm && !confirmed ? `${tx.clean}?` : tx.clean}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-slate-500">{tx.date}</span>
                          <span className={cn("rounded border px-1 py-px text-[7px] font-bold", tone.chip)}>{tx.rail}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-[15px] font-bold tabular-nums text-slate-900">{tx.amount}</span>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Details</p>
                      <dl className="mt-2 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-[9px] font-semibold text-slate-500">Original statement</dt>
                          <dd className="truncate font-mono text-[9px] text-slate-500 line-through decoration-slate-300">{tx.raw}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-[9px] font-semibold text-slate-500">Category</dt>
                          <dd className="text-right text-[9px] font-medium text-slate-700">{tx.meta}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-[9px] font-semibold text-slate-500">Payment rail</dt>
                          <dd className="text-[9px] font-medium text-slate-700">{tx.rail}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="text-[9px] font-semibold text-slate-500">Account</dt>
                          <dd className="text-[9px] font-medium text-slate-700">{data.account}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-3 rounded-lg border border-slate-200 p-3">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Checks</p>
                      <ul className="mt-2 space-y-1.5">
                        {(isConfirm && !confirmState
                          ? [
                              { ok: true, text: "Amount and date match your account activity." },
                              { ok: false, text: "Merchant name on the statement doesn't match the store location." },
                            ]
                          : [
                              { ok: true, text: "Merchant recognized and cleaned up." },
                              { ok: true, text: "Amount and date match your account activity." },
                              { ok: true, text: tx.pattern },
                            ]
                        ).map((check) => (
                          <li key={check.text} className="flex items-start gap-1.5">
                            {check.ok ? (
                              <Check className="mt-px h-3 w-3 shrink-0 text-emerald-600" />
                            ) : (
                              <HelpCircle className="mt-px h-3 w-3 shrink-0 text-amber-600" />
                            )}
                            <span className="text-[9px] leading-relaxed text-slate-600">{check.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-blue-600" />
                        <p className="text-[8px] font-bold uppercase tracking-wide text-blue-700">Suggestions</p>
                      </div>
                      <p className="mt-1.5 text-[9px] font-semibold text-slate-800">{tx.pattern}</p>
                      <p className="mt-1 text-[9px] leading-relaxed text-slate-600">{tx.explanation}</p>
                      {isConfirm && <p className="mt-1.5 text-[9px] leading-relaxed text-slate-600">{tx.meta}</p>}
                    </div>

                    <div className="mt-4">
                      {isConfirm ? (
                        confirmState ? (
                          <p className="text-[9px] font-semibold text-emerald-700">
                            {confirmed ? "Thanks — this transaction is now labeled." : "Thanks — we'll take another look."}
                          </p>
                        ) : (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={(event) => { stop(event); setConfirmations((c) => ({ ...c, [selected]: "yes" })); }}
                              className="h-7 px-3 py-1 text-[9px]"
                            >
                              Yes, that's right
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(event) => { stop(event); setConfirmations((c) => ({ ...c, [selected]: "no" })); }}
                              className="h-7 border-slate-200 bg-background px-3 py-1 text-[9px] text-slate-600"
                            >
                              No, something else
                            </Button>
                          </div>
                        )
                      ) : (
                        <Button size="sm" onClick={stop} className="h-7 px-3 py-1 text-[9px]">Yes, that's mine</Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
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
