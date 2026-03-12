import { useState } from "react";
import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import DemoCustomerPanel from "@/components/demo/DemoCustomerPanel";
import DemoNetworkDiagram, { type DemoNodeType } from "@/components/demo/DemoNetworkDiagram";
import DemoDetailOverlay from "@/components/demo/DemoDetailOverlay";

export default function DemoPage() {
  const [customerA, setCustomerA] = useState<DemoCustomer>(DEMO_CUSTOMERS[0]);
  const [customerB, setCustomerB] = useState<DemoCustomer>(DEMO_CUSTOMERS[1]);
  const [activeNode, setActiveNode] = useState<DemoNodeType | null>(null);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Left Panel — 30% */}
      <div className="w-[30%] min-w-[280px] max-w-[380px] shrink-0 border-r border-slate-200 bg-slate-50">
        <DemoCustomerPanel
          customerA={customerA}
          customerB={customerB}
          onSelectA={setCustomerA}
          onSelectB={setCustomerB}
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
