import { useEffect, useState } from "react";
import { BANK_TOOLS_BEAT_SCREENS as DECKMO_BEAT_SCREENS, DECKMO } from "@/lib/deckmoScript";
import { DECKMO_BANKDEMO_FIXTURE } from "@/lib/deckmoBankdemoFixture";
import ExecDemoPhoneView, { type ConsumerTab } from "@/components/exec-demo/ExecDemoPhoneView";
import { AnalyticsContainer, type TabValue } from "@/components/tepilot/insights/AnalyticsContainer";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { DeckmoRecentTransactionsTab } from "./DeckmoRecentTransactionsTab";

type SceneProps = { step: number; active?: boolean };

type SceneValue = { metric: string; label: string };

function SceneValueBlock({ value, compact = false }: { value: SceneValue; compact?: boolean }) {
  if (compact) {
    return (
      <div className="mt-2 inline-flex flex-nowrap items-baseline gap-x-3 gap-y-0 border-l-2 border-blue-500 bg-blue-50 px-3 py-2">
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">Value for the bank</p>
        <p className="shrink-0 font-bold tabular-nums text-lg text-deck-navy">{value.metric}</p>
        <p className="whitespace-nowrap font-semibold text-xs text-slate-700">{value.label}</p>
      </div>
    );
  }
  return (
    <div className="inline-block border-l-2 border-blue-500 bg-blue-50 px-4 py-3 mt-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">Value for the bank</p>
      <p className="mt-1 font-bold tabular-nums text-2xl text-deck-navy">{value.metric}</p>
      <p className="font-semibold text-sm text-slate-700">{value.label}</p>
    </div>
  );
}

