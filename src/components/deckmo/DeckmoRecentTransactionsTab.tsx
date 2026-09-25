import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Banknote,
  BatteryFull,
  Bot,
  Check,
  ChevronLeft,
  CupSoda,
  Dumbbell,
  Gift,
  HandCoins,
  HelpCircle,
  House,
  Users,
  Briefcase,
  Music,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Trees,
  Tv,
  Undo2,
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

// Detail-screen type scale: larger by default, one step down on short viewports.
const T = {
  title: "text-[22px] [@media(max-height:900px)]:text-[17px] [@media(max-height:800px)]:text-[15px]",
  meta: "text-[13px] [@media(max-height:900px)]:text-[10px] [@media(max-height:800px)]:text-[9px]",
  chip: "text-[10px] [@media(max-height:900px)]:text-[8px] [@media(max-height:800px)]:text-[7.5px]",
  cardLabel: "text-[11px] [@media(max-height:900px)]:text-[9px] [@media(max-height:800px)]:text-[8px]",
  rowLabel: "text-[13px] [@media(max-height:900px)]:text-[10px] [@media(max-height:800px)]:text-[9px]",
  rowValue: "text-[13px] [@media(max-height:900px)]:text-[10.5px] [@media(max-height:800px)]:text-[9.5px]",
  mono: "text-[16px] [@media(max-height:900px)]:text-[12px] [@media(max-height:800px)]:text-[11px]",
  body: "text-[13px] [@media(max-height:900px)]:text-[10.5px] [@media(max-height:800px)]:text-[9.5px]",
  btn: "h-10 text-[13px] [@media(max-height:900px)]:h-8 [@media(max-height:900px)]:text-[10px] [@media(max-height:800px)]:h-7 [@media(max-height:800px)]:text-[9px]",
  // Compact spacing helpers for short viewports
  sectionGap: "mt-4 [@media(max-height:900px)]:mt-2 [@media(max-height:800px)]:mt-1",
  cardPad: "p-4 [@media(max-height:900px)]:p-2.5 [@media(max-height:800px)]:p-1.5",
  listGap: "mt-2.5 [@media(max-height:900px)]:mt-1.5 [@media(max-height:800px)]:mt-0.5",
  itemGap: "space-y-2 [@media(max-height:900px)]:space-y-1 [@media(max-height:800px)]:space-y-0.5",
};

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

// Bold the key insight sentence inside the plain explanation, preserving reading order.
const renderWithInsight = (text: string, insight?: string) => {
  if (!insight) return text;
  const index = text.indexOf(insight);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong className="font-bold text-slate-900">{text.slice(index, index + insight.length)}</strong>
      {text.slice(index + insight.length)}
    </>
  );
};

