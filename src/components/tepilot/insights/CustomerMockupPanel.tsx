import { Smartphone, ExternalLink } from "lucide-react";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import { useExecDemoSession } from "@/lib/execDemoSessionStore";
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
  const customer = session.customer ?? DEMO_CUSTOMERS[0];
  const copy = SURFACE_COPY[surface];

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Customer View</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live mockup from the current demo session
              {customer?.profile?.name ? ` — ${customer.profile.name}` : ""}
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

      <div className="p-4 grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-6">
        <div className="h-[680px] min-h-0 flex flex-col">
          <ExecDemoPhoneView
            customer={customer}
            activeTab={surface === "rewards" ? "rewards" : surface === "product" ? "product" : "relationship"}
            phase="hold"
            showContent
            generatedOffers={session.generatedOffers}
            detectedLifeEvents={session.detectedLifeEvents}
            productCards={session.productCards}
            activeRollupLabel={session.activeRollupLabel}
            activeRollupPillar={session.activeRollupPillar}
            enrichedTxs={session.enrichedTxs}
            riskFlags={session.riskFlags}
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
          <div className="mt-4 border border-slate-200 rounded-md bg-slate-50/70 px-3 py-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {session.hasRun
                ? "Reflecting the enriched output of the current demo session. Re-run the Demo tab with a different customer to refresh this view."
                : "Showing sample data — run the Demo tab to populate this view with live enriched output."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
