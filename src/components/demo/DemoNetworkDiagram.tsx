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

// Geometry base constants — scaled by `centered` prop
const BASE_TX_CARD_HEIGHT = 110;
const BASE_ENGINE_HEIGHT = 245;
const BASE_GRID_ROW_HEIGHT = 100;
const BASE_GRID_HEADER_HEIGHT = 32;

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

  // ── Scale factor for stage-ready presentation ──
  const scale = centered ? 1.25 : 1.0;

  const TX_CARD_WIDTH = Math.max(140, Math.min(180 * scale, dims.w * 0.15 * scale));
  const TX_CARD_HEIGHT = BASE_TX_CARD_HEIGHT * scale;
  const ENGINE_WIDTH = Math.max(160, Math.min(210 * scale, dims.w * 0.18 * scale));
  const ENGINE_HEIGHT = BASE_ENGINE_HEIGHT * scale;
  const GRID_WIDTH = Math.max(320, Math.min(480 * scale, dims.w * 0.40 * scale));
  const GRID_ROW_HEIGHT = BASE_GRID_ROW_HEIGHT * scale;
  const GRID_HEADER_HEIGHT = BASE_GRID_HEADER_HEIGHT * scale;

  // ── Horizontal layout — centered when panel collapsed ──
  const pad = Math.max(12, dims.w * 0.03);
  const gap1 = Math.max(30, dims.w * 0.04) * scale;
  const gap2 = Math.max(30, dims.w * 0.04) * scale;
  const totalContentWidth = TX_CARD_WIDTH + gap1 + ENGINE_WIDTH + gap2 + GRID_WIDTH;
  const offsetX = centered ? (dims.w - totalContentWidth) / 2 : pad;

  const txCenterX = offsetX + TX_CARD_WIDTH / 2;
  const engineCenterX = offsetX + TX_CARD_WIDTH + gap1 + ENGINE_WIDTH / 2;
  const gridLeftX = offsetX + TX_CARD_WIDTH + gap1 + ENGINE_WIDTH + gap2;

  // ── Vertical layout ──
  const midY = dims.h * 0.5;
  const totalGridHeight = GRID_HEADER_HEIGHT + GRID_ROW_HEIGHT * 3;
  const gridTopY = midY - totalGridHeight / 2;

  const txSpread = centered ? 70 : 55;
  const inputAY = midY - txSpread;
  const inputBY = midY + txSpread;

  // Row center Y positions (relative to container)
  const getRowCenterY = (rowIdx: number) => gridTopY + GRID_HEADER_HEIGHT + GRID_ROW_HEIGHT * rowIdx + GRID_ROW_HEIGHT / 2;

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

            {/* Engine → 3 grid rows */}
            {PILLARS.map((pillar, pi) => {
              const rowCenterY = getRowCenterY(pi);
              const engineRight = engineCenterX + ENGINE_WIDTH / 2;
              const cpX = (engineRight + gridLeftX) / 2;
              const path = `M ${engineRight} ${midY} C ${cpX} ${midY}, ${cpX} ${rowCenterY}, ${gridLeftX} ${rowCenterY}`;
              const pillarReady = engineReady;
              const pillarProcessing = engineProcessing;

              return (
                <g key={`eng-row-${pi}`}>
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
          </>
        )}
      </svg>

      {/* Transaction Cards — Left */}
      <div className="absolute" style={{ left: txCenterX - TX_CARD_WIDTH / 2, top: inputAY - TX_CARD_HEIGHT / 2, width: TX_CARD_WIDTH, zIndex: 1 }}>
        <TxCard customer={customerA} color="#3b82f6" label="Customer A" scaled={centered} />
      </div>
      <div className="absolute" style={{ left: txCenterX - TX_CARD_WIDTH / 2, top: inputBY - TX_CARD_HEIGHT / 2, width: TX_CARD_WIDTH, zIndex: 1 }}>
        <TxCard customer={customerB} color="#10b981" label="Customer B" scaled={centered} />
      </div>

      {/* Engine Node — Center */}
      <button
        onClick={() => { if (engineReady) onNodeClick("engine"); }}
        disabled={!engineReady}
        title={engineReady ? "View deep customer profile" : "Ventus AI Engine is still processing"}
        className={`absolute flex flex-col items-center justify-center rounded-2xl border bg-white group transition-[box-shadow,opacity,border-color] duration-300 ${engineReady ? "cursor-pointer hover:scale-[1.02] border-blue-300 border-2 shadow-[0_0_14px_rgba(147,197,253,0.3)]" : engineProcessing ? "cursor-not-allowed border-slate-200 opacity-90" : "cursor-not-allowed border-slate-100 opacity-80"}`}
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
        <div className={`${centered ? "w-14 h-14" : "w-11 h-11"} rounded-xl bg-indigo-50 flex items-center justify-center mb-2 border border-indigo-200 group-hover:bg-indigo-100 ${engineProcessing && !engineReady ? "animate-pulse" : ""}`}>
          <span className={`text-indigo-600 font-bold ${centered ? "text-2xl" : "text-xl"}`}>V</span>
        </div>
        <p className={`font-bold text-slate-900 text-center mb-2 ${centered ? "text-[14px]" : "text-[12px]"}`}>Ventus AI Engine</p>
        <div className="flex flex-col gap-1.5 px-2 w-full">
          {ENGINE_CAPABILITIES.map((cap, ci) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.label}
                className={`flex items-center gap-2 rounded-lg px-2 ${centered ? "py-2" : "py-1.5"} border transition-all duration-300 ${engineProcessing && !engineReady ? "animate-pulse" : ""}`}
                style={{
                  background: engineReady ? `${cap.color}15` : `${cap.color}08`,
                  borderColor: engineReady ? `${cap.color}40` : `${cap.color}20`,
                  animationDelay: engineProcessing ? `${ci * 0.3}s` : undefined,
                }}
              >
                <Icon className={`${centered ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} shrink-0`} style={{ color: cap.color }} />
                <span className={`font-semibold ${centered ? "text-[12px]" : "text-[10px]"}`} style={{ color: engineReady ? cap.color : "#64748b" }}>{cap.label}</span>
              </div>
            );
          })}
        </div>
        <p className={`text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${centered ? "text-[10px]" : "text-[8px]"}`}>Click to explore →</p>
      </button>

      {/* 3x2 Grid — Right side */}
      <div
        className="absolute"
        style={{
          left: gridLeftX,
          top: gridTopY,
          width: GRID_WIDTH,
          height: totalGridHeight,
          zIndex: 2,
        }}
      >
        {/* Column Headers */}
        <div className="flex" style={{ height: GRID_HEADER_HEIGHT }}>
          <div style={{ width: '50%' }} className="flex items-end justify-center pb-1">
            <span className={`font-bold uppercase tracking-widest text-slate-400 ${centered ? "text-[12px]" : "text-[10px]"}`}>Consumer Facing</span>
          </div>
          <div style={{ width: '50%' }} className="flex items-end justify-center pb-1">
            <span className={`font-bold uppercase tracking-widest text-slate-400 ${centered ? "text-[12px]" : "text-[10px]"}`}>Bank Facing</span>
          </div>
        </div>

        {/* 3 Rows */}
        {PILLARS.map((pillar, pi) => {
          const PillarIcon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="border-t"
              style={{
                height: GRID_ROW_HEIGHT,
                borderColor: `${pillar.color}20`,
              }}
            >
              {/* Question row */}
              <div className={`flex items-center gap-1.5 px-2 ${centered ? "pt-3 pb-1.5" : "pt-2 pb-1"}`}>
                <PillarIcon className={`${centered ? "w-4 h-4" : "w-3 h-3"} shrink-0`} style={{ color: pillar.color }} />
                <span className={`font-medium ${centered ? "text-[11px]" : "text-[9px]"}`} style={{ color: pillar.color }}>{pillar.subtitle}</span>
              </div>

              {/* Two node buttons side by side */}
              <div className={`flex gap-2 px-2 ${centered ? "gap-3 px-3" : ""}`}>
                {pillar.nodes.map((node) => {
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
                      className={`flex-1 flex items-center gap-2 rounded-xl border ${centered ? "px-4 py-3" : "px-3 py-2"} group transition-[box-shadow,opacity,border-color] duration-300`}
                      style={{
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
                        className={`${centered ? "w-9 h-9" : "w-7 h-7"} rounded-lg flex items-center justify-center shrink-0`}
                        style={{
                          background: canOpen ? `${node.color}20` : `${node.color}12`,
                          border: `1px solid ${canOpen ? `${node.color}50` : `${node.color}30`}`,
                        }}
                      >
                        <Icon className={`${centered ? "w-4.5 h-4.5" : "w-3.5 h-3.5"}`} style={{ color: node.color }} />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-semibold text-slate-900 group-hover:text-slate-700 truncate ${centered ? "text-[13px]" : "text-[11px]"}`}>{node.label}</p>
                        <p className={`text-slate-400 truncate ${centered ? "text-[11px]" : "text-[9px]"}`}>
                          {!engineReady ? "Waiting…" : isReady ? "✓ Ready" : state === "processing" ? "Processing…" : "Explore →"}
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
    </div>
  );
}

function TxCard({ customer, color, label, scaled }: { customer: DemoCustomer | null; color: string; label: string; scaled?: boolean }) {
  if (!customer) {
    return (
      <div
        className={`rounded-lg border-2 border-dashed ${scaled ? "p-3" : "p-2.5"} flex items-center justify-center`}
        style={{ borderColor: `${color}40`, minHeight: scaled ? 110 : 90 }}
      >
        <p className={`font-medium text-slate-400 ${scaled ? "text-[13px]" : "text-[11px]"}`}>{label}</p>
      </div>
    );
  }

  const initials = customer.profile.name.split(" ").map((w) => w[0]).join("");
  return (
    <div
      className={`rounded-lg border-2 ${scaled ? "p-3" : "p-2.5"} bg-white`}
      style={{ borderColor: `${color}50`, boxShadow: `0 0 12px ${color}20` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`${scaled ? "w-8 h-8 text-[11px]" : "w-6 h-6 text-[9px]"} rounded-full flex items-center justify-center font-bold text-white`}
          style={{ background: `${color}30`, border: `1px solid ${color}50` }}
        >
          {initials}
        </div>
        <p className={`font-semibold text-slate-900 truncate ${scaled ? "text-[13px]" : "text-[11px]"}`}>{customer.profile.name}</p>
      </div>
      <div className="space-y-0.5 overflow-hidden">
        <p className={`font-mono text-slate-600 truncate ${scaled ? "text-[11px]" : "text-[9px]"}`}>
          {customer.txnCount} txns · {customer.txnTotal}
        </p>
        <p className={`font-mono text-slate-400 truncate ${scaled ? "text-[11px]" : "text-[9px]"}`}>
          {customer.dateRange} · {customer.sourceCount} sources
        </p>
      </div>
    </div>
  );
}
