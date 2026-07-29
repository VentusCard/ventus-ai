import { useMemo } from "react";
import { getFlow } from "@/lib/transactionFlow";
import { PILLAR_COLORS } from "@/lib/sampleData";

interface SankeyTx {
  merchant_name: string;
  description?: string;
  amount: number;
  pillar: string;
  source?: string;
}

interface Props {
  enriched: SankeyTx[];
}

const SOURCE_COLORS: Record<string, string> = {
  Checking: "#64748b",
  "Cashback Card": "#10b981",
  "Travel Card": "#3b82f6",
  "Premium Card": "#8b5cf6",
  HSA: "#f59e0b",
};

function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

interface Node {
  key: string;
  label: string;
  amount: number;
  color: string;
  y: number;
  h: number;
}

interface Link {
  source: Node;
  target: Node;
  amount: number;
  sy: number;
  ty: number;
  sh: number;
  th: number;
}

const WIDTH = 720;
const HEIGHT = 240;
const NODE_W = 12;
const LEFT_PAD = 90;
const RIGHT_PAD = 160;
const TOP_PAD = 8;
const BOTTOM_PAD = 8;
const NODE_GAP = 4;

export default function EnrichmentIncomeFlowSankey({ enriched }: Props) {
  const layout = useMemo(() => {
    if (!enriched?.length) return null;

    const incomeAgg = new Map<string, number>();
    const spendAgg = new Map<string, number>();

    for (const t of enriched) {
      const flow = getFlow({ merchant_name: t.merchant_name, description: t.description });
      const amt = Math.abs(t.amount);
      if (flow === "income") {
        const key = t.source || "Other income";
        incomeAgg.set(key, (incomeAgg.get(key) || 0) + amt);
      } else {
        const key = t.pillar || "Uncategorized";
        spendAgg.set(key, (spendAgg.get(key) || 0) + amt);
      }
    }

    if (!incomeAgg.size || !spendAgg.size) return null;

    const totalSpend = [...spendAgg.values()].reduce((a, b) => a + b, 0);
    const totalIncome = [...incomeAgg.values()].reduce((a, b) => a + b, 0);

    // Roll up tiny pillars into "Other"
    const threshold = totalSpend * 0.02;
    let otherSum = 0;
    const pillars: { key: string; amount: number }[] = [];
    [...spendAgg.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => {
        if (v < threshold) otherSum += v;
        else pillars.push({ key: k, amount: v });
      });
    if (otherSum > 0) pillars.push({ key: "Other", amount: otherSum });

    const sources = [...incomeAgg.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({ key: k, amount: v }));

    // Use spend as the unit of flow on both sides for visual balance
    const flowTotal = totalSpend;
    const availLeftH = HEIGHT - TOP_PAD - BOTTOM_PAD - (sources.length - 1) * NODE_GAP;
    const availRightH = HEIGHT - TOP_PAD - BOTTOM_PAD - (pillars.length - 1) * NODE_GAP;

    const leftNodes: Node[] = [];
    {
      let y = TOP_PAD;
      for (const s of sources) {
        const share = s.amount / totalIncome;
        const h = Math.max(4, share * availLeftH);
        leftNodes.push({
          key: s.key,
          label: s.key,
          amount: s.amount,
          color: SOURCE_COLORS[s.key] || "#94a3b8",
          y,
          h,
        });
        y += h + NODE_GAP;
      }
    }

    const rightNodes: Node[] = [];
    {
      let y = TOP_PAD;
      for (const p of pillars) {
        const share = p.amount / totalSpend;
        const h = Math.max(4, share * availRightH);
        rightNodes.push({
          key: p.key,
          label: p.key,
          amount: p.amount,
          color: PILLAR_COLORS[p.key] || "#94a3b8",
          y,
          h,
        });
        y += h + NODE_GAP;
      }
    }

    // Build links: each (source × pillar) weight = source.share * pillar.amount
    const links: Link[] = [];
    const leftOffsets = new Map<string, number>();
    const rightOffsets = new Map<string, number>();

    for (const src of leftNodes) {
      const srcShare = src.amount / totalIncome;
      for (const tgt of rightNodes) {
        const amount = srcShare * tgt.amount;
        if (amount <= 0) continue;
        const sh = (amount / flowTotal) * availLeftH * (totalIncome / flowTotal);
        const th = (amount / tgt.amount) * tgt.h;
        const so = leftOffsets.get(src.key) || 0;
        const to = rightOffsets.get(tgt.key) || 0;
        // Use source-block proportional height
        const srcHRatio = amount / src.amount;
        const shAdj = srcHRatio * src.h;
        links.push({
          source: src,
          target: tgt,
          amount,
          sy: src.y + so,
          ty: tgt.y + to,
          sh: shAdj,
          th,
        });
        leftOffsets.set(src.key, so + shAdj);
        rightOffsets.set(tgt.key, to + th);
      }
    }

    return { leftNodes, rightNodes, links, totalSpend, totalIncome };
  }, [enriched]);

  if (!layout) return null;

  const leftX = LEFT_PAD;
  const rightX = WIDTH - RIGHT_PAD;

  return (
    <div className="border border-slate-200 border-t-0 bg-white p-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
          Income → Pillars
        </div>
        <div className="text-[10px] text-slate-500">
          Income {formatMoney(layout.totalIncome)} · Spend {formatMoney(layout.totalSpend)}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: 180 }}
      >
        {/* Links */}
        <g>
          {layout.links.map((l, i) => {
            const x0 = leftX + NODE_W;
            const x1 = rightX;
            const cx = (x0 + x1) / 2;
            const sy0 = l.sy;
            const sy1 = l.sy + l.sh;
            const ty0 = l.ty;
            const ty1 = l.ty + l.th;
            const d = `
              M ${x0} ${sy0}
              C ${cx} ${sy0}, ${cx} ${ty0}, ${x1} ${ty0}
              L ${x1} ${ty1}
              C ${cx} ${ty1}, ${cx} ${sy1}, ${x0} ${sy1}
              Z
            `;
            return (
              <path
                key={i}
                d={d}
                fill={l.target.color}
                fillOpacity={0.28}
                className="transition-opacity hover:[fill-opacity:0.6]"
              >
                <title>
                  {l.source.label} → {l.target.label} · {formatMoney(l.amount)}
                </title>
              </path>
            );
          })}
        </g>
        {/* Left nodes */}
        <g>
          {layout.leftNodes.map((n) => (
            <g key={n.key}>
              <rect x={leftX} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx={2} />
              <text
                x={leftX - 6}
                y={n.y + n.h / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-700"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {n.label}
              </text>
              <text
                x={leftX - 6}
                y={n.y + n.h / 2 + 11}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-400"
                style={{ fontSize: 9 }}
              >
                {formatMoney(n.amount)}
              </text>
            </g>
          ))}
        </g>
        {/* Right nodes */}
        <g>
          {layout.rightNodes.map((n) => (
            <g key={n.key}>
              <rect x={rightX} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx={2} />
              <text
                x={rightX + NODE_W + 6}
                y={n.y + n.h / 2}
                dominantBaseline="middle"
                className="fill-slate-700"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {n.label}
              </text>
              <text
                x={rightX + NODE_W + 6}
                y={n.y + n.h / 2 + 11}
                dominantBaseline="middle"
                className="fill-slate-400"
                style={{ fontSize: 9 }}
              >
                {formatMoney(n.amount)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
