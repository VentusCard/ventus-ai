import { useEffect, useRef, useState, useMemo } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import { BarChart3, Gift, Smartphone, Plane, TrendingUp, CalendarHeart, Search, Sparkles, Heart, Layers, GitBranch, MapPin, ArrowDownRight, Briefcase, ArrowUpRight, Brain, Target } from "lucide-react";
import type { NodeReadiness } from "@/hooks/useDemoEnrichment";
import { MODULE_ROW_MAP, type ModuleKey } from "@/types/demo";

export type DemoNodeType = "engagement" | "analytics" | "rewards" | "travel" | "lifeEvents" | "wealth" | "engine" | "profiling" | "predictive" | "phase" | "outflow" | "locational" | "lifeEventIntel" | "wmCopilot" | "aiFinancialInsights" | "dealPersonalization";

interface Props {
  customer: DemoCustomer | null;
  activeNode: DemoNodeType | null;
  onNodeClick: (node: DemoNodeType) => void;
  nodeReadiness: NodeReadiness;
  inputReady: boolean;
  centered?: boolean;
  onTxCardClick?: () => void;
  enabledModules: Set<ModuleKey>;
}

interface NodeDef {
  id: DemoNodeType;
  label: string;
  icon: typeof BarChart3;
  color: string;
  audience: "consumer" | "bank";
}

interface PillarRow {
  id: string;
  subtitle: string;
  team: string;
  icon: typeof Search;
  color: string;
  bankNodes: NodeDef[];
  consumerNode: NodeDef;
}

const BASE_TX_CARD_HEIGHT = 60;
const BASE_ENGINE_MIN_HEIGHT = 140;

const AUDIENCE_ACCENT = {
  consumer: "border-l-amber-400",
  bank: "border-l-blue-400",
} as const;

const PILLAR_ROWS: PillarRow[] = [
  {
    id: "profiling",
    team: "Analytics",
    subtitle: "Where do our customers spend their money?",
    icon: Search,
    color: "#3b82f6",
    bankNodes: [
      { id: "analytics", label: "Multi-Category Lifestyle Pillars", icon: BarChart3, color: "#3b82f6", audience: "bank" },
      { id: "outflow", label: "ACH & Outflow Analysis", icon: ArrowDownRight, color: "#3b82f6", audience: "bank" },
      { id: "aiFinancialInsights", label: "AI Financial Insights", icon: Brain, color: "#3b82f6", audience: "bank" },
    ],
    consumerNode: { id: "engagement", label: "Personalized UX", icon: Smartphone, color: "#3b82f6", audience: "consumer" },
  },
  {
    id: "predictive",
    team: "Rewards",
    subtitle: "How can we support and reward their life style?",
    icon: Sparkles,
    color: "#22c55e",
      bankNodes: [
       { id: "travel", label: "Next-Purchase Intelligence", icon: Plane, color: "#22c55e", audience: "bank" },
       { id: "locational", label: "Travel & Perk Aggregation", icon: MapPin, color: "#22c55e", audience: "bank" },
       { id: "dealPersonalization", label: "Deep Personalization", icon: Target, color: "#22c55e", audience: "bank" },
     ],
    consumerNode: { id: "rewards", label: "Personalized Rewards", icon: Gift, color: "#22c55e", audience: "consumer" },
  },
  {
    id: "phase",
    team: "Growth & Wealth",
    subtitle: "What's their next product to live a better life?",
    icon: Heart,
    color: "#ec4899",
    bankNodes: [
      { id: "lifeEventIntel", label: "Life Event Detection", icon: CalendarHeart, color: "#ec4899", audience: "bank" },
      { id: "lifeEvents", label: "Next-Product Automation", icon: TrendingUp, color: "#ec4899", audience: "bank" },
      { id: "wmCopilot", label: "Advisor CoPilot Suite", icon: Briefcase, color: "#ec4899", audience: "bank" },
    ],
    consumerNode: { id: "wealth", label: "Personalized Relationship", icon: TrendingUp, color: "#ec4899", audience: "consumer" },
  },
];

const ENGINE_CAPABILITIES = [
  { label: "Semantic Enrichment", icon: Layers, color: "#6366f1" },
  { label: "Cross-category Patterns", icon: GitBranch, color: "#8b5cf6" },
  { label: "Deep Purchase Analysis", icon: Search, color: "#a78bfa" },
];

