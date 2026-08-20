import { useEffect, useMemo } from "react";
import { Smartphone, Loader2, Users, RotateCw } from "lucide-react";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { useExecDemoSession } from "@/lib/execDemoSessionStore";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import {
  setPersonalizationCustomer,
  usePersonalizationCustomer,
} from "@/lib/personalizationCustomerStore";
import {
  ensurePersonalization,
  retryPersonalization,
  usePersonalizationResult,
} from "@/lib/personalizationResultStore";
import { buildChatSignalContext } from "@/lib/personalizationGeneration";
import { ExampleCustomerBar } from "./personalization/ExampleCustomerBar";
import { CustomerSignalPanel, CustomerSignalSkeleton } from "./personalization/CustomerSignalPanel";
import { SurfaceFeaturePanel } from "./personalization/SurfaceFeaturePanel";
import type { TabValue } from "./AnalyticsContainer";

type Surface = "rewards" | "product" | "relationship";

const SURFACE_TITLE: Record<Surface, string> = {
  rewards: "Personalized Rewards",
  product: "Personalized Product",
  relationship: "Personalized Relationship",
};

interface CustomerMockupPanelProps {
  surface: Surface;
  onNavigate?: (tab: TabValue) => void;
}

export function CustomerMockupPanel({ surface }: CustomerMockupPanelProps) {
  const session = useExecDemoSession();
  const selectedId = usePersonalizationCustomer();

  const sessionName = session.hasRun ? session.customer?.profile?.name ?? null : null;
  const useSession = selectedId === "session" && !!session.customer;

  const example = EXAMPLE_CUSTOMERS.find((c) => c.id === selectedId) ?? null;
  const hasSelection = useSession || !!example;
  const generated = usePersonalizationResult(example?.id ?? "");

  // Prewarm now happens on dashboard mount (AnalyticsContainer).


  useEffect(() => {
    if (!useSession && example) ensurePersonalization(example.id);
  }, [example?.id, useSession]);

  const chatSignalContext = useMemo(
    () => (useSession || !example ? undefined : buildChatSignalContext(example)),
    [useSession, example],
  );

  const phoneCustomer = useSession ? session.customer! : example?.demo ?? null;
  const displayName = useSession ? sessionName : example?.name ?? null;
  const isGenerating = !useSession && !!example && generated.status === "running";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.2fr] gap-4 h-[calc(100vh-140px)] min-h-[720px]">
      {/* ---------- Customer Selection ---------- */}
      <div className="lg:col-span-1 min-h-0 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="shrink-0 px-4 py-3 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <h2 className="text-sm font-semibold text-slate-900">Customer Selection</h2>
          </div>
          <ExampleCustomerBar
            compact
            selectedId={selectedId}
            onSelect={setPersonalizationCustomer}
            sessionName={sessionName}
          />
        </div>

        <div className="flex-1 min-h-0 px-4 py-3">
          {!hasSelection ? (
            <CustomerSignalSkeleton />
          ) : useSession ? (
            <div className="border border-slate-200 rounded-lg bg-slate-50/70 px-3 py-2.5">
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Showing the live enriched output of the current demo session for {displayName}.
                Pick an example customer above to see its detected signals.
              </p>
            </div>
          ) : (
            <CustomerSignalPanel customer={example!} />
          )}
        </div>
      </div>

      {/* ---------- Key features + unit economics ---------- */}
      <SurfaceFeaturePanel surface={surface} customerKey={hasSelection ? selectedId ?? displayName : null} />

      {/* ---------- Personalized surface ---------- */}
      <div className="lg:col-span-1 min-h-0 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
            <h2 className="text-sm font-semibold text-slate-900 truncate">
              {SURFACE_TITLE[surface]}
            </h2>
            {displayName && (
              <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                · {displayName}
              </span>
            )}
          </div>
          {isGenerating && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0 p-3 flex flex-col">
          {!hasSelection ? (
            <div className="flex-1 min-h-0 flex justify-center relative">
              <div className="w-full max-w-[400px] h-full flex flex-col opacity-50 grayscale blur-[1.5px] pointer-events-none select-none">
                <ExecDemoPhoneView
                  customer={EXAMPLE_CUSTOMERS[0].demo}
                  activeTab={surface === "rewards" ? "rewards" : surface === "product" ? "product" : "relationship"}
                  phase="hold"
                  showContent
                  generatedOffers={null}
                  detectedLifeEvents={null}
                  productCards={null}
                  activeRollupLabel={null}
                  activeRollupPillar={null}
                  enrichedTxs={null}
                  riskFlags={null}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11.5px] font-semibold text-slate-500 bg-white/90 border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                  Select a customer to generate this surface
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex justify-center">
              <div className="w-full max-w-[400px] h-full flex flex-col">
                <ExecDemoPhoneView
                  customer={phoneCustomer!}
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
            </div>
          )}

          {hasSelection && !useSession && example && generated.status === "failed" && (
            <div className="shrink-0 mt-1.5 flex items-center justify-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
              <span>
                Live generation didn't return for this customer. Showing the standard demo content
                instead.
              </span>
              <button
                type="button"
                onClick={() => retryPersonalization(example.id)}
                className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2 py-0.5 font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <RotateCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

