import { useEffect, useRef, useState } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import { BarChart3, Gift, Smartphone, Plane, TrendingUp, CalendarHeart, Search, Sparkles, Heart, Layers, GitBranch } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";

export type DemoNodeType = "engagement" | "analytics" | "rewards" | "travel" | "lifeEvents" | "wealth" | "engine" | "profiling" | "predictive" | "phase";

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

interface PillarDef {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Search;
  color: string;
  nodes: NodeDef[];
}

// Geometry constants — all nodes use center-based positioning
const TX_CARD_WIDTH = 160;
const TX_CARD_HEIGHT = 100;
const ENGINE_WIDTH = 190;
const ENGINE_HEIGHT = 220;
const PILLAR_WIDTH = 155;
const PILLAR_HEIGHT = 78;
const LEAF_NODE_WIDTH = 190;
const LEAF_NODE_HEIGHT = 44;
const LEAF_PAIR_OFFSET = 32;

// Horizontal gaps between column centers
const GAP_TX_ENGINE = 230;
const GAP_ENGINE_PILLAR = 225;
const GAP_PILLAR_LEAF = 220;

const PILLARS: PillarDef[] = [
  {
    id: "profiling",
    name: "Profiling",
    subtitle: "Who are they, where do they spend & move money?",
    icon: Search,
    color: "#3b82f6",
    nodes: [
      { id: "engagement", label: "Personalized UX", icon: Smartphone, color: "#f59e0b" },
      { id: "analytics", label: "Bank-Wide Analytics", icon: BarChart3, color: "#3b82f6" },
    ],
  },
  {
    id: "predictive",
    name: "Predictive",
    subtitle: "What will they spend on next & how do we reward it?",
    icon: Sparkles,
    color: "#22c55e",
    nodes: [
      { id: "rewards", label: "Consumer Rewards", icon: Gift, color: "#22c55e" },
      { id: "travel", label: "Travel Experiences", icon: Plane, color: "#06b6d4" },
    ],
  },
  {
    id: "phase",
    name: "Phase",
    subtitle: "Where are they in their journey & what's their next product?",
    icon: Heart,
    color: "#a855f7",
    nodes: [
      { id: "lifeEvents", label: "Financial Journey", icon: CalendarHeart, color: "#ec4899" },
      { id: "wealth", label: "Wealth Management", icon: TrendingUp, color: "#a855f7" },
    ],
  },
];

const ENGINE_CAPABILITIES = [
  { label: "Semantic Enrichment", icon: Layers, color: "#6366f1" },
  { label: "Cross-category Patterns", icon: GitBranch, color: "#8b5cf6" },
  { label: "Deep Purchase Analysis", icon: Search, color: "#a78bfa" },
];

