import { useState, useMemo } from "react";
import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import DemoCustomerPanel from "@/components/demo/DemoCustomerPanel";
import DemoNetworkDiagram, { type DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import DemoDetailOverlay from "@/components/demo/DemoDetailOverlay";
import DemoPasswordGate from "@/components/demo/DemoPasswordGate";
import { useDemoEnrichment } from "@/hooks/useDemoEnrichment";
import { parsePastedText } from "@/lib/parsers";
import type { Transaction } from "@/types/transaction";

export default function DemoPage() {
  const [customerA, setCustomerA] = useState<DemoCustomer | null>(null);
  const [customerB, setCustomerB] = useState<DemoCustomer | null>(null);
  const [activeNode, setActiveNode] = useState<DemoNodeType | null>(null);

  const parsedA = useMemo<Transaction[]>(() => {
    if (!customerA) return [];
    const result = parsePastedText(customerA.csv);
    return result.transactions ?? [];
  }, [customerA?.csv]);

  const parsedB = useMemo<Transaction[]>(() => {
    if (!customerB) return [];
    const result = parsePastedText(customerB.csv);
    return result.transactions ?? [];
  }, [customerB?.csv]);

  const {
    nodeReadiness,
    inputReady,
    isProcessing,
    statusMessage,
    enrichedA,
    enrichedB,
    localExperiences,
    startEnrichment,
  } = useDemoEnrichment();

  const handleEnrich = () => startEnrichment(customerA, customerB);

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
      {/* Exit to keynote button */}
      <button
        onClick={() => {
          sessionStorage.removeItem("demo_access");
          window.location.reload();
        }}
        className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
      >
        ✕ Exit Demo
      </button>
      {/* Left Panel — 30% */}
      <div className="w-[30%] min-w-[280px] max-w-[380px] shrink-0 border-r border-slate-200 bg-slate-50">
        <DemoCustomerPanel
          customerA={customerA}
          customerB={customerB}
          parsedTransactionsA={parsedA}
          parsedTransactionsB={parsedB}
          onSelectA={setCustomerA}
          onSelectB={setCustomerB}
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
          customerA={customerA}
          customerB={customerB}
          activeNode={activeNode}
          onNodeClick={(node) => setActiveNode(node)}
          nodeReadiness={nodeReadiness}
          inputReady={inputReady}
        />

        {activeNode && (
          <DemoDetailOverlay
            node={activeNode}
            customerA={customerA}
            customerB={customerB}
            enrichedA={enrichedA}
            enrichedB={enrichedB}
            localExperiences={localExperiences}
            onClose={() => setActiveNode(null)}
          />
        )}
      </div>
    </div>
    </DemoPasswordGate>
  );
}