const IMPACT_METRICS: { metrics: string[]; color: string }[] = [
  { metrics: ["Higher Engagement", "Higher App Usage", "Higher NPS"], color: "#3b82f6" },
  { metrics: ["Higher Redemption", "Higher Spend Lift", "High Profitability"], color: "#22c55e" },
  { metrics: ["Higher Cross-Sell", "Higher AUM Growth", "Higher Lifetime Value", "Higher Advisor Effectiveness"], color: "#ec4899" },
];

export default function DemoNetworkDiagram({ customer, activeNode, onNodeClick, nodeReadiness, inputReady, centered = false, onTxCardClick, enabledModules }: Props) {
  const visibleRows = useMemo(() => PILLAR_ROWS.filter(row => {
    const mod = MODULE_ROW_MAP[row.id];
    return mod ? enabledModules.has(mod) : true;
  }), [enabledModules]);

  const visibleImpactMetrics = useMemo(() => {
    return PILLAR_ROWS.map((row, i) => ({ ...IMPACT_METRICS[i], rowId: row.id }))
      .filter(item => {
        const mod = MODULE_ROW_MAP[item.rowId];
        return mod ? enabledModules.has(mod) : true;
      });
  }, [enabledModules]);
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

  const scale = centered ? 1.25 : 1.0;

  // Compact widths for open-panel (~790px), larger for centered (~full width)
  const TX_CARD_WIDTH = centered ? Math.min(220, dims.w * 0.14) : Math.min(160, Math.max(130, dims.w * 0.16));
  const TX_CARD_HEIGHT = BASE_TX_CARD_HEIGHT * scale;
  const ENGINE_WIDTH = centered ? Math.min(240, dims.w * 0.16) : Math.min(175, Math.max(150, dims.w * 0.18));
  const ENGINE_MIN_HEIGHT = BASE_ENGINE_MIN_HEIGHT * scale;

  const BANK_COL_WIDTH = centered ? Math.min(260, dims.w * 0.18) : Math.min(170, Math.max(140, dims.w * 0.18));
  const CONSUMER_COL_WIDTH = centered ? Math.min(240, dims.w * 0.16) : Math.min(150, Math.max(120, dims.w * 0.16));

  const ROW_HEIGHT = Math.max(145, 168 * scale);
  const BANK_NODE_HEIGHT = Math.max(32, 36 * scale);
  const BANK_NODE_GAP = Math.max(4, 6 * scale);
  const CONSUMER_NODE_HEIGHT = Math.max(54, 70 * scale);
  const QUESTION_LABEL_HEIGHT = centered ? 32 : 24;

  // Horizontal gaps — tight on left, generous on right
  const gap1 = centered ? 70 : Math.max(14, dims.w * 0.018);
  const gap2 = centered ? 80 : Math.max(28, dims.w * 0.035);
  const gap3 = centered ? 75 : Math.max(24, dims.w * 0.03);
  const gap4 = centered ? 65 : Math.max(18, dims.w * 0.022);

  const IMPACT_COL_WIDTH = centered ? Math.min(200, dims.w * 0.14) : Math.min(130, Math.max(105, dims.w * 0.13));

  // Dynamic centering: shift everything right when impact column is hidden
  const anyImpactVisible = PILLAR_ROWS.some(p => nodeReadiness[p.consumerNode.id] === "ready");
  const pad = Math.max(8, dims.w * 0.01);
  const totalContentWidth = TX_CARD_WIDTH + gap1 + ENGINE_WIDTH + gap2 + BANK_COL_WIDTH + gap3 + CONSUMER_COL_WIDTH + gap4 + IMPACT_COL_WIDTH;
  const offsetX = Math.max(pad, (dims.w - totalContentWidth) / 2);
  // When impact is hidden, shift diagram right to center the visible 4 columns
  const centeringShift = anyImpactVisible ? 0 : (gap4 + IMPACT_COL_WIDTH) / 2;

  const txCenterX = offsetX + TX_CARD_WIDTH / 2;
  const engineCenterX = offsetX + TX_CARD_WIDTH + gap1 + ENGINE_WIDTH / 2;
  const bankColLeftX = offsetX + TX_CARD_WIDTH + gap1 + ENGINE_WIDTH + gap2;
  const consumerColLeftX = bankColLeftX + BANK_COL_WIDTH + gap3;
  const impactColLeftX = consumerColLeftX + CONSUMER_COL_WIDTH + gap4;

  // Vertical layout
  const midY = dims.h * 0.5;
  const totalGridHeight = ROW_HEIGHT * 3;
  const gridTopY = midY - totalGridHeight / 2 + 20;

  const txSpread = centered ? 85 : 55;
  const inputAY = midY - txSpread;
  const inputBY = midY + txSpread;

  const getRowCenterY = (rowIdx: number) => gridTopY + ROW_HEIGHT * rowIdx + ROW_HEIGHT / 2;

  const engineReady = nodeReadiness.engine === "ready";
  const engineProcessing = nodeReadiness.engine === "processing";
  const inputState: "idle" | "processing" | "ready" = engineReady ? "ready" : engineProcessing ? "processing" : "idle";

  return (
    <div ref={containerRef} className="relative w-full h-full">
     <div className="absolute inset-0" style={{ transform: `translateX(${centeringShift}px)`, transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
            {/* Input lines: TX cards → engine */}
            {(() => {
              const txRight = txCenterX + TX_CARD_WIDTH / 2;
              const engineLeft = engineCenterX - ENGINE_WIDTH / 2;
              const path = `M ${txRight} ${midY} C ${(txRight + engineLeft) / 2} ${midY}, ${(txRight + engineLeft) / 2} ${midY}, ${engineLeft} ${midY}`;
              const isReady = inputState === "ready";
              const isProcessingLine = inputState === "processing";
              return (
                <g>
                  <path
                    d={path}
                    stroke="#6366f1"
                    strokeWidth={isReady ? 2.5 : 1.5}
                    fill="none"
                    opacity={isReady ? 0.7 : 0.2}
                    strokeDasharray={isReady ? "none" : "6 4"}
                    className="line-transition"
                  />
                  {isProcessingLine && (
                    <circle r="2.5" fill="#6366f1">
                      <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                  {isReady && (
                    <circle r="2" fill="#6366f1" opacity="0.5">
                      <animateMotion dur="4s" repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })()}

            {/* Engine → Bank column rows */}
            {PILLAR_ROWS.map((pillar, pi) => {
              const rowCenterY = getRowCenterY(pi);
              const bankNodesH = BANK_NODE_HEIGHT * pillar.bankNodes.length + BANK_NODE_GAP * (pillar.bankNodes.length - 1);
              const cHeight = Math.max(bankNodesH, CONSUMER_NODE_HEIGHT);
              const contentTop = rowCenterY - cHeight / 2;
              const engineRight = engineCenterX + ENGINE_WIDTH / 2;
              const pillarReady = engineReady;
              const pillarProcessing = engineProcessing;

              return pillar.bankNodes.map((_, ni) => {
                const bankNodeY = contentTop + ni * (BANK_NODE_HEIGHT + BANK_NODE_GAP) + BANK_NODE_HEIGHT / 2;
                const cpX = (engineRight + bankColLeftX) / 2;
                const path = `M ${engineRight} ${midY} C ${cpX} ${midY}, ${cpX} ${bankNodeY}, ${bankColLeftX} ${bankNodeY}`;
                return (
                  <g key={`eng-bank-${pi}-${ni}`}>
                    <path d={path} stroke={pillar.color} strokeWidth={pillarReady ? 2.5 : 1.5} fill="none" opacity={pillarReady ? 0.7 : 0.2} strokeDasharray={pillarReady ? "none" : "6 4"} className="line-transition" />
                    {pillarProcessing && !pillarReady && (
                      <circle r="2.5" fill={pillar.color}><animateMotion dur={`${2.5 + pi * 0.4 + ni * 0.2}s`} repeatCount="indefinite" path={path} /></circle>
                    )}
                    {pillarReady && (
                      <circle r="3" fill={pillar.color} opacity="0.5"><animateMotion dur={`${3.5 + pi * 0.3 + ni * 0.15}s`} repeatCount="indefinite" path={path} /></circle>
                    )}
                  </g>
                );
              });
            })}

            {/* Bank column → Consumer column (one line per bank node) */}
            {PILLAR_ROWS.map((pillar, pi) => {
              const rCenterY = gridTopY + ROW_HEIGHT * pi + ROW_HEIGHT / 2;
              const bankNodesH = BANK_NODE_HEIGHT * pillar.bankNodes.length + BANK_NODE_GAP * (pillar.bankNodes.length - 1);
              const cHeight = Math.max(bankNodesH, CONSUMER_NODE_HEIGHT);
              const cTop = rCenterY - cHeight / 2;
              const bankRight = bankColLeftX + BANK_COL_WIDTH;
              const consumerLeft = consumerColLeftX;
              const consumerCenterY = cTop + (cHeight - CONSUMER_NODE_HEIGHT) / 2 + CONSUMER_NODE_HEIGHT / 2;
              const consumerReady = engineReady && nodeReadiness[pillar.consumerNode.id] === "ready";

              return pillar.bankNodes.map((node, ni) => {
                const bankNodeY = cTop + ni * (BANK_NODE_HEIGHT + BANK_NODE_GAP) + BANK_NODE_HEIGHT / 2;
                const cpX1 = bankRight + (consumerLeft - bankRight) * 0.4;
                const cpX2 = bankRight + (consumerLeft - bankRight) * 0.6;
                const path = `M ${bankRight} ${bankNodeY} C ${cpX1} ${bankNodeY}, ${cpX2} ${consumerCenterY}, ${consumerLeft} ${consumerCenterY}`;
                return (
                  <g key={`bank-cons-${pi}-${ni}`}>
                    <path d={path} stroke={pillar.consumerNode.color} strokeWidth={consumerReady ? 2 : 1} fill="none" opacity={consumerReady ? 0.6 : 0.15} strokeDasharray={consumerReady ? "none" : "4 3"} className="line-transition" />
                  </g>
                );
              });
            })}

            {/* Consumer column → Impact column */}
            {PILLAR_ROWS.map((pillar, pi) => {
              const rCenterY = gridTopY + ROW_HEIGHT * pi + ROW_HEIGHT / 2;
              const bankNodesH = BANK_NODE_HEIGHT * pillar.bankNodes.length + BANK_NODE_GAP * (pillar.bankNodes.length - 1);
              const cHeight = Math.max(bankNodesH, CONSUMER_NODE_HEIGHT);
              const cTop = rCenterY - cHeight / 2;
              const consumerRight = consumerColLeftX + CONSUMER_COL_WIDTH;
              const consumerCenterY = cTop + (cHeight - CONSUMER_NODE_HEIGHT) / 2 + CONSUMER_NODE_HEIGHT / 2;
              const impactLeft = impactColLeftX;
              const consumerReady = engineReady && nodeReadiness[pillar.consumerNode.id] === "ready";
              const cpX1 = consumerRight + (impactLeft - consumerRight) * 0.4;
              const cpX2 = consumerRight + (impactLeft - consumerRight) * 0.6;
              const path = `M ${consumerRight} ${consumerCenterY} C ${cpX1} ${consumerCenterY}, ${cpX2} ${consumerCenterY}, ${impactLeft} ${consumerCenterY}`;
              return (
                <g key={`cons-impact-${pi}`}>
                  <path d={path} stroke={IMPACT_METRICS[pi].color} strokeWidth={consumerReady ? 2 : 1} fill="none" opacity={consumerReady ? 0.5 : 0} strokeDasharray={consumerReady ? "none" : "4 3"} className="line-transition" />
                </g>
              );
            })}
          </>
        )}
      </svg>

      {/* Transaction Card */}
      <div className={`absolute ${customer ? "cursor-pointer" : ""}`} style={{ left: txCenterX - TX_CARD_WIDTH / 2, top: midY - TX_CARD_HEIGHT / 2, width: TX_CARD_WIDTH, zIndex: 1 }} onClick={() => { if (customer) onTxCardClick?.(); }}>
        <TxCard customer={customer} color="#3b82f6" label="Customer" scaled={centered} />
      </div>

      {/* Engine Node */}
      <button
        onClick={() => { if (engineReady) onNodeClick("engine"); }}
        disabled={!engineReady}
        className={`absolute flex flex-col items-center rounded-2xl border bg-white py-3 px-2 group transition-[box-shadow,opacity,border-color] duration-300 ${engineReady ? "cursor-pointer hover:scale-[1.02] border-blue-300 border-2 shadow-[0_0_14px_rgba(147,197,253,0.3)]" : engineProcessing ? "cursor-not-allowed border-slate-200 opacity-90" : "cursor-not-allowed border-slate-100 opacity-80"}`}
        style={{
          left: engineCenterX - ENGINE_WIDTH / 2,
          top: midY,
          transform: "translateY(-50%)",
          width: ENGINE_WIDTH,
          minHeight: ENGINE_MIN_HEIGHT,
          boxShadow: engineProcessing && !engineReady ? "0 0 30px rgba(99, 102, 241, 0.25)" : engineReady ? "0 0 20px rgba(34, 197, 94, 0.15)" : "0 4px 24px rgba(99, 102, 241, 0.1)",
          zIndex: 1,
        }}
      >
        <div className="mb-2">
          <p className={`font-bold text-slate-900 ${centered ? "text-[16px]" : "text-[14px]"}`}>Advanced Enrichment</p>
        </div>
        <div className="flex flex-col gap-1.5 px-2 w-full">
          {ENGINE_CAPABILITIES.map((cap, ci) => {
            const Icon = cap.icon;
            return (
              <div key={cap.label} className={`flex items-center gap-2 rounded-lg px-2 ${centered ? "py-2" : "py-1.5"} border transition-all duration-300`} style={{ background: engineReady ? `${cap.color}15` : `${cap.color}08`, borderColor: engineReady ? `${cap.color}40` : `${cap.color}20`, animationDelay: engineProcessing ? `${ci * 0.3}s` : undefined }}>
                <Icon className={`${centered ? "w-4.5 h-4.5" : "w-3.5 h-3.5"} shrink-0`} style={{ color: cap.color }} />
                <span className={`font-semibold ${centered ? "text-[13px]" : "text-[12px]"}`} style={{ color: engineReady ? cap.color : "#64748b" }}>{cap.label}</span>
              </div>
            );
          })}
        </div>
      </button>

      {/* Bank Analytics Column + Consumer Views Column */}
      {PILLAR_ROWS.map((pillar, pi) => {
        const rowCenterY = getRowCenterY(pi);
        const PillarIcon = pillar.icon;
        const bankNodesHeight = BANK_NODE_HEIGHT * pillar.bankNodes.length + BANK_NODE_GAP * (pillar.bankNodes.length - 1);
        const contentHeight = Math.max(bankNodesHeight, CONSUMER_NODE_HEIGHT);
        const labelTop = rowCenterY - contentHeight / 2 - QUESTION_LABEL_HEIGHT - 2;
        const contentTop = rowCenterY - contentHeight / 2;

        return (
          <div key={pillar.id}>
            {/* Question label spanning both columns */}
            <div
              className="absolute flex items-center gap-1.5 px-2"
              style={{
                left: bankColLeftX,
                top: labelTop,
                width: (consumerColLeftX + CONSUMER_COL_WIDTH) - bankColLeftX,
                height: QUESTION_LABEL_HEIGHT,
                zIndex: 2,
              }}
            >
              <PillarIcon className={`${centered ? "w-4.5 h-4.5" : "w-4 h-4"} shrink-0`} style={{ color: pillar.color }} />
              <span className={`font-semibold leading-tight ${centered ? "text-[14px]" : "text-[12px]"}`} style={{ color: pillar.color }}>{pillar.team}</span>
              <span style={{ color: pillar.color }}>:</span>
              <span className={`font-semibold leading-tight ${centered ? "text-[14px]" : "text-[12px]"}`} style={{ color: pillar.color }}>{pillar.subtitle}</span>
            </div>

            {/* 2 stacked bank nodes */}
            <div
              className="absolute flex flex-col"
              style={{
                left: bankColLeftX,
                top: contentTop,
                width: BANK_COL_WIDTH,
                zIndex: 2,
              }}
            >
              {pillar.bankNodes.map((node) => {
                const Icon = node.icon;
                const state = nodeReadiness[node.id];
                const isReady = state === "ready";
                const canOpen = engineReady && isReady;

                return (
                  <button
                    key={node.id}
                    onClick={() => { if (canOpen) onNodeClick(node.id); }}
                    disabled={!canOpen}
                    className={`flex items-center gap-2 rounded-lg border border-l-[3px] ${AUDIENCE_ACCENT[node.audience]} ${centered ? "px-3" : "px-2"} group transition-[box-shadow,opacity,border-color] duration-300`}
                    style={{
                      height: BANK_NODE_HEIGHT,
                      cursor: canOpen ? "pointer" : "not-allowed",
                      opacity: !engineReady ? 0.5 : canOpen ? 1 : 0.7,
                      background: canOpen ? `linear-gradient(135deg, ${node.color}08 0%, ${node.color}20 100%)` : "#ffffff",
                      borderColor: canOpen ? `${node.color}80` : "#e2e8f0",
                      boxShadow: canOpen ? `0 0 12px ${node.color}15` : "0 1px 3px rgba(0,0,0,0.04)",
                      marginBottom: BANK_NODE_GAP,
                    }}
                  >
                    <div
                      className={`${centered ? "w-7 h-7" : "w-6 h-6"} rounded-md flex items-center justify-center shrink-0`}
                      style={{ background: canOpen ? `${node.color}20` : `${node.color}10`, border: `1px solid ${canOpen ? `${node.color}40` : `${node.color}20`}` }}
                    >
                      <Icon className={`${centered ? "w-3.5 h-3.5" : "w-3 h-3"}`} style={{ color: node.color }} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className={`font-semibold text-slate-900 truncate ${centered ? "text-[13px]" : "text-[12px]"}`}>{node.label}</p>
                    </div>
                    <span className={`shrink-0 ${centered ? "text-[11px]" : "text-[10px]"} text-slate-500`}>
                      {!engineReady ? "" : isReady ? "✓" : state === "processing" ? "…" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Consumer node — uniform height */}
            {(() => {
              const node = pillar.consumerNode;
              const Icon = node.icon;
              const state = nodeReadiness[node.id];
              const isReady = state === "ready";
              const canOpen = engineReady && isReady;

              return (
                <button
                  key={node.id}
                  onClick={() => { if (canOpen) onNodeClick(node.id); }}
                  disabled={!canOpen}
                  className={`absolute flex flex-col items-center justify-center rounded-xl border border-l-[3px] ${AUDIENCE_ACCENT[node.audience]} group transition-[box-shadow,opacity,border-color] duration-300`}
                  style={{
                    left: consumerColLeftX,
                    top: contentTop + (contentHeight - CONSUMER_NODE_HEIGHT) / 2,
                    width: CONSUMER_COL_WIDTH,
                    height: CONSUMER_NODE_HEIGHT,
                    cursor: canOpen ? "pointer" : "not-allowed",
                    opacity: !engineReady ? 0.5 : canOpen ? 1 : 0.7,
                    background: canOpen ? `${node.color}12` : "#ffffff",
                    borderColor: canOpen ? `${node.color}70` : "#e2e8f0",
                    boxShadow: canOpen ? `0 0 16px ${node.color}18` : "0 1px 3px rgba(0,0,0,0.04)",
                    zIndex: 2,
                  }}
                >
                  <div
                    className={`${centered ? "w-9 h-9" : "w-7 h-7"} rounded-lg flex items-center justify-center mb-1`}
                    style={{ background: canOpen ? `${node.color}20` : `${node.color}10`, border: `1px solid ${canOpen ? `${node.color}40` : `${node.color}20`}` }}
                  >
                    <Icon className={`${centered ? "w-4.5 h-4.5" : "w-3.5 h-3.5"}`} style={{ color: node.color }} />
                  </div>
                  <p className={`font-semibold text-slate-900 ${centered ? "text-[14px]" : "text-[13px]"}`}>{node.label}</p>
                  <p className={`text-slate-500 ${centered ? "text-[12px]" : "text-[11px]"}`}>
                    {!engineReady ? "Waiting…" : isReady ? "✓ Ready" : state === "processing" ? "Processing…" : "Explore →"}
                  </p>
                </button>
              );
            })()}
          </div>
        );
      })}

      {/* Impact Column */}
      {PILLAR_ROWS.map((pillar, pi) => {
        const rowCenterY = getRowCenterY(pi);
        const bankNodesHeight = BANK_NODE_HEIGHT * pillar.bankNodes.length + BANK_NODE_GAP * (pillar.bankNodes.length - 1);
        const contentHeight = Math.max(bankNodesHeight, CONSUMER_NODE_HEIGHT);
        const contentTop = rowCenterY - contentHeight / 2;
        const consumerReady = engineReady && nodeReadiness[pillar.consumerNode.id] === "ready";
        const impactData = IMPACT_METRICS[pi];

        return (
          <div
            key={`impact-${pi}`}
            className="absolute flex flex-col justify-center gap-1 transition-opacity duration-500"
            style={{
              left: impactColLeftX,
              top: rowCenterY - (impactData.metrics.length * 28 + (impactData.metrics.length - 1) * 4) / 2,
              width: IMPACT_COL_WIDTH,
              opacity: consumerReady ? 1 : 0,
              zIndex: 2,
            }}
          >
            {impactData.metrics.map((metric, mi) => (
              <div
                key={mi}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 border transition-all duration-500"
                style={{
                  background: consumerReady ? `${impactData.color}12` : "transparent",
                  borderColor: consumerReady ? `${impactData.color}30` : "#e2e8f020",
                  opacity: consumerReady ? 1 : 0,
                  transform: consumerReady ? "translateX(0)" : "translateX(-8px)",
                  transitionDelay: consumerReady ? `${mi * 200}ms` : "0ms",
                }}
              >
                <ArrowUpRight className={`${centered ? "w-3.5 h-3.5" : "w-3 h-3"} shrink-0`} style={{ color: "#22c55e" }} />
                <span className={`font-semibold text-slate-700 ${centered ? "text-[12px]" : "text-[10px]"} whitespace-nowrap`}>{metric}</span>
              </div>
            ))}
          </div>
        );
      })}

      {/* Column Headers */}
      <div
        className={`absolute ${centered ? "text-[13px]" : "text-[11px]"} font-semibold text-slate-500 uppercase tracking-wider text-center`}
        style={{ left: txCenterX - TX_CARD_WIDTH / 2, width: TX_CARD_WIDTH, top: gridTopY - 48, zIndex: 2 }}
      >
        Transactions
      </div>
      <div
        className={`absolute ${centered ? "text-[13px]" : "text-[11px]"} font-semibold text-slate-500 uppercase tracking-wider text-center`}
        style={{ left: engineCenterX - ENGINE_WIDTH / 2, width: ENGINE_WIDTH, top: gridTopY - 48, zIndex: 2 }}
      >
        Customer Intelligence
      </div>
      <div
        className={`absolute ${centered ? "text-[13px]" : "text-[11px]"} font-semibold text-slate-500 uppercase tracking-wider text-center`}
        style={{ left: bankColLeftX, width: BANK_COL_WIDTH, top: gridTopY - 48, zIndex: 2 }}
      >
        AI-Native Platform
      </div>
      <div
        className={`absolute ${centered ? "text-[13px]" : "text-[11px]"} font-semibold text-slate-500 uppercase tracking-wider text-center`}
        style={{ left: consumerColLeftX, width: CONSUMER_COL_WIDTH, top: gridTopY - 48, zIndex: 2 }}
      >
        Personalized Banking
      </div>
      <div
        className={`absolute ${centered ? "text-[13px]" : "text-[11px]"} font-semibold text-slate-500 uppercase tracking-wider text-center transition-opacity duration-500`}
        style={{ left: impactColLeftX, width: IMPACT_COL_WIDTH, top: gridTopY - 48, zIndex: 2, opacity: PILLAR_ROWS.some((p) => nodeReadiness[p.consumerNode.id] === "ready") ? 1 : 0 }}
      >
        Impact
      </div>
     </div>
    </div>
  );
}

function TxCard({ customer, color, label, scaled }: { customer: DemoCustomer | null; color: string; label: string; scaled?: boolean }) {
  if (!customer) {
    return (
      <div className={`rounded-lg border-2 border-dashed ${scaled ? "p-3" : "p-2.5"} flex items-center justify-center`} style={{ borderColor: `${color}40`, minHeight: scaled ? 110 : 90 }}>
        <p className={`font-medium text-slate-500 ${scaled ? "text-[14px]" : "text-[13px]"}`}>{label}</p>
      </div>
    );
  }

  const initials = customer.profile.name.split(" ").map((w) => w[0]).join("");
  return (
    <div className={`rounded-lg border-2 ${scaled ? "p-3" : "p-2.5"} bg-white`} style={{ borderColor: `${color}50`, boxShadow: `0 0 12px ${color}20` }}>
      <div className="flex items-center gap-2">
        <div className={`${scaled ? "w-8 h-8 text-[12px]" : "w-7 h-7 text-[11px]"} rounded-full flex items-center justify-center font-bold text-white`} style={{ background: `${color}30`, border: `1px solid ${color}50` }}>
          {initials}
        </div>
        <div>
          <p className={`font-semibold text-slate-900 truncate ${scaled ? "text-[15px]" : "text-[13px]"}`}>{customer.profile.name}</p>
          <p className={`text-slate-400 ${scaled ? "text-[11px]" : "text-[10px]"}`}>User Data</p>
        </div>
      </div>
    </div>
  );
}