function SceneHeader({ eyebrow, title, subtitle, highlight, value, wide = false }: { eyebrow: string; title: string; subtitle: string; highlight?: string; value?: SceneValue; wide?: boolean }) {
  const subtitleParts = highlight && subtitle.includes(highlight)
    ? [subtitle.slice(0, subtitle.indexOf(highlight)), highlight, subtitle.slice(subtitle.indexOf(highlight) + highlight.length)]
    : null;
  return (
    <header className={cn("min-w-0", wide ? "max-w-[900px]" : "max-w-[680px]")}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 whitespace-pre-line text-[clamp(30px,3.1vw,52px)] font-bold leading-[1.05] text-slate-950">{title}</h2>
      <p className="mt-4 text-pretty text-[clamp(15px,1.15vw,19px)] leading-relaxed text-slate-600">
        {subtitleParts ? (<>{subtitleParts[0]}<span className="font-bold text-blue-600">{subtitleParts[1]}</span>{subtitleParts[2]}</>) : subtitle}
      </p>
      {value && <SceneValueBlock value={value} />}
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

const HOLIDAY_TRAVEL_ROLLUP = "Annual tropical vacation in December";

function ExactPhone({ tab, cycleCollections = false, cycleProductCards = false, step = 0 }: { tab: ConsumerTab; cycleCollections?: boolean; cycleProductCards?: boolean; step?: number }) {
  const fixture = DECKMO_BANKDEMO_FIXTURE;
  // On beat 6.5 (step 4) open the holiday travel collection directly from the step (like 5.4).
  const openCollection = cycleCollections && step === 4;
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
        autoRotateProductCards={cycleProductCards}
        relationshipPresentationLayout={cycleProductCards}
        activeRollupLabel={openCollection ? HOLIDAY_TRAVEL_ROLLUP : undefined}
        activeRollupPillar={openCollection ? "Lifestyle" : undefined}
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
        chatPresentationLarge={showcase}
        chatStartAtTop
      />
    </div>
  );
}

type ShowcasePhone = (typeof DECKMO.retention.showcase.phones)[number] & { reply?: string };

function ShowcasePhone({ phone }: { phone: ShowcasePhone }) {
  const fixture = DECKMO_BANKDEMO_FIXTURE;
  const initialMessages = phone.initiator === "ai"
    ? [
        { role: "assistant" as const, content: phone.prompt },
        { role: "user" as const, content: phone.answer },
        ...(phone.reply ? [{ role: "assistant" as const, content: phone.reply }] : []),
      ]
    : [
        { role: "user" as const, content: phone.prompt },
        { role: "assistant" as const, content: phone.answer },
      ];

  return (
    <div className="flex min-w-0 flex-col">
      <p className="mb-3 text-center text-[clamp(16px,1.35vw,20px)] font-extrabold uppercase tracking-[0.12em] text-slate-800">{phone.label}</p>
      <div className="mx-auto h-[clamp(470px,66vh,650px)] aspect-[11/20]">
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
          chatPresentationLarge
        />
      </div>
    </div>
  );
}

function RetentionShowcase({ leaving = false }: { leaving?: boolean }) {
  const data = DECKMO.retention.showcase;
  const [hoverPaused, setHoverPaused] = useState(false);
  const carouselItems = [
    { id: "hawaii", label: "Intelligent Insights", kind: "hawaii" as const },
    ...data.phones.map((phone) => ({ ...phone, kind: "showcase" as const })),
  ];

  const renderItem = (item: (typeof carouselItems)[number], copy: number) =>
    item.kind === "hawaii" ? (
      <div key={`${item.id}-${copy}`} className={cn("flex shrink-0 flex-col", copy === 0 && "deckmo-handoff-phone")} aria-hidden={copy === 1}>
        <p className="mb-3 text-center text-[clamp(16px,1.35vw,20px)] font-extrabold uppercase tracking-[0.12em] text-slate-800">{item.label}</p>
        <div className="mx-auto h-[clamp(470px,66vh,650px)] aspect-[11/20]">
          <RetentionPhone active={false} showcase />
        </div>
      </div>
    ) : (
      <div key={`${item.id}-${copy}`} aria-hidden={copy === 1} className={cn("shrink-0", copy === 0 && "deckmo-handoff-support")}>
        <ShowcasePhone phone={item} />
      </div>
    );

  return (
    <div className={cn("deckmo-showcase-enter mx-auto flex h-full max-w-[1720px] flex-col px-[clamp(18px,2vw,38px)] py-[clamp(8px,1vh,14px)]", leaving && "deckmo-showcase-exit")}>
      <div className="deckmo-showcase-header flex shrink-0 items-end justify-between gap-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{data.eyebrow}</p>
          <h2 className="mt-1 text-[clamp(26px,2.4vw,40px)] font-bold leading-tight text-slate-950">{data.title}</h2>
          {DECKMO.retention.value && <SceneValueBlock value={DECKMO.retention.value} compact />}
        </div>
        <p className="max-w-[640px] text-right text-[clamp(13px,1vw,16px)] leading-snug text-slate-600">{data.subtitle}</p>
      </div>
      <div data-paused={hoverPaused ? "true" : "false"} onPointerMove={() => !hoverPaused && setHoverPaused(true)} onPointerLeave={() => setHoverPaused(false)} className="deckmo-carousel-viewport mt-[clamp(14px,3vh,42px)] min-h-0 flex-1 overflow-hidden">
        <div className="deckmo-carousel-track flex h-full w-max items-center gap-[clamp(36px,4vw,72px)] pr-[clamp(36px,4vw,72px)]">
          {carouselItems.map((item) => renderItem(item, 0))}
          {carouselItems.map((item) => renderItem(item, 1))}
        </div>
      </div>
    </div>
  );
}

function PhoneScene({ step, data, tab }: SceneProps & { data: typeof DECKMO.immediate | typeof DECKMO.midTerm | typeof DECKMO.longTerm; tab: ConsumerTab }) {
  return (
    <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(240px,1fr)_480px_clamp(280px,23vw,460px)] items-center gap-[clamp(20px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-6">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} value={data.value} />
      <ExactPhone tab={tab} cycleCollections={tab === "rewards"} cycleProductCards={tab === "relationship"} step={step} />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoImmediate({ step, active = true }: SceneProps) {
  const data = DECKMO.immediate;
  return (
    <div className="mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(240px,1fr)_480px_clamp(280px,23vw,460px)] items-center gap-[clamp(20px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-6">
      <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} value={data.value} />
      <DeckmoRecentTransactionsTab step={step} active={active} />
      <CalloutRail items={data.popups} step={step} />
    </div>
  );
}

export function BankdemoMidTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.midTerm} tab={phoneTabs[1]} />;
}

export function BankdemoLongTerm({ step }: SceneProps) {
  return <PhoneScene step={step} data={DECKMO.longTerm} tab={phoneTabs[2]} />;
}

export function BankdemoRetention({ step, active = true }: SceneProps) {
  const data = DECKMO.retention;
  const [showcaseMounted, setShowcaseMounted] = useState(step === 3);
  const [showcaseLeaving, setShowcaseLeaving] = useState(false);

  useEffect(() => {
    let exitTimer: number | undefined;
    if (step === 3) {
      setShowcaseMounted(true);
      setShowcaseLeaving(false);
    } else if (showcaseMounted) {
      setShowcaseLeaving(true);
      exitTimer = window.setTimeout(() => {
        setShowcaseMounted(false);
        setShowcaseLeaving(false);
      }, 700);
    }
    return () => {
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
    };
  }, [step, showcaseMounted]);

  return (
    <div className="relative h-full">
      <div className={cn("mx-auto grid h-full max-w-[1560px] grid-cols-[minmax(220px,1fr)_clamp(300px,30vw,480px)_clamp(250px,23vw,460px)] items-center gap-[clamp(16px,2.4vw,48px)] px-[clamp(24px,3vw,56px)] py-6", showcaseMounted && "hidden")}>
        <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} value={data.value} />
        <RetentionPhone active={active && step < 3} />
        <CalloutRail items={data.popups} step={step} />
      </div>
      {showcaseMounted && <RetentionShowcase leaving={showcaseLeaving} />}
    </div>
  );
}

