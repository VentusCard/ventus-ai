import { BANK_TOOLS_BEAT_SCREENS as DECKMO_BEAT_SCREENS, DECKMO } from "@/lib/deckmoScript";
import { DECKMO_BANKDEMO_FIXTURE } from "@/lib/deckmoBankdemoFixture";
import ExecDemoPhoneView, { type ConsumerTab } from "@/components/exec-demo/ExecDemoPhoneView";
import { AnalyticsContainer, type TabValue } from "@/components/tepilot/insights/AnalyticsContainer";
import { cn } from "@/lib/utils";
import { PRODUCT_CATALOG } from "@/lib/campaignStudioData";
import { getProductVariants } from "@/lib/campaignCatalogVariants";
import { buildMessageCards } from "@/components/tepilot/campaigns/sections/buildMessageCards";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { DeckmoRecentTransactionsTab } from "./DeckmoRecentTransactionsTab";

type SceneProps = { step: number; active?: boolean };

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

function ExactPhone({ tab, cycleCollections = false }: { tab: ConsumerTab; cycleCollections?: boolean }) {
  const fixture = DECKMO_BANKDEMO_FIXTURE;
  return (
    <div className="mx-auto h-[840px] w-[462px] [@media(max-height:900px)]:h-[660px] [@media(max-height:900px)]:w-[364px] [@media(max-height:800px)]:!h-[540px] [@media(max-height:800px)]:!w-[300px]">
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
        firstTabLabel="Activity"
        batteryFull
        autoRotateCollections={cycleCollections}
      />
    </div>
  );
}

const HAWAII_PATTERN = /HAWAII|KAUAI|MAUI|WAILEA|WAIKOLOA|LUAU|HNL|KONA|HONOLULU|MOLOKINI|POIPU/i;
const HAWAII_ROWS = DECKMO_BANKDEMO_FIXTURE.enrichedTransactions.filter((t) => HAWAII_PATTERN.test(`${t.merchant_name} ${t.description ?? ""}`));
const hawaiiGroup = (mcc?: string) => (mcc === "7011" ? "Lodging" : mcc === "4511" || mcc === "3058" ? "Air Travel" : mcc === "5812" || mcc === "5814" ? "Dining" : "Experiences");
const HAWAII_SUBTOTALS = ["Lodging", "Air Travel", "Dining", "Experiences"].map((g) => {
  const rows = HAWAII_ROWS.filter((t) => hawaiiGroup(t.mcc) === g);
  return `- ${g}: $${Math.round(rows.reduce((s, t) => s + t.amount, 0)).toLocaleString("en-US")} (${[...new Set(rows.map((t) => t.merchant_name))].join(", ")})`;
});
const HAWAII_CHAT_CONTEXT = [
  "These are ALL purchases from the customer's last Hawaii trip (Dec 2025). Every one belongs to this single trip — include every one, never filter any out:",
  ...HAWAII_ROWS.map((t) => `- ${t.merchant_name} | $${t.amount.toFixed(2)} | ${hawaiiGroup(t.mcc)} | ${t.description ?? ""}`),
  "Use these EXACT category subtotals and merchants:",
  ...HAWAII_SUBTOTALS,
  `Use this EXACT grand total: $${Math.round(HAWAII_ROWS.reduce((s, t) => s + t.amount, 0)).toLocaleString("en-US")}.`,
  "When asked about Hawaii trip spending, group into exactly four categories: Lodging, Air Travel, Dining, and Experiences. Dining covers restaurants and meals (e.g. Beach House Restaurant, Mama's Fish House, Luau Kalamaku); Experiences covers tours and activities (e.g. Boss Frog Snorkel Tour). Show each category subtotal with its merchants as a full category in the main breakdown AND in the total — never as a footnote or side note. Then show the grand total.",
  "The answer's FIRST line must be exactly: Your Dec 2025 Hawaii trip spend breakdown: — no other opening text before it.",
  "Then format the rest for easy scanning: put each category on its own line as '**Category — $X,XXX** (merchant, merchant, merchant)' with the category name AND subtotal bold together, the merchant list in regular weight, and a blank line between each category line. End with '**Total: $X,XXX**' fully bold on its own line.",
  "Write merchant names in Title Case (e.g. Koa Kea Hotel Kauai, Mama's Fish House Maui, Hawaiian Airlines HNL — keep airport codes like HNL uppercase), never ALL CAPS.",
  "Do NOT include any follow-up action buttons for this question.",
].join("\n");

