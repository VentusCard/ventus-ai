import { useEffect, useRef, useState } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import { BarChart3, Gift, Smartphone, Plane, TrendingUp, CalendarHeart } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";

export type DemoNodeType = "engagement" | "analytics" | "rewards" | "travel" | "lifeEvents" | "wealth";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  activeNode: DemoNodeType | null;
  onNodeClick: (node: DemoNodeType) => void;
  nodeReadiness: NodeReadiness;
  inputReady: boolean;
}

interface NodeDef {
  id: DemoNodeType;
  label: string;
  icon: typeof BarChart3;
  color: string;
}

interface SectionDef {
  label: string;
  nodes: NodeDef[];
}

const SECTIONS: SectionDef[] = [
  {
    label: "UX & Analytics",
    nodes: [
      { id: "engagement", label: "Customer Engagement", icon: Smartphone, color: "#f59e0b" },
      { id: "analytics", label: "Bank-Wide Analytics", icon: BarChart3, color: "#3b82f6" },
    ],
  },
  {
    label: "Personalized Rewards",
    nodes: [
      { id: "rewards", label: "Consumer Rewards", icon: Gift, color: "#22c55e" },
      { id: "travel", label: "Travel Experiences", icon: Plane, color: "#06b6d4" },
    ],
  },
  {
    label: "Life Cycle Intelligence",
    nodes: [
      { id: "lifeEvents", label: "Life Event Detection", icon: CalendarHeart, color: "#ec4899" },
      { id: "wealth", label: "Wealth Management", icon: TrendingUp, color: "#a855f7" },
    ],
  },
];

const ALL_NODES = SECTIONS.flatMap(s => s.nodes);

const ENGINE_FEATURES = [
  "Semantic Enrichment",
  "Cross-category Pattern Analysis",
  "Deep Purchase Intelligence",
  "Behavioral Profiling",
  "Life Event Detection",
];

