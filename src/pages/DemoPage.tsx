import { useState, useCallback, useRef } from "react";
import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import DemoCustomerPanel from "@/components/demo/DemoCustomerPanel";
import DemoNetworkDiagram, { type DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import DemoDetailOverlay from "@/components/demo/DemoDetailOverlay";
import { useSSEEnrichment } from "@/hooks/useSSEEnrichment";
import { parsePastedText } from "@/lib/parsers";
import { toast } from "sonner";

export default function DemoPage() {
  const [customerA, setCustomerA] = useState<DemoCustomer>(DEMO_CUSTOMERS[0]);
  const [customerB, setCustomerB] = useState<DemoCustomer>(DEMO_CUSTOMERS[1]);
  const [activeNode, setActiveNode] = useState<DemoNodeType | null>(null);

  const enrichA = useSSEEnrichment();
  const enrichB = useSSEEnrichment();

  // Cache: track which customer IDs were last enriched
  const lastEnrichedRef = useRef<{ a: string; b: string } | null>(null);

  // Derive combined status for the panel
  const isProcessing = enrichA.isProcessing || enrichB.isProcessing;
  const currentPhase: "idle" | "classification" | "travel" | "complete" =
    enrichA.currentPhase === "complete" && enrichB.currentPhase === "complete"
      ? "complete"
      : enrichA.currentPhase === "travel" || enrichB.currentPhase === "travel"
        ? "travel"
        : enrichA.currentPhase === "classification" || enrichB.currentPhase === "classification"
          ? "classification"
          : enrichA.currentPhase === "complete" || enrichB.currentPhase === "complete"
            ? enrichA.isProcessing || enrichB.isProcessing ? "classification" : "complete"
            : "idle";

  const statusMessage =
    enrichA.isProcessing && enrichB.isProcessing
      ? `A: ${enrichA.statusMessage} | B: ${enrichB.statusMessage}`
      : enrichA.isProcessing
        ? `A: ${enrichA.statusMessage}`
        : enrichB.isProcessing
          ? `B: ${enrichB.statusMessage}`
          : enrichA.statusMessage || enrichB.statusMessage || "";

  const handleEnrich = useCallback(() => {
    // Skip if same customers already enriched
    if (
      lastEnrichedRef.current?.a === customerA.id &&
      lastEnrichedRef.current?.b === customerB.id &&
      enrichA.currentPhase === "complete" &&
      enrichB.currentPhase === "complete"
    ) {
      toast.info("These customers are already enriched. Change a customer to re-enrich.");
      return;
    }

    lastEnrichedRef.current = { a: customerA.id, b: customerB.id };

    // Parse CSVs into Transaction[]
    const parseCustomerCsv = (customer: DemoCustomer) => {
      const result = parsePastedText(customer.csv);
      if (result.needsMapping || !result.transactions) {
        throw new Error(`Failed to parse CSV for ${customer.profile.name}`);
      }
      return result.transactions;
    };

    try {
      const txnsA = parseCustomerCsv(customerA);
      const txnsB = parseCustomerCsv(customerB);

      // Fire both in parallel
      enrichA.startEnrichment(txnsA, customerA.zip);
      enrichB.startEnrichment(txnsB, customerB.zip);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [customerA, customerB, enrichA, enrichB]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Left Panel — 30% */}
      <div className="w-[30%] min-w-[280px] max-w-[380px] shrink-0 border-r border-slate-200 bg-slate-50">
        <DemoCustomerPanel
          customerA={customerA}
          customerB={customerB}
          onSelectA={setCustomerA}
          onSelectB={setCustomerB}
          onEnrich={handleEnrich}
          isProcessing={isProcessing}
          statusMessage={statusMessage}
          currentPhase={currentPhase}
        />
      </div>

      {/* Right Panel — 70% */}
      <div className="flex-1 relative">
        <DemoNetworkDiagram
          customerA={customerA}
          customerB={customerB}
          activeNode={activeNode}
          onNodeClick={(node) => setActiveNode(node)}
        />

        {/* Detail overlay */}
        {activeNode && (
          <DemoDetailOverlay
            node={activeNode}
            customerA={customerA}
            customerB={customerB}
            onClose={() => setActiveNode(null)}
          />
        )}
      </div>
    </div>
  );
}
