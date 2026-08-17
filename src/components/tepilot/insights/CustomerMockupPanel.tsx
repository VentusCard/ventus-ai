import { Smartphone, ExternalLink } from "lucide-react";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { useExecDemoSession } from "@/lib/execDemoSessionStore";
import { EXAMPLE_CUSTOMERS } from "@/lib/personalizationExamples";
import {
  setPersonalizationCustomer,
  usePersonalizationCustomer,
} from "@/lib/personalizationCustomerStore";
import { ExampleCustomerBar } from "./personalization/ExampleCustomerBar";
import { CustomerSignalPanel } from "./personalization/CustomerSignalPanel";
import type { TabValue } from "./AnalyticsContainer";

type Surface = "rewards" | "product" | "relationship";

const SURFACE_COPY: Record<Surface, { title: string; body: string; bullets: string[] }> = {
  rewards: {
    title: "What the customer sees",
    body: "Personalized deals are delivered into the customer's rewards surface — each offer is generated from their own enriched spending behavior, not a generic segment.",
    bullets: [
      "Offers ranked by the customer's dominant spend behavior",
      "Merchant and category perks matched to real transaction evidence",
      "Timing tuned to the customer's seasonal spend curve",
    ],
  },
  product: {
    title: "What the customer sees",
    body: "Product recommendations surface in-app as membership and card offers, grounded in behavioral and financial signals detected from transactions.",
    bullets: [
      "One primary product recommendation, not a catalog dump",
      "Value framed in the customer's own spend math",
      "Delivered through the channel most likely to convert",
    ],
  },
  relationship: {
    title: "What the customer sees",
    body: "The banking assistant answers in the customer's own financial context — the same enriched signals the advisor coworker uses on the bank side.",
    bullets: [
      "Answers grounded in enriched transaction history",
      "Behavioral tone matched to the customer's spending profile",
      "Same evidence base as the advisor-facing coworker",
    ],
  },
};

interface CustomerMockupPanelProps {
  surface: Surface;
  onNavigate?: (tab: TabValue) => void;
}

export function CustomerMockupPanel({ surface, onNavigate }: CustomerMockupPanelProps) {
  const session = useExecDemoSession();
  const selectedId = usePersonalizationCustomer();
  const copy = SURFACE_COPY[surface];

  const sessionName = session.hasRun ? session.customer?.profile?.name ?? null : null;
  const useSession = selectedId === "session" && !!session.customer;

  const example =
    EXAMPLE_CUSTOMERS.find((c) => c.id === selectedId) ?? EXAMPLE_CUSTOMERS[0];
  const phoneCustomer = useSession ? session.customer! : example.demo;
  const displayName = useSession ? sessionName : example.name;

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Customer View</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Signals and customer surface for {displayName}
            </p>
          </div>
        </div>
        {!session.hasRun && (
          <a
            href="/demo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors shrink-0"
          >
            Run the demo
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <ExampleCustomerBar
        selectedId={selectedId}
        onSelect={setPersonalizationCustomer}
        sessionName={sessionName}
      />

      <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,400px)] gap-6">
        <div className="min-w-0 space-y-4">
          {useSession ? (
            <div className="border border-slate-200 rounded-lg bg-slate-50/70 px-3 py-2.5">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Showing the live enriched output of the current demo session for{" "}
                {displayName}. Pick an example customer above to see its detected signals.
              </p>
            </div>
          ) : (
            <CustomerSignalPanel customer={example} />
          )}

          <div>
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
          </div>
        </div>

        <div className="h-[680px] min-h-0 flex flex-col">
          <ExecDemoPhoneView
            customer={phoneCustomer}
            activeTab={surface === "rewards" ? "rewards" : surface === "product" ? "product" : "relationship"}
            phase="hold"
            showContent
            generatedOffers={useSession ? session.generatedOffers : null}
            detectedLifeEvents={useSession ? session.detectedLifeEvents : null}
            productCards={useSession ? session.productCards : null}
            activeRollupLabel={useSession ? session.activeRollupLabel : null}
            activeRollupPillar={useSession ? session.activeRollupPillar : null}
            enrichedTxs={useSession ? session.enrichedTxs : null}
            riskFlags={useSession ? session.riskFlags : null}
          />
        </div>
      </div>
    </div>
  );
}