export function DeckmoRecentTransactionsTab({ step = 0, active = true }: { step?: number; active?: boolean }) {
  // undefined = follow the beat; number/null = explicit user choice (row tap / phone Back)
  const [override, setOverride] = useState<number | null | undefined>(undefined);
  const [confirmations, setConfirmations] = useState<Record<number, "yes" | "no">>({});
  const [corrections, setCorrections] = useState<Record<number, string>>({});
  const [correctionOpen, setCorrectionOpen] = useState<number | null>(null);
  const [supportChats, setSupportChats] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState("");
  const data = DECKMO.immediate;
  const jfkIndex = data.activity.findIndex((row) => row.needsConfirmation === true);
  const beatSelection = step >= 3 && jfkIndex >= 0 ? jfkIndex : null;
  const selected = override !== undefined ? override : beatSelection;
  const tx = selected === null ? null : data.activity[selected];

  const wasActive = useRef(active);
  useEffect(() => {
    // Re-arm beat-driven selection when the beat changes or the slide becomes active again
    // (e.g. arrowing back from slide 6 lands on beat 5.4 with the JFK detail open).
    const becameActive = active && !wasActive.current;
    wasActive.current = active;
    setOverride(undefined);
    if (beatSelection === null || becameActive) {
      setCorrectionOpen(null);
      setDraft("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, active]);

  const setSelected = (index: number | null) => setOverride(index);

  const closeDetail = () => {
    setOverride(null);
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
    <div className="mx-auto h-[840px] w-[462px] [@media(max-height:900px)]:h-[660px] [@media(max-height:900px)]:w-[364px] [@media(max-height:800px)]:!h-[540px] [@media(max-height:800px)]:!w-[300px]">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[16px] border-[6px] border-slate-300 bg-background shadow-2xl">
        <div className="flex shrink-0 justify-center bg-background pb-0.5 pt-1">
          <div className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
        <div className="flex shrink-0 items-center justify-between bg-background px-5 py-1 text-[10px] font-medium text-slate-400">
          <span>9:41 AM</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-[11px] text-slate-600">Our Bank · Ricky</span>
            <Wifi className="h-3 w-3" /><BatteryFull className="h-3.5 w-3.5 text-emerald-500" />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
          {/* List screen */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col overflow-hidden px-4 pb-3 pt-3 transition-transform duration-300 motion-reduce:transition-none",
              tx ? "-translate-x-full" : "translate-x-0",
            )}
          >
            <div className="flex shrink-0 items-end justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 [@media(max-height:800px)]:text-[10px]">{data.account}</p>
                <h3 className="mt-0.5 text-xl font-bold text-slate-950 [@media(max-height:800px)]:text-lg">{data.phoneTitle}</h3>
              </div>
              <span className="text-[10px] font-medium text-slate-400 [@media(max-height:800px)]:text-[9px]">Latest first</span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col divide-y divide-slate-100">
              {data.activity.map((row, index) => {
                const tone = RAIL_TONES[row.rail];
                const PurchaseIcon = PURCHASE_ICONS[row.icon];
                const isConfirm = row.needsConfirmation === true;
                const confirmed = confirmations[index] === "yes";
                const correction = corrections[index];
                return (
                  <div
                    key={`${row.rail}-${row.raw}`}
                    className={cn("flex min-h-0 flex-1 rounded-md", isConfirm && !confirmations[index] && "border border-amber-200 bg-amber-50")}
                  >
                    <Button
                      variant="ghost"
                      onClick={(event) => { stop(event); setSelected(index); }}
                      className="h-full min-h-0 w-full rounded-md px-1.5 py-2 text-left hover:bg-slate-50 [@media(max-height:800px)]:py-1"
                    >
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md [@media(max-height:800px)]:h-9 [@media(max-height:800px)]:w-9", tone.icon)}>
                        <PurchaseIcon className="h-5 w-5 [@media(max-height:800px)]:h-4 [@media(max-height:800px)]:w-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 items-center gap-2 [@media(max-height:800px)]:gap-1.5">
                        <span className="shrink-0 text-[11px] font-medium text-slate-400 [@media(max-height:800px)]:text-[9px]">{row.date}</span>
                        <span className="truncate text-[15px] font-bold text-slate-900 [@media(max-height:800px)]:text-[12px]">
                          {correction ? correction : isConfirm && !confirmed ? `${row.clean}?` : row.clean}
                        </span>
                        {"isSubscription" in row && row.isSubscription && (
                          <RefreshCw className="h-3.5 w-3.5 shrink-0 text-slate-400 [@media(max-height:800px)]:h-2.5 [@media(max-height:800px)]:w-2.5" />
                        )}
                        {correction && (
                          <span className="shrink-0 rounded border border-amber-200 bg-amber-50 px-1 py-px text-[7px] font-bold text-amber-800">Review</span>
                        )}
                        <span className="ml-auto shrink-0 text-[13px] font-bold tabular-nums text-slate-900 [@media(max-height:800px)]:text-[11px]">{row.amount}</span>
                        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold [@media(max-height:800px)]:px-1 [@media(max-height:800px)]:py-px [@media(max-height:800px)]:text-[7px]", tone.chip)}>{row.rail}</span>
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
              "absolute inset-0 bg-background transition-transform duration-300 motion-reduce:transition-none",
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
                <div className="relative h-full">
                  <div className="h-full overflow-y-auto exec-light-scroll">
                <div className="flex min-h-full flex-col">
                  <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-background/95 px-3 py-2.5 [@media(max-height:900px)]:py-1.5 [@media(max-height:800px)]:py-0.5 backdrop-blur">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => { stop(event); closeDetail(); }}
                      className={cn("h-9 gap-1 px-2 font-semibold text-slate-600 hover:bg-slate-50 [@media(max-height:900px)]:h-7", T.meta)}
                    >
                      <ChevronLeft className="h-5 w-5 [@media(max-height:900px)]:h-4 [@media(max-height:900px)]:w-4" /> Back
                    </Button>
                    <span className={cn("font-bold text-slate-900", T.meta)}>Transaction</span>
                  </div>

                  <div className="px-5 pb-5 pt-4 [@media(max-height:900px)]:px-3.5 [@media(max-height:900px)]:pb-3 [@media(max-height:900px)]:pt-2.5 [@media(max-height:800px)]:pb-1.5 [@media(max-height:800px)]:pt-1">
                    <div className="flex items-start gap-3.5 [@media(max-height:900px)]:gap-2.5">
                      <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-lg [@media(max-height:900px)]:h-11 [@media(max-height:900px)]:w-11 [@media(max-height:800px)]:h-8 [@media(max-height:800px)]:w-8", tone.icon)}>
                        <PurchaseIcon className="h-7 w-7 [@media(max-height:900px)]:h-5 [@media(max-height:900px)]:w-5 [@media(max-height:800px)]:h-4 [@media(max-height:800px)]:w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className={cn("font-bold leading-tight text-slate-950", T.title)}>
                          {isConfirm && !confirmed ? `${tx.clean}?` : tx.clean}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={cn("font-medium text-slate-500", T.meta)}>{tx.date}</span>
                          <span className={cn("rounded border px-1.5 py-0.5 font-bold", T.chip, tone.chip)}>{tx.rail}</span>
                        </div>
                      </div>
                      <span className={cn("shrink-0 font-bold tabular-nums text-slate-900", T.title)}>{tx.amount}</span>
                    </div>

                    <div className={cn("rounded-lg border border-slate-200 bg-slate-50/70", T.sectionGap, T.cardPad)}>
                      <p className={cn("font-bold uppercase tracking-wide text-slate-400", T.cardLabel)}>Details</p>
                      <dl className={cn(T.listGap, T.itemGap)}>
                        <div className="flex flex-col gap-0.5">
                          <dt className={cn("font-semibold text-slate-500", T.rowLabel)}>Original statement</dt>
                          <dd className={cn("break-all font-mono font-bold leading-snug text-slate-800", T.mono)}>{tx.raw}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className={cn("font-semibold text-slate-500", T.rowLabel)}>Category</dt>
                          <dd className={cn("text-right font-medium text-slate-700", T.rowValue)}>{tx.meta}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className={cn("font-semibold text-slate-500", T.rowLabel)}>Paid with</dt>
                          <dd className={cn("text-right font-medium text-slate-700", T.rowValue)}>{tx.rail}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className={cn("font-semibold text-slate-500", T.rowLabel)}>Account</dt>
                          <dd className={cn("text-right font-medium text-slate-700", T.rowValue)}>{data.account}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className={cn("rounded-lg border border-slate-200", T.sectionGap, "px-3 py-2.5 [@media(max-height:900px)]:px-2.5 [@media(max-height:900px)]:py-2 [@media(max-height:800px)]:px-2 [@media(max-height:800px)]:py-1.5")}>
                      <p className={cn("font-bold uppercase tracking-wide text-slate-400", T.cardLabel)}>Checks</p>
                      <ul className={cn("mt-1.5 [@media(max-height:900px)]:mt-1 [@media(max-height:800px)]:mt-0.5", "space-y-1 [@media(max-height:900px)]:space-y-0.5")}>
                        {(isConfirm && !confirmState
                          ? [
                              { ok: true, text: "Amount and date match your account activity." },
                              { ok: false, text: "Merchant name on the statement doesn't match the store location." },
                            ]
                          : [
                              { ok: true, text: "Merchant recognized and cleaned up." },
                              { ok: true, text: "Amount and date match your account activity." },
                            ]
                        ).map((check) => (
                          <li key={check.text} className="flex items-start gap-2">
                            {check.ok ? (
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 [@media(max-height:900px)]:h-3.5 [@media(max-height:900px)]:w-3.5" />
                            ) : (
                              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 [@media(max-height:900px)]:h-3.5 [@media(max-height:900px)]:w-3.5" />
                            )}
                            <span className={cn("leading-snug text-slate-600", T.body)}>{check.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={cn("rounded-lg border border-blue-200 bg-blue-50/60", T.sectionGap, T.cardPad)}>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-blue-600 [@media(max-height:900px)]:h-3.5 [@media(max-height:900px)]:w-3.5" />
                        <p className={cn("font-bold uppercase tracking-wide text-blue-700", T.cardLabel)}>OUR BANK INSIGHTS</p>
                      </div>
                      <p className={cn("mt-1 font-semibold text-slate-800", T.body)}>{tx.pattern}</p>
                      <p className={cn("mt-1 leading-snug text-slate-600", T.body)}>
                        {renderWithInsight(tx.explanation, "insight" in tx ? tx.insight : undefined)}
                      </p>
                      {isConfirm && "suggestionPrompt" in tx && (
                        <p className={cn("mt-1 leading-snug text-slate-600", T.body)}>{tx.suggestionPrompt}</p>
                      )}
                    </div>

                    <div className="mt-4 [@media(max-height:900px)]:mt-3 [@media(max-height:800px)]:mt-1">
                      {corrections[selected] || confirmState || supportChats[selected] ? (
                        <div className="flex items-center gap-2">
                          <p className={cn("font-semibold text-emerald-700", T.body)}>
                            {corrections[selected]
                              ? "Thanks — we'll review your suggestion."
                              : confirmed
                                ? "Thanks — this transaction is now labeled."
                                : supportChats[selected]
                                  ? "Thanks — we've connected you with customer service."
                                  : "Thanks — we'll take another look."}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              stop(event);
                              setConfirmations((c) => {
                                const next = { ...c };
                                delete next[selected];
                                return next;
                              });
                              setCorrections((c) => {
                                const next = { ...c };
                                delete next[selected];
                                return next;
                              });
                              setSupportChats((c) => {
                                const next = { ...c };
                                delete next[selected];
                                return next;
                              });
                              setCorrectionOpen(null);
                              setDraft("");
                            }}
                            className={cn("ml-auto gap-1.5 border-slate-200 bg-background px-3 py-1 text-slate-600", T.btn)}
                          >
                            <Undo2 className="h-4 w-4" /> Undo
                          </Button>
                        </div>
                      ) : correctionOpen !== selected && (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            onClick={(event) => {
                              stop(event);
                              setConfirmations((c) => ({ ...c, [selected]: "yes" }));
                              setCorrectionOpen(null);
                              setDraft("");
                            }}
                            className={cn("px-3 py-1", T.btn)}
                          >
                            {isConfirm ? "Yes, that's right" : "Looks Good"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(event) => { stop(event); setCorrectionOpen(selected); }}
                            className={cn("border-slate-200 bg-background px-3 py-1 text-slate-600", T.btn)}
                          >
                            No, that's not right
                          </Button>
                        </div>
                      )}
                    </div>

                    {correctionOpen === selected && !corrections[selected] && (
                      <form
                        onSubmit={(event) => submitCorrection(event, selected, isConfirm)}
                        onClick={stop}
                        className="absolute inset-x-0 bottom-0 z-20 rounded-t-xl border-t border-slate-200 bg-background/95 p-2.5 shadow-[0_-10px_30px_rgba(15,23,42,0.10)] backdrop-blur"
                      >
                        <label className={cn("font-bold uppercase tracking-wide text-slate-500", T.cardLabel)} htmlFor="correction-input">
                          What should this be?
                        </label>
                        <input
                          id="correction-input"
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          maxLength={80}
                          placeholder="e.g. JFK Vending Machine"
                          className={cn(
                            "mt-1 w-full rounded-md border border-slate-200 bg-background px-2 py-1 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500",
                            T.rowValue,
                          )}
                        />
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <Button type="submit" size="sm" disabled={!draft.trim()} className={cn("flex-1 px-2 py-1", T.btn)}>
                            Send suggestion
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              stop(event);
                              setSupportChats((c) => ({ ...c, [selected]: true }));
                              setDraft("");
                              setCorrectionOpen(null);
                            }}
                            className={cn("flex-1 border-slate-200 bg-background px-2 py-1 text-slate-600", T.btn)}
                          >
                            Chat with support
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              stop(event);
                              setConfirmations((c) => ({ ...c, [selected]: "yes" }));
                              setCorrectionOpen(null);
                              setDraft("");
                            }}
                            className={cn("flex-1 border-slate-200 bg-background px-2 py-1 text-slate-600", T.btn)}
                          >
                            {isConfirm ? "Yes, that's right" : "Looks Good"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                  </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex shrink-0 border-t border-slate-200 bg-slate-50/80 px-2">
          <div className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[#0ea5e9]">
            <ReceiptText className="h-4 w-4" /><span className="text-[10px] font-semibold">Activity</span><div className="absolute left-1/4 right-1/4 top-0 h-0.5 rounded-full bg-[#0ea5e9]" />
          </div>
          {[{ label: "Rewards", Icon: Gift }, { label: "Membership", Icon: Users }, { label: "AI", Icon: Bot }].map(({ label, Icon }) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[#94a3b8]"><Icon className="h-4 w-4" /><span className="text-[10px] font-semibold">{label}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