const HAWAII_CANNED: Record<string, string> = {
  [DECKMO.retention.openingPrompt]: [
    "Your Dec 2025 Hawaii trip spend breakdown:",
    "**Lodging — $7,420** (Hilton Waikoloa Village, Grand Wailea Resort, Koa Kea Hotel Kauai)",
    "**Air Travel — $2,705** (Hawaiian Airlines HNL)",
    "**Dining — $801** (Luau Kalamaku Kauai, Beach House Restaurant Kauai, Mama's Fish House Maui)",
    "**Experiences — $189** (Boss Frog Snorkel Tour)",
    "**Total: $11,115**",
  ].join("\n\n"),
};

function RetentionPhone({ active, showcase = false }: { active: boolean; showcase?: boolean }) {
  const fixture = DECKMO_BANKDEMO_FIXTURE;
  void active;
  const initialMessages = [
    { role: "user" as const, content: DECKMO.retention.openingPrompt },
    { role: "assistant" as const, content: HAWAII_CANNED[DECKMO.retention.openingPrompt] },
  ];
  return (
    <div className={cn("mx-auto", showcase ? "h-full aspect-[11/20]" : "h-[840px] w-[462px] [@media(max-height:900px)]:h-[660px] [@media(max-height:900px)]:w-[364px] [@media(max-height:800px)]:!h-[540px] [@media(max-height:800px)]:!w-[300px]")}>
      <ExecDemoPhoneView
        customer={fixture.customer}
        activeTab="relationship"
        phase="complete"
        showContent
        generatedOffers={fixture.offers}
        detectedLifeEvents={fixture.lifeEvents}
        productCards={fixture.productCards}
        enrichedTxs={fixture.enrichedTransactions}
        presentationMode={false}
        presentationTab="ai"
        frame="compact"
        firstTabLabel="Activity"
        batteryFull
        chatPersistKey="deckmo-retention"
        chatInitialMessages={initialMessages}
        chatSignalContext={HAWAII_CHAT_CONTEXT}
        hideQuickActions
        cannedAIAnswers={HAWAII_CANNED}
        relaxedAIAnswers
      />
    </div>
  );
}

type ShowcasePhone = (typeof DECKMO.retention.showcase.phones)[number];

function ShowcasePhone({ phone, index }: { phone: ShowcasePhone; index: number }) {
  const fixture = DECKMO_BANKDEMO_FIXTURE;
  const gridPosition = index < 3
    ? "row-start-1"
    : index === 3
      ? "col-start-2 row-start-2"
      : index === 4
        ? "col-start-4 row-start-2"
        : "col-start-6 row-start-2";
  const initialMessages = phone.initiator === "ai"
    ? [
        { role: "assistant" as const, content: phone.prompt },
        { role: "user" as const, content: phone.answer },
      ]
    : [
        { role: "user" as const, content: phone.prompt },
        { role: "assistant" as const, content: phone.answer },
      ];

  return (
    <div
      className={cn("deckmo-phone-roll-right col-span-2 flex min-w-0 flex-col", gridPosition)}
      style={{ "--deckmo-phone-delay": `${420 + index * 210}ms` } as React.CSSProperties}
    >
      <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">{phone.label}</p>
      <div className="mx-auto h-[clamp(230px,28vh,305px)] aspect-[11/20]">
        <ExecDemoPhoneView
          customer={fixture.customer}
          activeTab="relationship"
          phase="complete"
          showContent
          generatedOffers={fixture.offers}
          detectedLifeEvents={fixture.lifeEvents}
          productCards={fixture.productCards}
          enrichedTxs={fixture.enrichedTransactions}
          presentationMode={false}
          presentationTab="ai"
          frame="compact"
          firstTabLabel="Activity"
          batteryFull
          chatPersistKey={`deckmo-retention-${phone.id}`}
          chatInitialMessages={initialMessages}
          hideQuickActions
        />
      </div>
    </div>
  );
}

