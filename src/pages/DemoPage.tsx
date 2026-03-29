import { useState, useMemo } from "react";
import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import DemoCustomerPanel from "@/components/demo/DemoCustomerPanel";
import DemoNetworkDiagram, { type DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import DemoDetailOverlay from "@/components/demo/DemoDetailOverlay";
import DemoPasswordGate from "@/components/demo/DemoPasswordGate";
import { useDemoEnrichment } from "@/hooks/useDemoEnrichment";
import { parsePastedText } from "@/lib/parsers";
import type { Transaction } from "@/types/transaction";
import { PanelLeft, ArrowRight, X } from "lucide-react";
import ContactFormDialog from "@/components/ContactFormDialog";
import ventusLogo from "@/assets/ventus-logo-blue.png";

export default function DemoPage() {
  const [customer, setCustomer] = useState<DemoCustomer | null>(null);
  const [activeNode, setActiveNode] = useState<DemoNodeType | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const BANK_WIDE_NODES = new Set<DemoNodeType>(["analytics", "travel", "lifeEvents", "outflow", "locational", "lifeEventIntel", "wmCopilot", "aiFinancialInsights", "dealPersonalization"]);
  const NODE_ORDER: DemoNodeType[] = ["engine", "analytics", "outflow", "aiFinancialInsights", "engagement", "travel", "locational", "dealPersonalization", "rewards", "lifeEventIntel", "lifeEvents", "wmCopilot", "wealth"];
  const activeIdx = activeNode ? NODE_ORDER.indexOf(activeNode) : -1;
  const prevNode = activeIdx > 0 ? NODE_ORDER[activeIdx - 1] : null;
  const nextNode = activeIdx >= 0 && activeIdx < NODE_ORDER.length - 1 ? NODE_ORDER[activeIdx + 1] : null;

  const parsedTransactions = useMemo<Transaction[]>(() => {
    if (!customer) return [];
    const result = parsePastedText(customer.csv);
    return result.transactions ?? [];
  }, [customer?.csv]);

  const {
    nodeReadiness,
    inputReady,
    isProcessing,
    statusMessage,
    enriched,
    localExperiences,
    personalizedDeals,
    detectedEvents,
    apiPayloads,
    tip,
    startEnrichment,
  } = useDemoEnrichment();

  const handleEnrich = () => {
    if (customer) {
      setPanelCollapsed(true);
      startEnrichment(customer);
    }
  };

  const currentPhase: "idle" | "classification" | "travel" | "complete" =
    nodeReadiness.analytics === "ready" && nodeReadiness.travel === "ready" && nodeReadiness.rewards === "ready"
      ? "complete"
      : nodeReadiness.analytics === "ready"
        ? "travel"
        : Object.values(nodeReadiness).some(s => s === "processing")
          ? "classification"
          : "idle";

  return (
    <DemoPasswordGate>
    <div className="demo-page h-screen w-screen flex overflow-hidden bg-white relative" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Logo + one-liner when panel collapsed */}
      {panelCollapsed && (
        <div className="absolute top-6 left-6 z-40">
          <img src={ventusLogo} className="h-6 mb-2" alt="Ventus" />
          <p className="text-[14px] text-slate-500 whitespace-nowrap">
            One AI-Native layer that enables personalized banking across functions.
          </p>
        </div>
      )}

      {/* Show Panel — bottom-left when collapsed */}
      {panelCollapsed && (
        <button
          onClick={() => setPanelCollapsed(false)}
          className="absolute bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
        >
          <PanelLeft className="h-3.5 w-3.5" />
          Show Panel
        </button>
      )}

      {/* Left Panel — collapsible */}
      <div
        className={`shrink-0 border-r border-slate-200 bg-slate-50 transition-all duration-500 ease-in-out overflow-hidden relative ${
          panelCollapsed ? "w-0 min-w-0 opacity-0" : "w-[35%] min-w-[340px] max-w-[440px] opacity-100"
        }`}
      >
        {/* Collapse button inside panel */}
        {!panelCollapsed && (
          <button
            onClick={() => setPanelCollapsed(true)}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
            title="Collapse panel"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <DemoCustomerPanel
          customer={customer}
          parsedTransactions={parsedTransactions}
          onSelect={setCustomer}
          onEnrich={handleEnrich}
          isProcessing={isProcessing}
          statusMessage={statusMessage}
          currentPhase={currentPhase}
          nodeReadiness={nodeReadiness}
        />
      </div>

      {/* Right Panel — 70% */}
      <div className="flex-1 relative">
        <DemoNetworkDiagram
          customer={customer}
          activeNode={activeNode}
          onNodeClick={(node) => setActiveNode(node)}
          nodeReadiness={nodeReadiness}
          inputReady={inputReady}
          centered={panelCollapsed}
          onTxCardClick={() => setPanelCollapsed(false)}
        />

        {activeNode && customer && (
          <DemoDetailOverlay
            node={activeNode}
            customer={customer}
            enriched={enriched}
            localExperiences={localExperiences}
            personalizedDeals={personalizedDeals}
            detectedEvents={detectedEvents}
            apiPayloads={apiPayloads}
            tip={tip}
            onClose={() => setActiveNode(null)}
          />
        )}
      </div>

      {/* Bottom-right navigation */}
      {activeNode && !BANK_WIDE_NODES.has(activeNode) ? (
        <div className="absolute bottom-4 right-4 z-[60] flex items-center gap-2">
          {prevNode && (
            <button
              onClick={() => setActiveNode(prevNode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={() => setActiveNode(nextNode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            {nextNode ? "Next →" : "Close ✕"}
          </button>
        </div>
      ) : !activeNode ? (
        <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setContactOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            Next Step →
          </button>
        </div>
      ) : null}

      {/* Exit button — top-right */}
      {!activeNode && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => {
              sessionStorage.removeItem("demo_access");
              window.location.reload();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <X className="h-3 w-3" /> Exit
          </button>
        </div>
      )}
      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
    </DemoPasswordGate>
  );
}
