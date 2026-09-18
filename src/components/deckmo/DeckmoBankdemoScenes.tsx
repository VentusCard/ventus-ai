import { DECKMO } from "@/lib/deckmoScript";
import { DECKMO_BANKDEMO_FIXTURE } from "@/lib/deckmoBankdemoFixture";
import ExecDemoPhoneView, { type ConsumerTab } from "@/components/exec-demo/ExecDemoPhoneView";
import { AnalyticsContainer, type TabValue } from "@/components/tepilot/insights/AnalyticsContainer";
import { cn } from "@/lib/utils";

type SceneProps = { step: number };

function SceneHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="max-w-[520px]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 text-[clamp(34px,3.5vw,58px)] font-bold leading-[1.04] text-slate-950">{title}</h2>
      <p className="mt-4 text-[clamp(15px,1.2vw,19px)] leading-relaxed text-slate-600">{subtitle}</p>
    </header>
  );
}

function CalloutRail({ items, step }: { items: readonly string[] | readonly { title: string; body: string }[]; step: number }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const title = typeof item === "string" ? item : item.title;
        const body = typeof item === "string" ? null : item.body;
        return (
          <div key={title} className={cn("rounded-xl border p-4 transition-all duration-500", step >= index ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", step === index ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white")}>
            <div className="flex gap-3">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", step === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>{index + 1}</span>
              <div><p className="text-sm font-bold text-slate-900">{title}</p>{body && <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const phoneTabs: ConsumerTab[] = ["budget", "rewards", "relationship"];

function ExactPhone({ tab }: { tab: ConsumerTab }) {
  const fixture = DECKMO_BANKDEMO_FIXTURE;
  return (
    <div className="mx-auto origin-center scale-[0.9]">
      <ExecDemoPhoneView
        customer={fixture.customer}
        activeTab="analytics"
        phase="complete"
        showContent
        generatedOffers={fixture.offers}
        detectedLifeEvents={fixture.lifeEvents}
        productCards={fixture.productCards}
        enrichedTxs={fixture.enrichedTransactions}
        presentationMode
        presentationTab={tab}
        frame="compact"
      />
    </div>
  );
}

function PhoneScene({ step, data, tab }: SceneProps & { data: typeof DECKMO.immediate | typeof DECKMO.midTerm | typeof DECKMO.longTerm; tab: ConsumerTab }) {
  return (
    <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_380px_360px] items-center gap-10 px-12 py-12">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
      <ExactPhone tab={tab} />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoImmediate({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.immediate} tab={phoneTabs[0]} />;
}

export function BankdemoMidTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.midTerm} tab={phoneTabs[1]} />;
}

export function BankdemoLongTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.longTerm} tab={phoneTabs[2]} />;
}

const WORKSPACE_TABS: TabValue[] = ["ventus-ai", "targeting-automated-flows", "wm-copilot"];

function ExactWorkspace({ tab }: { tab: TabValue }) {
  return (
    <div className="h-[552px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl">
      <div className="h-[900px] w-[1440px] origin-top-left scale-[0.825]">
        <AnalyticsContainer key={tab} defaultTab={tab} presentationMode />
      </div>
    </div>
  );
}

export function BankdemoBankTools({ step }: SceneProps) {
  const data = DECKMO.bankTools;
  return (
    <div className="mx-auto flex h-full max-w-[1380px] flex-col justify-center px-12 py-8">
      <div className="flex items-end justify-between gap-8">
        <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mb-1 flex gap-2">
          {data.screens.map((item, index) => <span key={item.id} className={cn("rounded-full border px-4 py-2 text-[10px] font-bold", index === step ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400")}>{item.tab}</span>)}
        </div>
      </div>
      <div className="mt-5"><ExactWorkspace tab={WORKSPACE_TABS[step] ?? WORKSPACE_TABS[0]} /></div>
    </div>
  );
}