export default function DemoNetworkDiagram({ customerA, customerB, activeNode, onNodeClick, nodeReadiness, inputReady }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const colLeft = dims.w * 0.12;
  const colCenter = dims.w * 0.48;
  const colRight = dims.w * 0.85;
  const midY = dims.h * 0.5;

  const inputAY = midY - 70;
  const inputBY = midY + 70;

  // 3 sections × (section header + 2 nodes) = 9 visual slots
  // Layout: each section takes ~1/3 of height with header + 2 nodes
  const sectionHeight = dims.h / 3;
  const getNodeY = (sectionIdx: number, nodeIdx: number) => {
    const sectionTop = sectionIdx * sectionHeight;
    // header takes top portion, then 2 nodes evenly spaced
    return sectionTop + 28 + (nodeIdx + 0.5) * ((sectionHeight - 28) / 2);
  };

  const anyProcessing = Object.values(nodeReadiness).some(s => s === "processing");
  const inputState: "idle" | "processing" | "ready" = inputReady ? "ready" : anyProcessing ? "processing" : "idle";

  // Flatten for SVG line rendering
  let nodeIndex = 0;
  const nodePositions: { node: NodeDef; y: number }[] = [];
  SECTIONS.forEach((section, si) => {
    section.nodes.forEach((node, ni) => {
      nodePositions.push({ node, y: getNodeY(si, ni) });
      nodeIndex++;
    });
  });

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="lineGradSolid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <style>{`
          .line-transition {
            transition: stroke-dasharray 0.6s ease, opacity 0.4s ease, stroke-width 0.3s ease;
          }
        `}</style>

        {dims.w > 0 && (
          <>
            {/* Input lines (left cards → engine) */}
            {[inputAY, inputBY].map((y, i) => {
              const path = `M ${colLeft + 80} ${y} C ${colCenter - 60} ${y}, ${colCenter - 60} ${midY}, ${colCenter - 40} ${midY}`;
              const isReady = inputState === "ready";
              const isProcessingLine = inputState === "processing";
              return (
                <g key={`in-${i}`}>
                  <path
                    d={path}
                    stroke={isReady ? "url(#lineGradSolid)" : "url(#lineGrad)"}
                    strokeWidth={isReady ? 2 : 1.5}
                    fill="none"
                    opacity={isReady ? 0.7 : 0.25}
                    strokeDasharray={isReady ? "none" : "6 4"}
                    className="line-transition"
                  />
                  {isProcessingLine && (
                    <circle r="2.5" fill="#3b82f6">
                      <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Output lines (engine → right nodes) */}
            {nodePositions.map(({ node, y }, i) => {
              const path = `M ${colCenter + 80} ${midY} C ${colRight - 80} ${midY}, ${colRight - 80} ${y}, ${colRight - 50} ${y}`;
              const state = nodeReadiness[node.id];
              const isReady = state === "ready";
              const isProcessingNode = state === "processing";

              return (
                <g key={`out-${i}`}>
                  <path
                    d={path}
                    stroke={node.color}
                    strokeWidth={isReady ? 2.5 : 1.5}
                    fill="none"
                    opacity={isReady ? 0.75 : activeNode === node.id ? 0.5 : 0.2}
                    strokeDasharray={isReady ? "none" : "6 4"}
                    className="line-transition"
                  />
                  {isProcessingNode && (
                    <circle r="2.5" fill={node.color}>
                      <animateMotion dur={`${2 + i * 0.4}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                  {isReady && (
                    <circle r="3" fill={node.color} opacity="0.6">
                      <animateMotion dur={`${3 + i * 0.3}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })}
          </>
        )}
      </svg>

      {/* Transaction Cards — Left */}
      <div className="absolute" style={{ left: colLeft - 40, top: inputAY - 50, width: 160, zIndex: 1 }}>
        <TxCard customer={customerA} color="#3b82f6" />
      </div>
      <div className="absolute" style={{ left: colLeft - 40, top: inputBY - 50, width: 160, zIndex: 1 }}>
        <TxCard customer={customerB} color="#10b981" />
      </div>

      {/* Engine Node — Center */}
      <div
        className="absolute flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white"
        style={{
          left: colCenter - 70,
          top: midY - 100,
          width: 160,
          height: 200,
          boxShadow: anyProcessing && !inputReady
            ? "0 0 30px rgba(99, 102, 241, 0.25)"
            : inputReady
              ? "0 0 20px rgba(34, 197, 94, 0.15)"
              : "0 4px 24px rgba(99, 102, 241, 0.1)",
          zIndex: 1,
          transition: "box-shadow 0.6s ease",
        }}
      >
        <div className={`w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-2 border border-indigo-200 ${anyProcessing && !inputReady ? "animate-pulse" : ""}`}>
          <span className="text-indigo-600 text-lg font-bold">V</span>
        </div>
        <p className="text-[11px] font-bold text-slate-900 text-center mb-2">Ventus AI Engine</p>
        <div className="space-y-1 px-3">
          {ENGINE_FEATURES.map((f) => (
            <p key={f} className="text-[8px] text-slate-500 text-center leading-tight">{f}</p>
          ))}
        </div>
      </div>

      {/* Output Nodes — Right, grouped by section */}
      {SECTIONS.map((section, si) => {
        const sectionTop = si * sectionHeight;
        return (
          <div key={section.label}>
            {/* Section header */}
            <div
              className="absolute"
              style={{
                left: colRight - 50,
                top: sectionTop + 4,
                zIndex: 2,
              }}
            >
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-blue-600">
                {section.label}
              </p>
            </div>

            {/* Section nodes */}
            {section.nodes.map((node, ni) => {
              const nodeY = getNodeY(si, ni);
              const Icon = node.icon;
              const isActive = activeNode === node.id;
              const state = nodeReadiness[node.id];
              const isReady = state === "ready";

              return (
                <button
                  key={node.id}
                  onClick={() => onNodeClick(node.id)}
                  className="absolute flex items-center gap-2.5 rounded-xl border px-4 py-2.5 cursor-pointer group"
                  style={{
                    left: colRight - 50,
                    top: nodeY - 20,
                    minWidth: 180,
                    background: isReady
                      ? `${node.color}15`
                      : isActive
                        ? `${node.color}10`
                        : "#ffffff",
                    borderColor: isReady
                      ? `${node.color}80`
                      : isActive
                        ? `${node.color}60`
                        : "#e2e8f0",
                    boxShadow: isReady
                      ? `0 0 24px ${node.color}20`
                      : isActive
                        ? `0 0 20px ${node.color}15`
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    zIndex: 2,
                    transition: "all 0.5s ease",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isReady ? `${node.color}20` : `${node.color}12`,
                      border: `1px solid ${isReady ? `${node.color}50` : `${node.color}30`}`,
                      transition: "all 0.4s ease",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-slate-900 group-hover:text-slate-700">{node.label}</p>
                    <p className="text-[8px] text-slate-400">
                      {isReady ? "✓ Data ready" : state === "processing" ? "Processing…" : "Click to explore →"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TxCard({ customer, color }: { customer: DemoCustomer; color: string }) {
  const initials = customer.profile.name.split(" ").map((w) => w[0]).join("");
  return (
    <div
      className="rounded-lg border p-2.5 bg-white"
      style={{ borderColor: `${color}25`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: `${color}30`, border: `1px solid ${color}50` }}
        >
          {initials}
        </div>
        <p className="text-[10px] font-semibold text-slate-900 truncate">{customer.profile.name}</p>
      </div>
      <div className="space-y-1">
        {customer.sampleTransactions.slice(0, 3).map((tx, i) => (
          <div key={i} className="flex justify-between text-[8px]">
            <span className="text-slate-500 truncate mr-1">{tx.merchant}</span>
            <span className="text-slate-700 shrink-0">{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
