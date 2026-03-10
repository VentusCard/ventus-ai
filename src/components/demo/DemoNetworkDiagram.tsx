import { useEffect, useRef, useState } from "react";
import type { DemoCustomer } from "@/lib/demoData";
import { BarChart3, Gift, Smartphone, Plane, TrendingUp } from "lucide-react";

export type DemoNodeType = "analytics" | "rewards" | "engagement" | "travel" | "wealth";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  activeNode: DemoNodeType | null;
  onNodeClick: (node: DemoNodeType) => void;
}

const NODES: { id: DemoNodeType; label: string; icon: typeof BarChart3; color: string }[] = [
  { id: "analytics", label: "Bank-Wide Analytics", icon: BarChart3, color: "#3b82f6" },
  { id: "rewards", label: "Consumer Rewards", icon: Gift, color: "#22c55e" },
  { id: "engagement", label: "Customer Engagement", icon: Smartphone, color: "#f59e0b" },
  { id: "travel", label: "Travel Experience", icon: Plane, color: "#06b6d4" },
  { id: "wealth", label: "Wealth Management", icon: TrendingUp, color: "#a855f7" },
];

const ENGINE_FEATURES = [
  "Semantic Enrichment",
  "Cross-category Pattern Analysis",
  "Deep Purchase Intelligence",
  "Behavioral Profiling",
  "Life Event Detection",
];

export default function DemoNetworkDiagram({ customerA, customerB, activeNode, onNodeClick }: Props) {
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

  // Input card positions
  const inputAY = midY - 70;
  const inputBY = midY + 70;

  // Output node positions — evenly spaced
  const nodeSpacing = dims.h / (NODES.length + 1);

  return (
    <div className="relative w-full h-full">
      {/* SVG animated lines */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>
          {/* Animated dot */}
          <circle id="flowDot" r="3" fill="#60a5fa">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </defs>

        {dims.w > 0 && (
          <>
            {/* Left → Center lines */}
            {[inputAY, inputBY].map((y, i) => {
              const path = `M ${colLeft + 80} ${y} C ${colCenter - 60} ${y}, ${colCenter - 60} ${midY}, ${colCenter - 40} ${midY}`;
              return (
                <g key={`in-${i}`}>
                  <path d={path} stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" opacity="0.4" />
                  <circle r="2.5" fill="#60a5fa">
                    <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" path={path} />
                  </circle>
                </g>
              );
            })}

            {/* Center → Right lines */}
            {NODES.map((node, i) => {
              const nodeY = nodeSpacing * (i + 1);
              const path = `M ${colCenter + 80} ${midY} C ${colRight - 80} ${midY}, ${colRight - 80} ${nodeY}, ${colRight - 50} ${nodeY}`;
              return (
                <g key={`out-${i}`}>
                  <path d={path} stroke={node.color} strokeWidth="1.5" fill="none" opacity={activeNode === node.id ? 0.8 : 0.3} />
                  <circle r="2.5" fill={node.color}>
                    <animateMotion dur={`${2 + i * 0.4}s`} repeatCount="indefinite" path={path} />
                  </circle>
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
        className="absolute flex flex-col items-center justify-center rounded-2xl border"
        style={{
          left: colCenter - 70,
          top: midY - 100,
          width: 160,
          height: 200,
          background: "rgba(15, 23, 42, 0.8)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 40px rgba(99, 102, 241, 0.15)",
          zIndex: 1,
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-2 border border-indigo-500/30">
          <span className="text-indigo-400 text-lg font-bold">V</span>
        </div>
        <p className="text-[11px] font-bold text-white text-center mb-2">Ventus AI Engine</p>
        <div className="space-y-1 px-3">
          {ENGINE_FEATURES.map((f) => (
            <p key={f} className="text-[8px] text-slate-400 text-center leading-tight">{f}</p>
          ))}
        </div>
      </div>

      {/* Output Nodes — Right */}
      {NODES.map((node, i) => {
        const nodeY = nodeSpacing * (i + 1);
        const Icon = node.icon;
        const isActive = activeNode === node.id;

        return (
          <button
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            className="absolute flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all duration-300 cursor-pointer group"
            style={{
              left: colRight - 50,
              top: nodeY - 24,
              minWidth: 180,
              background: isActive ? `${node.color}15` : "rgba(15, 23, 42, 0.7)",
              borderColor: isActive ? `${node.color}80` : "rgba(255,255,255,0.08)",
              boxShadow: isActive ? `0 0 20px ${node.color}30` : "none",
              backdropFilter: "blur(8px)",
              zIndex: 2,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${node.color}20`, border: `1px solid ${node.color}40` }}
            >
              <Icon className="w-4 h-4" style={{ color: node.color }} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-semibold text-white group-hover:text-white/90">{node.label}</p>
              <p className="text-[9px] text-slate-500">Click to explore →</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TxCard({ customer, color }: { customer: DemoCustomer; color: string }) {
  const initials = customer.profile.name.split(" ").map((w) => w[0]).join("");
  return (
    <div
      className="rounded-lg border p-2.5"
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderColor: `${color}30`,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: `${color}30`, border: `1px solid ${color}50` }}
        >
          {initials}
        </div>
        <p className="text-[10px] font-semibold text-white truncate">{customer.profile.name}</p>
      </div>
      <div className="space-y-1">
        {customer.sampleTransactions.slice(0, 3).map((tx, i) => (
          <div key={i} className="flex justify-between text-[8px]">
            <span className="text-slate-400 truncate mr-1">{tx.merchant}</span>
            <span className="text-slate-300 shrink-0">{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
