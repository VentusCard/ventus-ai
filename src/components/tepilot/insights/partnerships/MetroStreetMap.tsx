import { useMemo, useState } from "react";
import { CATEGORY_COLORS, type LocalPartner, type Metro } from "@/lib/merchantPartnershipData";
import { formatCurrency } from "@/lib/formatHelper";

interface Props {
  metro: Metro;
  partners: LocalPartner[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Stylized street-level canvas — pure SVG, no map library or tile network calls. */
export function MetroStreetMap({ metro, partners, selectedId, onSelect }: Props) {
  const [hovered, setHovered] = useState<LocalPartner | null>(null);

  const maxValue = useMemo(() => Math.max(...partners.map((p) => p.estimatedValue), 1), [partners]);

  const avenues = [12, 26, 40, 54, 68, 82, 94];
  const streets = [10, 22, 34, 46, 58, 70, 82, 92];

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-[440px]" preserveAspectRatio="xMidYMid slice">
        <rect width="100" height="100" fill="#f8fafc" />

        {/* water */}
        <path d="M0,84 C14,80 26,90 40,88 C56,86 70,96 100,92 L100,100 L0,100 Z" fill="#dbeafe" />
        {/* parks */}
        <rect x="30" y="14" width="16" height="12" rx="1.5" fill="#dcfce7" />
        <rect x="66" y="60" width="14" height="14" rx="1.5" fill="#dcfce7" />

        {/* street grid */}
        {avenues.map((x) => (
          <line key={`a${x}`} x1={x} y1="0" x2={x - 4} y2="100" stroke="#e2e8f0" strokeWidth="1.1" />
        ))}
        {streets.map((y) => (
          <line key={`s${y}`} x1="0" y1={y} x2="100" y2={y - 2} stroke="#eef2f6" strokeWidth="0.8" />
        ))}
        {/* arterials */}
        <line x1="0" y1="52" x2="100" y2="46" stroke="#e2e8f0" strokeWidth="2.4" />
        <line x1="54" y1="0" x2="46" y2="100" stroke="#e2e8f0" strokeWidth="2.4" />

        {/* neighborhood labels */}
        {metro.neighborhoods.map((n, i) => {
          const anchors = [
            { x: 22, y: 22 }, { x: 66, y: 16 }, { x: 84, y: 50 },
            { x: 44, y: 74 }, { x: 14, y: 66 }, { x: 58, y: 38 },
          ];
          const a = anchors[i % anchors.length];
          return (
            <text key={n} x={a.x} y={a.y} fontSize="2.6" fill="#94a3b8" fontWeight="600" textAnchor="middle">
              {n.toUpperCase()}
            </text>
          );
        })}

        {/* merchant pins */}
        {partners.map((p) => {
          const color = (CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.Dining).pin;
          const r = 1.6 + (p.estimatedValue / maxValue) * 2.4;
          const active = selectedId === p.id || hovered?.id === p.id;
          return (
            <g key={p.id} className="cursor-pointer" onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)} onClick={() => onSelect(p.id)}>
              {active && <circle cx={p.x} cy={p.y} r={r + 2.2} fill={color} opacity={0.18} />}
              <circle cx={p.x} cy={p.y} r={r} fill={color} stroke="#ffffff" strokeWidth={active ? 0.9 : 0.6} />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="absolute pointer-events-none bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs"
          style={{ left: `min(${hovered.x}%, 72%)`, top: `calc(${hovered.y}% - 8px)` }}
        >
          <p className="font-semibold text-slate-900">{hovered.name}</p>
          <p className="text-[11px] text-slate-500">{hovered.neighborhood} · {hovered.category}</p>
          <p className="text-[11px] text-slate-700 font-medium">{formatCurrency(hovered.estimatedValue)} est. annual value</p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 bg-white/90 border border-slate-200 rounded-lg px-2.5 py-1.5">
        {Array.from(new Set(partners.map((p) => p.category))).map((c) => (
          <span key={c} className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ background: (CATEGORY_COLORS[c] ?? CATEGORY_COLORS.Dining).pin }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
