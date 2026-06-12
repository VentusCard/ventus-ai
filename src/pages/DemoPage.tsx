import { useState, useMemo } from "react";
import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import { ALL_MODULES, type ModuleKey } from "@/types/demo";
import DemoCustomerPanel from "@/components/demo/DemoCustomerPanel";
import DemoNetworkDiagram, { type DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import DemoDetailOverlay from "@/components/demo/DemoDetailOverlay";
import DemoPasswordGate from "@/components/demo/DemoPasswordGate";
import { useDemoEnrichment } from "@/hooks/useDemoEnrichment";
import { parsePastedText } from "@/lib/parsers";
import type { Transaction } from "@/types/transaction";
import { PanelLeft, ArrowRight, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ContactFormDialog from "@/components/ContactFormDialog";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import ventusLogo from "@/assets/ventus-logo-blue.png";

export default function DemoPage() {
  const [customer, setCustomer] = useState<DemoCustomer | null>(null);
  const [activeNode, setActiveNode] = useState<DemoNodeType | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [enabledModules, setEnabledModules] = useState<Set<ModuleKey>>(new Set(ALL_MODULES));

  const BANK_WIDE_NODES = new Set<DemoNodeType>(["analytics", "travel", "lifeEvents", "outflow", "locational", "lifeEventIntel", "wmCopilot", "aiFinancialInsights", "dealPersonalization"]);
  const CONSUMER_NODES = new Set<DemoNodeType>(["engagement", "rewards", "wealth"]);
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
    riskFlags,
    startEnrichment,
  } = useDemoEnrichment();

  const handleEnrich = () => {
    if (customer) {
      setPanelOpen(false);
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
    <SimplePasswordGate>
    <DemoPasswordGate>
    <div className="demo-page h-screen w-screen flex overflow-hidden bg-white relative" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Logo + one-liner — always visible */}
      <div className="absolute top-6 left-6 z-40">
        <img src={ventusLogo} className="h-6 mb-2" alt="Ventus" />
        <p className="text-[14px] text-slate-500 whitespace-nowrap">
          AI-Native Customer Intelligence Infrastructure Powering Next-Gen Personalized Banking
        </p>
      </div>

      {/* Show Panel button — bottom-left */}
      <button
        onClick={() => setPanelOpen(true)}
        className="absolute bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
      >
        <PanelLeft className="h-3.5 w-3.5" />
        Demo Settings
      </button>

      {/* Customer Panel Dialog */}
      <DemoCustomerPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        customer={customer}
        parsedTransactions={parsedTransactions}
        onSelect={setCustomer}
        onEnrich={handleEnrich}
        isProcessing={isProcessing}
        statusMessage={statusMessage}
        currentPhase={currentPhase}
        nodeReadiness={nodeReadiness}
        enabledModules={enabledModules}
        onModulesChange={setEnabledModules}
      />

      {/* Full-width network diagram */}
      <div className="flex-1 relative">
        <DemoNetworkDiagram
          customer={customer}
          activeNode={activeNode}
          onNodeClick={(node) => setActiveNode(node)}
          nodeReadiness={nodeReadiness}
          inputReady={inputReady}
          centered={true}
          onTxCardClick={() => setPanelOpen(true)}
          enabledModules={enabledModules}
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
            riskFlags={riskFlags}
            tip={tip}
            onClose={() => setActiveNode(null)}
            enabledModules={enabledModules}
          />
        )}
      </div>

      {/* Bottom-right navigation */}
      {activeNode && !BANK_WIDE_NODES.has(activeNode) && !CONSUMER_NODES.has(activeNode) ? (
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

      {/* Top-right controls */}
      {!activeNode && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Link
            to="/bankdemo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Bank Demo
          </Link>
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
    </SimplePasswordGate>
  );
}
