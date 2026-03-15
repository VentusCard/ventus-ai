import { useEffect, useRef, useState } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import { BarChart3, Gift, Smartphone, Plane, TrendingUp, CalendarHeart } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";

export type DemoNodeType = "engagement" | "analytics" | "rewards" | "travel" | "lifeEvents" | "wealth" | "engine";

interface Props {
  customerA: DemoCustomer | null;
  customerB: DemoCustomer | null;
  activeNode: DemoNodeType | null;
  onNodeClick: (node: DemoNodeType) => void;
  nodeReadiness: NodeReadiness;
  inputReady: boolean;
  centered?: boolean;
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

// Geometry constants
const TX_CARD_WIDTH = 160;
const TX_CARD_ANCHOR = 40; // card renders at colLeft - TX_CARD_ANCHOR
const ENGINE_WIDTH = 160;
const SECTION_WIDTH = 210;
const SECTION_ANCHOR = 58; // section renders at colRight - SECTION_ANCHOR

const SECTIONS: SectionDef[] = [
  {
    label: "UX & Analytics",
    nodes: [
      { id: "engagement", label: "Personalized UX", icon: Smartphone, color: "#f59e0b" },
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

export default function DemoNetworkDiagram({ customerA, customerB, activeNode, onNodeClick, nodeReadiness, inputReady, centered = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // ResizeObserver for continuous tracking during flex transitions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute column positions with visual-bias compensation
  // Left extent: colLeft - TX_CARD_ANCHOR (left edge of tx cards)
  // Right extent: colRight - SECTION_ANCHOR + SECTION_WIDTH (right edge of sections)
  // Composition width = (colRight - SECTION_ANCHOR + SECTION_WIDTH) - (colLeft - TX_CARD_ANCHOR)
  // We want composition center = dims.w / 2

  let colLeft: number, colCenter: number, colRight: number;

  if (centered && dims.w > 0) {
    // Total composition spread: from left edge of tx cards to right edge of sections
    // Let's define spacing ratios between the three columns
    const compositionSpan = dims.w * 0.7; // use 70% of width for the composition
    const leftAnchor = (dims.w - compositionSpan) / 2 + TX_CARD_ANCHOR; // so left card edge starts at margin
    const rightAnchor = leftAnchor + compositionSpan - (SECTION_WIDTH - SECTION_ANCHOR); // so right section edge ends at margin
    const centerAnchor = (leftAnchor + rightAnchor) / 2;

    colLeft = leftAnchor;
    colCenter = centerAnchor;
    colRight = rightAnchor;

    // Clamp to prevent overflow
    const minLeft = TX_CARD_ANCHOR + 10;
    const maxRight = dims.w - (SECTION_WIDTH - SECTION_ANCHOR) - 10;
    if (colLeft < minLeft) colLeft = minLeft;
    if (colRight > maxRight) colRight = maxRight;
    colCenter = (colLeft + colRight) / 2;
  } else {
    colLeft = dims.w * 0.12;
    colCenter = dims.w * 0.48;
    colRight = dims.w * 0.85;
  }

  const midY = dims.h * 0.5;
  const inputAY = midY - 70;
  const inputBY = midY + 70;

  // Section container layout constants (grouped)
  const sectionGap = 12;
  const sectionPadTop = 28;
  const nodeHeight = 44;
  const nodeGap = 8;
  const sectionPadBottom = 12;
  const sectionContentHeight = sectionPadTop + nodeHeight * 2 + nodeGap + sectionPadBottom;
  const totalSectionsHeight = sectionContentHeight * 3 + sectionGap * 2;
  const sectionsStartY = (dims.h - totalSectionsHeight) / 2;

  const getSectionTop = (si: number) => sectionsStartY + si * (sectionContentHeight + sectionGap);
  const getNodeY = (sectionIdx: number, nodeIdx: number) => {
    const sectionTop = getSectionTop(sectionIdx);
    return sectionTop + sectionPadTop + nodeIdx * (nodeHeight + nodeGap) + nodeHeight / 2;
  };

  const anyProcessing = Object.values(nodeReadiness).some(s => s === "processing");
  const engineReady = nodeReadiness.engine === "ready";
  const engineProcessing = nodeReadiness.engine === "processing";
  const inputState: "idle" | "processing" | "ready" = engineReady ? "ready" : engineProcessing ? "processing" : "idle";

  // Flatten for SVG line rendering
  const nodePositions: { node: NodeDef; y: number }[] = [];
  SECTIONS.forEach((section, si) => {
    section.nodes.forEach((node, ni) => {
      nodePositions.push({ node, y: getNodeY(si, ni) });
    });
  });

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
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
      <div className="absolute" style={{ left: colLeft - TX_CARD_ANCHOR, top: inputAY - 50, width: TX_CARD_WIDTH, zIndex: 1 }}>
        <TxCard customer={customerA} color="#3b82f6" label="Customer A" />
      </div>
      <div className="absolute" style={{ left: colLeft - TX_CARD_ANCHOR, top: inputBY - 50, width: TX_CARD_WIDTH, zIndex: 1 }}>
        <TxCard customer={customerB} color="#10b981" label="Customer B" />
      </div>

      {/* Engine Node — Center */}
      <button
        onClick={() => { if (engineReady) onNodeClick("engine"); }}
        disabled={!engineReady}
        title={engineReady ? "View deep customer profile" : "Ventus AI Engine is still processing"}
        className={`absolute flex flex-col items-center justify-center rounded-2xl border bg-white group transition-shadow transition-opacity duration-300 ${engineReady ? "cursor-pointer hover:scale-[1.02] border-blue-300 border-2 shadow-[0_0_14px_rgba(147,197,253,0.3)]" : engineProcessing ? "cursor-not-allowed border-slate-200 opacity-90" : "cursor-not-allowed border-slate-100 opacity-80"}`}
        style={{
          left: colCenter - ENGINE_WIDTH / 2,
          top: midY - 100,
          width: ENGINE_WIDTH,
          height: 200,
          boxShadow: engineProcessing && !engineReady
            ? "0 0 30px rgba(99, 102, 241, 0.25)"
            : engineReady
              ? "0 0 20px rgba(34, 197, 94, 0.15)"
              : "0 4px 24px rgba(99, 102, 241, 0.1)",
          zIndex: 1,
        }}
      >
        <div className={`w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-2 border border-indigo-200 group-hover:bg-indigo-100 ${engineProcessing && !engineReady ? "animate-pulse" : ""}`}>
          <span className="text-indigo-600 text-lg font-bold">V</span>
        </div>
        <p className="text-[11px] font-bold text-slate-900 text-center mb-2">Ventus AI Engine</p>
        <div className="space-y-1 px-3">
          {ENGINE_FEATURES.map((f) => (
            <p key={f} className="text-[8px] text-slate-500 text-center leading-tight">{f}</p>
          ))}
        </div>
        <p className="text-[8px] text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to explore →</p>
      </button>

      {/* Output Nodes — Right, grouped by section */}
      {SECTIONS.map((section, si) => {
        const sectionTop = getSectionTop(si);
        return (
          <div
            key={section.label}
            className="absolute rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col p-3 pt-2"
            style={{
              left: colRight - SECTION_ANCHOR,
              top: sectionTop,
              width: SECTION_WIDTH,
              height: sectionContentHeight,
              zIndex: 2,
            }}
          >
            <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-blue-600 mb-2">
              {section.label}
            </p>

            <div className="flex flex-col gap-2">
              {section.nodes.map((node) => {
                const Icon = node.icon;
                const isActive = activeNode === node.id;
                const state = nodeReadiness[node.id];
                const isReady = state === "ready";
                const canOpen = engineReady && isReady;

                return (
                  <button
                    key={node.id}
                    onClick={() => { if (canOpen) onNodeClick(node.id); }}
                    disabled={!canOpen}
                    className="flex items-center gap-2.5 rounded-xl border px-3 py-2 group transition-shadow transition-opacity duration-300"
                    style={{
                      height: nodeHeight,
                      cursor: canOpen ? "pointer" : "not-allowed",
                      opacity: !engineReady ? 0.5 : canOpen ? 1 : 0.7,
                      background: canOpen
                        ? `${node.color}15`
                        : isActive
                          ? `${node.color}10`
                          : "#ffffff",
                      borderColor: canOpen
                        ? `${node.color}80`
                        : isActive
                          ? `${node.color}60`
                          : "#e2e8f0",
                      boxShadow: canOpen
                        ? `0 0 16px ${node.color}20`
                        : isActive
                          ? `0 0 12px ${node.color}15`
                          : "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: canOpen ? `${node.color}20` : `${node.color}12`,
                        border: `1px solid ${canOpen ? `${node.color}50` : `${node.color}30`}`,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-semibold text-slate-900 group-hover:text-slate-700">{node.label}</p>
                      <p className="text-[8px] text-slate-400">
                        {!engineReady ? "Waiting for Engine…" : isReady ? "✓ Data ready" : state === "processing" ? "Processing…" : "Click to explore →"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TxCard({ customer, color, label }: { customer: DemoCustomer | null; color: string; label: string }) {
  if (!customer) {
    return (
      <div
        className="rounded-lg border-2 border-dashed p-2.5 flex items-center justify-center"
        style={{ borderColor: `${color}40`, minHeight: 90 }}
      >
        <p className="text-[10px] font-medium text-slate-400">{label}</p>
      </div>
    );
  }

  const initials = customer.profile.name.split(" ").map((w) => w[0]).join("");
  return (
    <div
      className="rounded-lg border-2 p-2.5 bg-white"
      style={{ borderColor: `${color}50`, boxShadow: `0 0 12px ${color}20` }}
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
      <div className="space-y-0.5">
        <p className="text-[9px] font-mono text-slate-600">
          {customer.txnCount} txns · {customer.txnTotal}
        </p>
        <p className="text-[9px] font-mono text-slate-400">
          {customer.dateRange} · {customer.sourceCount} sources
        </p>
      </div>
    </div>
  );
}