const WORKSPACE_TABS: TabValue[] = ["ventus-ai", "targeting-automated-flows", "wm-copilot"];

// Flat beat index within the bank-tools slide -> workspace screen index.
const BANK_TOOLS_BEAT_SCREENS = DECKMO_BEAT_SCREENS;

function ExactWorkspace({ tab }: { tab: TabValue }) {
  return (
    <div data-deck-interactive onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()} className="mx-auto h-[clamp(500px,63vh,700px)] w-full max-w-[1188px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl [@media(max-width:1340px)]:h-[clamp(480px,60vh,640px)] [@media(max-width:1340px)]:max-w-[1110px] [@media(max-height:900px)]:h-[clamp(460px,58vh,560px)]">
      <div className="h-[calc(clamp(500px,63vh,700px)/0.825)] w-[1440px] origin-top-left scale-[0.825] [@media(max-width:1340px)]:h-[calc(clamp(480px,60vh,640px)/0.77)] [@media(max-width:1340px)]:scale-[0.77] [@media(max-height:900px)]:h-[calc(clamp(460px,58vh,560px)/0.825)]">
        <AnalyticsContainer key={tab} defaultTab={tab} presentationMode interactive />
      </div>
    </div>
  );
}


export function BankdemoBankTools({ step }: SceneProps) {
  const data = DECKMO.bankTools;
  const screenIndex = BANK_TOOLS_BEAT_SCREENS[step] ?? 0;
  return (
    <div className="mx-auto flex h-full max-w-[1560px] flex-col justify-center px-12 py-6">
      <div className="flex items-end justify-between gap-8">
        <div>
          <SceneHeader eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} highlight="45 tools and workflows" wide />
        </div>
        <div className="mb-1 flex gap-2">
          {data.screens.map((item, index) => <span key={item.id} className={cn("rounded-full border px-4 py-2 text-[10px] font-bold", index === screenIndex ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-400")}>{item.tab}</span>)}
        </div>
      </div>
      <div className="mt-3"><ExactWorkspace tab={WORKSPACE_TABS[screenIndex] ?? WORKSPACE_TABS[0]} /></div>
    </div>
  );
}