export default function DemoNetworkDiagram({ customerA, customerB, activeNode, onNodeClick, nodeReadiness, inputReady, centered = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

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

  // ── Center-based layout: compute 4 column centers, then center the whole frame ──
  const totalContentWidth = TX_CARD_WIDTH / 2 + GAP_TX_ENGINE + GAP_ENGINE_PILLAR + GAP_PILLAR_LEAF + LEAF_NODE_WIDTH / 2;
  const contentLeft = Math.max(20, (dims.w - totalContentWidth) / 2);

  const txCenterX = contentLeft + TX_CARD_WIDTH / 2;
  const engineCenterX = txCenterX + GAP_TX_ENGINE;
  const pillarCenterX = engineCenterX + GAP_ENGINE_PILLAR;
  const leafCenterX = pillarCenterX + GAP_PILLAR_LEAF;

  // ── Vertical layout: clamped band, not raw viewport scaling ──
  const midY = dims.h * 0.5;
  const pillarSpacing = Math.min(Math.max(dims.h * 0.22, 100), 180);
  const getPillarY = (pi: number) => midY + (pi - 1) * pillarSpacing;

  const inputAY = midY - 55;
  const inputBY = midY + 55;

  const getNodeY = (pillarIdx: number, nodeIdx: number) => {
    const pillarY = getPillarY(pillarIdx);
    return nodeIdx === 0 ? pillarY - LEAF_PAIR_OFFSET : pillarY + LEAF_PAIR_OFFSET;
  };

  const engineReady = nodeReadiness.engine === "ready";
  const engineProcessing = nodeReadiness.engine === "processing";
  const inputState: "idle" | "processing" | "ready" = engineReady ? "ready" : engineProcessing ? "processing" : "idle";


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
            {/* Input lines: left cards → engine */}
            {[inputAY, inputBY].map((y, i) => {
              const txRight = txCenterX + TX_CARD_WIDTH / 2;
              const engineLeft = engineCenterX - ENGINE_WIDTH / 2;
              const path = `M ${txRight} ${y} C ${(txRight + engineLeft) / 2} ${y}, ${(txRight + engineLeft) / 2} ${midY}, ${engineLeft} ${midY}`;
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

            {/* Engine → 3 pillar nodes */}
            {PILLARS.map((pillar, pi) => {
              const pillarY = getPillarY(pi);
              const engineRight = engineCenterX + ENGINE_WIDTH / 2;
              const pillarLeft = pillarCenterX - PILLAR_WIDTH / 2;
              const cpX = (engineRight + pillarLeft) / 2;
              const path = `M ${engineRight} ${midY} C ${cpX} ${midY}, ${cpX} ${pillarY}, ${pillarLeft} ${pillarY}`;
              const pillarReady = engineReady;
              const pillarProcessing = engineProcessing;

              return (
                <g key={`eng-pil-${pi}`}>
                  <path
                    d={path}
                    stroke={pillar.color}
                    strokeWidth={pillarReady ? 2.5 : 1.5}
                    fill="none"
                    opacity={pillarReady ? 0.7 : 0.2}
                    strokeDasharray={pillarReady ? "none" : "6 4"}
                    className="line-transition"
                  />
                  {pillarProcessing && !pillarReady && (
                    <circle r="2.5" fill={pillar.color}>
                      <animateMotion dur={`${2.5 + pi * 0.4}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                  {pillarReady && (
                    <circle r="3" fill={pillar.color} opacity="0.5">
                      <animateMotion dur={`${3.5 + pi * 0.3}s`} repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Pillar → leaf node lines */}
            {PILLARS.map((pillar, si) => {
              const pillarY = getPillarY(si);
              const pillarRight = pillarCenterX + PILLAR_WIDTH / 2;
              const leafLeft = leafCenterX - LEAF_NODE_WIDTH / 2;
              return pillar.nodes.map((node, ni) => {
                const nodeY = getNodeY(si, ni);
                const cpX = (pillarRight + leafLeft) / 2;
                const path = `M ${pillarRight} ${pillarY} C ${cpX} ${pillarY}, ${cpX} ${nodeY}, ${leafLeft} ${nodeY}`;
                const state = nodeReadiness[node.id];
                const isReady = state === "ready";
                const isProcessingNode = state === "processing";

                return (
                  <g key={`pil-leaf-${si}-${ni}`}>
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
                        <animateMotion dur={`${2 + ni * 0.4}s`} repeatCount="indefinite" path={path} />
                      </circle>
                    )}
                    {isReady && (
                      <circle r="3" fill={node.color} opacity="0.6">
                        <animateMotion dur={`${3 + ni * 0.3}s`} repeatCount="indefinite" path={path} />
                      </circle>
                    )}
                  </g>
                );
              });
            })}
          </>
        )}
      </svg>

      {/* Transaction Cards — Left */}
      <div className="absolute" style={{ left: txCenterX - TX_CARD_WIDTH / 2, top: inputAY - TX_CARD_HEIGHT / 2, width: TX_CARD_WIDTH, zIndex: 1 }}>
        <TxCard customer={customerA} color="#3b82f6" label="Customer A" />
      </div>
      <div className="absolute" style={{ left: txCenterX - TX_CARD_WIDTH / 2, top: inputBY - TX_CARD_HEIGHT / 2, width: TX_CARD_WIDTH, zIndex: 1 }}>
        <TxCard customer={customerB} color="#10b981" label="Customer B" />
      </div>

      {/* Engine Node — Center */}
      <button
        onClick={() => { if (engineReady) onNodeClick("engine"); }}
        disabled={!engineReady}
        title={engineReady ? "View deep customer profile" : "Ventus AI Engine is still processing"}
        className={`absolute flex flex-col items-center justify-center rounded-2xl border bg-white group transition-shadow transition-opacity duration-300 ${engineReady ? "cursor-pointer hover:scale-[1.02] border-blue-300 border-2 shadow-[0_0_14px_rgba(147,197,253,0.3)]" : engineProcessing ? "cursor-not-allowed border-slate-200 opacity-90" : "cursor-not-allowed border-slate-100 opacity-80"}`}
        style={{
          left: engineCenterX - ENGINE_WIDTH / 2,
          top: midY - ENGINE_HEIGHT / 2,
          width: ENGINE_WIDTH,
          height: ENGINE_HEIGHT,
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
        <div className="flex flex-col gap-1.5 px-2 w-full">
          {ENGINE_CAPABILITIES.map((cap, ci) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border transition-all duration-300 ${engineProcessing && !engineReady ? "animate-pulse" : ""}`}
                style={{
                  background: engineReady ? `${cap.color}15` : `${cap.color}08`,
                  borderColor: engineReady ? `${cap.color}40` : `${cap.color}20`,
                  animationDelay: engineProcessing ? `${ci * 0.3}s` : undefined,
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cap.color }} />
                <span className="text-[9px] font-semibold" style={{ color: engineReady ? cap.color : "#64748b" }}>{cap.label}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[8px] text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to explore →</p>
      </button>

      {/* Pillar Nodes — Middle column */}
      {PILLARS.map((pillar, pi) => {
        const pillarY = getPillarY(pi);
        const Icon = pillar.icon;
        const pillarReady = engineReady;

        return (
          <button
            key={pillar.id}
            onClick={() => { if (pillarReady) onNodeClick(pillar.id as DemoNodeType); }}
            disabled={!pillarReady}
            className="absolute flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2 group transition-all duration-300"
            style={{
              left: pillarCenterX - PILLAR_WIDTH / 2,
              top: pillarY - PILLAR_HEIGHT / 2,
              width: PILLAR_WIDTH,
              height: PILLAR_HEIGHT,
              zIndex: 2,
              cursor: pillarReady ? "pointer" : "not-allowed",
              borderColor: pillarReady ? `${pillar.color}60` : "#e2e8f0",
              borderLeftWidth: 3,
              borderLeftColor: pillar.color,
              background: pillarReady ? `${pillar.color}08` : "#ffffff",
              boxShadow: pillarReady
                ? `0 0 16px ${pillar.color}15`
                : "0 1px 3px rgba(0,0,0,0.06)",
              opacity: engineReady ? 1 : engineProcessing ? 0.7 : 0.5,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${pillar.color}15`,
                border: `1px solid ${pillar.color}30`,
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: pillar.color }} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] font-bold text-slate-900 leading-tight">{pillar.name}</p>
              <p className="text-[8px] text-slate-400 leading-tight truncate">{pillar.subtitle}</p>
            </div>
            <p className="absolute -bottom-0.5 right-2 text-[7px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Click to explore →</p>
          </button>
        );
      })}

      {/* Output Nodes — Right, ungrouped */}
      {PILLARS.map((pillar, si) =>
        pillar.nodes.map((node, ni) => {
          const nodeY = getNodeY(si, ni);
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
              className="absolute flex items-center gap-2.5 rounded-xl border px-3 py-2 group transition-shadow transition-opacity duration-300"
              style={{
                left: leafCenterX - LEAF_NODE_WIDTH / 2,
                top: nodeY - LEAF_NODE_HEIGHT / 2,
                width: LEAF_NODE_WIDTH,
                height: LEAF_NODE_HEIGHT,
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
                zIndex: 2,
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
        })
      )}
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
      <div className="space-y-0.5 overflow-hidden">
        <p className="text-[8px] font-mono text-slate-600 truncate">
          {customer.txnCount} txns · {customer.txnTotal}
        </p>
        <p className="text-[8px] font-mono text-slate-400 truncate">
          {customer.dateRange} · {customer.sourceCount} sources
        </p>
      </div>
    </div>
  );
}
