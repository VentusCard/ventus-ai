import { useEffect, useMemo } from "react";
import { Smartphone, ExternalLink, Loader2 } from "lucide-react";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { useExecDemoSession } from "@/lib/execDemoSessionStore";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import {
  setPersonalizationCustomer,
  usePersonalizationCustomer,
} from "@/lib/personalizationCustomerStore";
import {
  ensurePersonalization,
  usePersonalizationResult,
} from "@/lib/personalizationResultStore";
import { buildChatSignalContext } from "@/lib/personalizationGeneration";
import { ExampleCustomerBar } from "./personalization/ExampleCustomerBar";
import { CustomerSignalPanel } from "./personalization/CustomerSignalPanel";
import type { TabValue } from "./AnalyticsContainer";

type Surface = "rewards" | "product" | "relationship";

const SURFACE_COPY: Record<Surface, { title: string; body: string; bullets: string[] }> = {
  rewards: {
    title: "What the customer sees",
    body: "Personalized deals are generated from this customer's detected signals and delivered into their rewards surface — not from a generic segment.",
    bullets: [
      "Offers ranked by the customer's dominant spending signals",
      "Merchant and category perks matched to signal evidence",
      "Timing tuned to the customer's life-event window",
    ],
  },
  product: {
    title: "What the customer sees",
    body: "Product recommendations surface in-app as membership and card offers, generated from the life-event, financial and behavioral signals on the left.",
    bullets: [
      "One primary product recommendation, not a catalog dump",
      "Value framed in the customer's own behavior",
      "Delivered through the channel most likely to convert",
    ],
  },
  relationship: {
    title: "What the customer sees",
    body: "The banking assistant answers in the customer's own context — grounded in the same signals shown on the left, in demo mock-up form.",
    bullets: [
      "Answers grounded in the detected signal set",
      "Behavioral tone matched to the customer's profile",
      "Same evidence base as the advisor-facing coworker",
    ],
  },
};

interface CustomerMockupPanelProps {
  surface: Surface;
  onNavigate?: (tab: TabValue) => void;
}

export function CustomerMockupPanel({ surface }: CustomerMockupPanelProps) {
  const session = useExecDemoSession();
  const selectedId = usePersonalizationCustomer();
  const copy = SURFACE_COPY[surface];

  const sessionName = session.hasRun ? session.customer?.profile?.name ?? null : null;
  const useSession = selectedId === "session" && !!session.customer;

  const example = EXAMPLE_CUSTOMERS.find((c) => c.id === selectedId) ?? EXAMPLE_CUSTOMERS[0];
  const generated = usePersonalizationResult(example.id);

  useEffect(() => {
    if (!useSession) ensurePersonalization(example.id);
  }, [example.id, useSession]);

  const chatSignalContext = useMemo(
    () => (useSession ? undefined : buildChatSignalContext(example)),
    [useSession, example],
  );

  const phoneCustomer = useSession ? session.customer! : example.demo;
  const displayName = useSession ? sessionName : example.name;
  const isGenerating = !useSession && generated.status === "running";

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Customer View</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Signals and generated customer surface for {displayName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating experience
            </span>
          )}
          {!session.hasRun && (
            <a
              href="/demo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
            >
              Run the demo
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <ExampleCustomerBar
        selectedId={selectedId}
        onSelect={setPersonalizationCustomer}
        sessionName={sessionName}
      />

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="min-w-0 lg:col-span-1">
          {useSession ? (
            <div className="border border-slate-200 rounded-lg bg-slate-50/70 px-3 py-2.5">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Showing the live enriched output of the current demo session for {displayName}.
                Pick an example customer above to see its detected signals.
              </p>
            </div>
          ) : (
            <CustomerSignalPanel customer={example} />
          )}
        </div>

        <div className="min-w-0 lg:col-span-2 grid grid-cols-1 xl:grid-cols-[minmax(300px,380px)_1fr] gap-5">
          <div className="h-[680px] min-h-0 flex flex-col">
            <ExecDemoPhoneView
              customer={phoneCustomer}
              activeTab={surface === "rewards" ? "rewards" : surface === "product" ? "product" : "relationship"}
              phase="hold"
              showContent
              generatedOffers={useSession ? session.generatedOffers : generated.offers}
              detectedLifeEvents={useSession ? session.detectedLifeEvents : generated.lifeEvents}
              productCards={useSession ? session.productCards : generated.productCards}
              activeRollupLabel={useSession ? session.activeRollupLabel : null}
              activeRollupPillar={useSession ? session.activeRollupPillar : null}
              enrichedTxs={useSession ? session.enrichedTxs : null}
              riskFlags={useSession ? session.riskFlags : null}
              chatSignalContext={chatSignalContext}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{copy.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{copy.body}</p>
            <ul className="mt-3 space-y-2">
              {copy.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {!useSession && generated.status === "failed" && (
              <p className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-2">
                Live generation didn't return for this customer. Showing the standard demo content
                instead — reselect the customer to retry.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