function RetentionShowcase() {
  const data = DECKMO.retention.showcase;
  const topPhones = data.phones.slice(0, 3);
  const bottomPhones = data.phones.slice(3);
  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col px-[clamp(24px,3vw,56px)] py-[clamp(12px,1.6vh,20px)]">
      <div className="flex shrink-0 items-end justify-between gap-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">{data.eyebrow}</p>
          <h2 className="mt-1.5 text-[clamp(25px,2.5vw,42px)] font-bold leading-tight text-slate-950">{data.title}</h2>
        </div>
        <p className="max-w-[650px] text-right text-[clamp(12px,1vw,16px)] leading-relaxed text-slate-600">{data.subtitle}</p>
      </div>
      <div className="mt-[clamp(8px,1vh,14px)] grid min-h-0 flex-1 grid-cols-8 grid-rows-2 items-start gap-x-[clamp(8px,1vw,18px)] gap-y-1">
        <div className="deckmo-retained-phone col-span-2 flex min-w-0 flex-col">
          <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">AI assistant</p>
          <div className="mx-auto h-[clamp(230px,28vh,305px)] aspect-[11/20]">
            <RetentionPhone active={false} showcase />
          </div>
        </div>
        {topPhones.map((phone, index) => <ShowcasePhone key={phone.id} phone={phone} index={index} />)}
        {bottomPhones.map((phone, index) => <ShowcasePhone key={phone.id} phone={phone} index={index + topPhones.length} />)}
      </div>
    </div>
  );
}

function PhoneScene({ step, data, tab }: SceneProps & { data: typeof DECKMO.immediate | typeof DECKMO.midTerm | typeof DECKMO.longTerm; tab: ConsumerTab }) {
  return (
    <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(240px,1fr)_480px_clamp(280px,23vw,460px)] items-center gap-[clamp(20px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-6">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
      <ExactPhone tab={tab} cycleCollections={tab === "rewards"} />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoImmediate({ step, active = true }: SceneProps) {
  const data = DECKMO.immediate;
  return (
    <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(240px,1fr)_480px_clamp(280px,23vw,460px)] items-center gap-[clamp(20px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-6">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
      <DeckmoRecentTransactionsTab step={step} active={active} />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoMidTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.midTerm} tab={phoneTabs[1]} />;
}

export function SegmentCampaignContent() {
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
    <div className="flex h-full flex-col px-10 py-8">
      <p className="shrink-0 text-xl font-semibold tracking-tight text-slate-900">{data.title}</p>
      <div className="mt-5 grid min-h-0 flex-1 grid-cols-[minmax(320px,380px)_minmax(0,1fr)] gap-10">
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

export function BankdemoRetention({ step, active = true }: SceneProps) {
  const data = DECKMO.retention;
  return (
    <div className="relative h-full">
      <div className={cn("mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(220px,1fr)_clamp(300px,30vw,480px)_clamp(250px,23vw,460px)] items-center gap-[clamp(16px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-6", step === 3 && "hidden")}>
        <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <RetentionPhone active={active && step < 3} />
        <CalloutRail items={data.popups} step={step} />
      </div>
      {step === 3 && <RetentionShowcase />}
    </div>
  );
}

const WORKSPACE_TABS: TabValue[] = ["ventus-ai", "targeting-automated-flows", "wm-copilot"];

// Flat beat index within the bank-tools slide -> workspace screen index.
const BANK_TOOLS_BEAT_SCREENS = DECKMO_BEAT_SCREENS;

function ExactWorkspace({ tab }: { tab: TabValue }) {
  return (
    <div className="mx-auto h-[552px] w-full max-w-[1188px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl [@media(max-width:1340px)]:max-w-[1110px]">
      <div className="h-[669px] w-[1440px] origin-top-left scale-[0.825] [@media(max-width:1340px)]:h-[717px] [@media(max-width:1340px)]:scale-[0.77]">
        <AnalyticsContainer key={tab} defaultTab={tab} presentationMode />
      </div>
    </div>
  );
}

function ActivationWorkspace() {
  return (
    <div className="mx-auto h-[552px] w-full max-w-[1188px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl [@media(max-width:1340px)]:max-w-[1110px]">
      <div className="h-[669px] w-[1440px] origin-top-left scale-[0.825] [@media(max-width:1340px)]:h-[717px] [@media(max-width:1340px)]:scale-[0.77]">
        <SegmentCampaignContent />
      </div>
    </div>
  );
}

export function BankdemoBankTools({ step }: SceneProps) {
  const data = DECKMO.bankTools;
  const screenIndex = BANK_TOOLS_BEAT_SCREENS[step] ?? 0;
  const showActivation = step === 2;
  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-8">
      <div className="flex items-end justify-between gap-8">
        <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />
        <div className="mb-1 flex gap-2">
          {data.screens.map((item, index) => <span key={item.id} className={cn("rounded-full border px-4 py-2 text-[10px] font-bold", index === screenIndex ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400")}>{item.tab}</span>)}
        </div>
      </div>
      <div className="mt-5">{showActivation ? <ActivationWorkspace /> : <ExactWorkspace tab={WORKSPACE_TABS[screenIndex] ?? WORKSPACE_TABS[0]} />}</div>
    </div>
  );
}
