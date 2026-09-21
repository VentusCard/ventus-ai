import { DECKMO } from "@/lib/deckmoScript";
import { DECKMO_BANKDEMO_FIXTURE } from "@/lib/deckmoBankdemoFixture";
import ExecDemoPhoneView, { type ConsumerTab } from "@/components/exec-demo/ExecDemoPhoneView";
import { AnalyticsContainer, type TabValue } from "@/components/tepilot/insights/AnalyticsContainer";
import { cn } from "@/lib/utils";
import { PRODUCT_CATALOG } from "@/lib/campaignStudioData";
import { getProductVariants } from "@/lib/campaignCatalogVariants";
import { buildMessageCards } from "@/components/tepilot/campaigns/sections/buildMessageCards";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import tennisAsset from "@/assets/deckmo-tennis.jpg.asset.json";
import { DeckmoRecentTransactionsTab } from "./DeckmoRecentTransactionsTab";

type SceneProps = { step: number };

function SceneHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="min-w-0 max-w-[680px]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-[clamp(30px,3.1vw,52px)] font-bold leading-[1.05] text-slate-950">{title}</h2>
      <p className="mt-4 text-pretty text-[clamp(15px,1.15vw,19px)] leading-relaxed text-slate-600">{subtitle}</p>
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
    <div className="mx-auto h-[620px] w-[350px]">
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
        presentationImageUrl={tennisAsset.url}
        frame="compact"
      />
    </div>
  );
}

function PhoneScene({ step, data, tab }: SceneProps & { data: typeof DECKMO.immediate | typeof DECKMO.midTerm | typeof DECKMO.longTerm; tab: ConsumerTab }) {
  return (
    <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(240px,1fr)_360px_clamp(280px,23vw,460px)] items-center gap-[clamp(20px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-10">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
      <ExactPhone tab={tab} />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoImmediate({ step }: SceneProps) {
  const data = DECKMO.immediate;
  return (
    <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(240px,1fr)_360px_clamp(280px,23vw,460px)] items-center gap-[clamp(20px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-10">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
      <DeckmoRecentTransactionsTab />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoMidTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.midTerm} tab={phoneTabs[1]} />;
}

export function BankdemoSegmentCampaign() {
  const data = DECKMO.segmentCampaign;
  const product = PRODUCT_CATALOG.find((item) => item.name === data.productLabel);
  const variants = product ? getProductVariants(product) : undefined;
  const campaign = product && variants
    ? buildMessageCards(product, variants).find((card) => card.anchor === "Everyday foodie (budget tier)")
    : undefined;

  if (!product || !variants || !campaign) return null;

  const reach = campaign.estimatedReach;
  const reachLabel = reach ? `~${(reach / 1_000).toFixed(1)}K` : "Qualified";

  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-8 [@media(max-height:800px)]:origin-top [@media(max-height:800px)]:scale-[0.78]">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

      <div className="mt-7 grid min-h-0 flex-1 grid-cols-[minmax(320px,380px)_minmax(0,1fr)] gap-10">
        <div className="flex flex-col justify-center border-r border-deck-rule pr-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-deck-muted">From intelligence to activation</p>
          <div className="mt-5 space-y-2">
            {data.stages.map((stage, index) => (
              <div key={stage.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-deck-rule bg-deck-surface text-sm font-semibold text-deck-navy">0{index + 1}</div>
                <div className="min-w-0 flex-1 border-b border-deck-rule py-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-deck-muted">{stage.label}</p>
                  <p className="mt-1 text-sm font-semibold text-deck-navy">{stage.value}</p>
                </div>
                {index < data.stages.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-blue-500" />}
              </div>
            ))}
          </div>
          <div className="mt-6 border-l-2 border-blue-500 bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">Product</p>
            <p className="mt-1 text-lg font-semibold text-deck-navy">{product.name}</p>
            <p className="mt-1 text-xs text-deck-muted">{variants.total.toLocaleString()} possible micro-segments</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">3</span>
              <p className="text-sm font-semibold text-slate-900">{data.outputLabel}</p>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Spending behavior
              </span>
            </div>

            <div className="mt-5 grid grid-cols-[170px_1fr] gap-5">
              <div className="flex flex-col rounded-lg border border-l-4 border-slate-200 border-l-blue-400 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Micro-segments</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums text-slate-900">{variants.total.toLocaleString()}</p>
                <div className="mt-auto border-t border-slate-100 pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Featured segment</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-slate-800">Everyday foodie</p>
                  <div className="mt-3 flex items-center gap-1.5 text-slate-700">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm font-semibold tabular-nums">{reachLabel}</span>
                    <span className="text-[10px] text-slate-500">customers</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-l-4 border-slate-200 border-l-blue-400 bg-white p-5 shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{campaign.play}</span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{campaign.anchor}</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700"><Users className="h-3 w-3 text-slate-400" />{reachLabel} reach</span>
                </div>
                <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Subject</p>
                  <p className="mt-1 text-xl font-semibold leading-snug text-slate-900">{campaign.subject}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700">{campaign.body}</p>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <span className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">{campaign.cta}</span>
                  <div className="flex max-w-[360px] items-start gap-2 text-right">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <p className="text-[10px] leading-snug text-slate-500">{campaign.why}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BankdemoLongTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.longTerm} tab={phoneTabs[2]} />;
}

const WORKSPACE_TABS: TabValue[] = ["ventus-ai", "targeting-automated-flows", "wm-copilot"];

function ExactWorkspace({ tab }: { tab: TabValue }) {
  return (
    <div className="mx-auto h-[552px] w-full max-w-[1188px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl [@media(max-width:1340px)]:max-w-[1110px]">
      <div className="h-[900px] w-[1440px] origin-top-left scale-[0.825] [@media(max-width:1340px)]:scale-[0.77]">
        <AnalyticsContainer key={tab} defaultTab={tab} presentationMode />
      </div>
    </div>
  );
}

export function BankdemoBankTools({ step }: SceneProps) {
  const data = DECKMO.bankTools;
  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-8">
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
