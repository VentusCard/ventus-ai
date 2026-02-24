import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Variant = "enrichment" | "rewards" | "wealth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeVariant: Variant;
}

const ACCENT = {
  enrichment: {
    fill: "hsl(255 70% 96%)",
    stroke: "hsl(255 70% 55%)",
    text: "hsl(255 70% 40%)",
    light: "hsl(255 70% 60% / 0.35)",
  },
  rewards: {
    fill: "hsl(160 60% 95%)",
    stroke: "hsl(160 60% 40%)",
    text: "hsl(160 60% 30%)",
    light: "hsl(160 60% 45% / 0.35)",
  },
  wealth: {
    fill: "hsl(35 85% 95%)",
    stroke: "hsl(35 85% 45%)",
    text: "hsl(35 85% 30%)",
    light: "hsl(35 85% 50% / 0.35)",
  },
} as const;

const PAIRS: {
  id: Variant;
  existing: { title: string; items: string[] };
  ventus: { title: string; items: string[] };
}[] = [
  {
    id: "enrichment",
    existing: {
      title: "Existing Analytics Tools",
      items: ["BI Dashboards", "Segment Tools", "Data Warehouse"],
    },
    ventus: {
      title: "Lifestyle Indicator Analytics",
      items: [
        "Persona Dashboards",
        "Behavioral Segmentation",
        "Smart Budgeting Tools",
        "Targeted Campaigns",
      ],
    },
  },
  {
    id: "rewards",
    existing: {
      title: "Existing Rewards Programs",
      items: [
        "Card Reward Programs",
        "Reward Aggregators (CardLinx, Figg)",
        "Partner Portals",
      ],
    },
    ventus: {
      title: "Reward Personalization",
      items: [
        "Lifestyle-Matched Offers",
        "Real-Time Deal Matching",
        "Personalized Rewards Experience",
      ],
    },
  },
  {
    id: "wealth",
    existing: {
      title: "Existing CRM Tools",
      items: [
        "Salesforce / HubSpot",
        "Planning Software (eMoney)",
        "Data Aggregators (Plaid)",
      ],
    },
    ventus: {
      title: "Life Event Intelligence",
      items: [
        "Life Event Dashboard",
        "CoPilot Suite",
        "Automated Meeting Prep",
        "Proactive Life Event Alerts",
      ],
    },
  },
];

const BENEFITS = [
  { label: "Next Gen UX", color: { fill: "hsl(217 91% 95%)", stroke: "hsl(217 91% 55%)", text: "hsl(217 91% 35%)" } },
  { label: "Lifestyle Budgeting", color: ACCENT.enrichment },
  { label: "Personalized Rewards", color: ACCENT.rewards },
  { label: "Relationship Intelligence", color: ACCENT.wealth },
];

const PILLAR_WIDTH = 135;
const PILLAR_GAP = 6;
const PAIR_GAP = 16;
const PILLAR_TOP = 200;
const ITEM_HEIGHT = 20;
const PILLAR_PADDING = 40;
const SVG_WIDTH = 900;

function getPillarX(pairIndex: number, isVentus: boolean) {
  const pairStart = 20 + pairIndex * (PILLAR_WIDTH * 2 + PILLAR_GAP + PAIR_GAP);
  return pairStart + (isVentus ? PILLAR_WIDTH + PILLAR_GAP : 0);
}

function getPillarHeight(items: string[]) {
  return PILLAR_PADDING + items.length * ITEM_HEIGHT + 16;
}

const IntegrationArchitectureDialog = ({ open, onOpenChange, activeVariant }: Props) => {
  const maxPillarH = Math.max(
    ...PAIRS.flatMap((p) => [
      getPillarHeight(p.existing.items),
      getPillarHeight(p.ventus.items),
    ])
  );

  const benefitsRowY = PILLAR_TOP + maxPillarH + 40;
  const benefitBlockH = 34;
  const benefitBlockW = 170;
  const benefitGap = 12;
  const totalBenefitsW = BENEFITS.length * benefitBlockW + (BENEFITS.length - 1) * benefitGap;
  const benefitsStartX = (SVG_WIDTH - totalBenefitsW) / 2;
  const bracketPad = 14;
  const bracketY = benefitsRowY - 22;
  const bracketH = benefitBlockH + 40;
  const customersY = bracketY + bracketH + 24;
  const svgHeight = customersY + 54;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 bg-white border-slate-200">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Integration Architecture
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            How Ventus enhances your existing banking infrastructure
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="w-full overflow-x-auto">
          <div className="min-w-[900px] px-6 pb-6">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
              width="100%"
              height="auto"
              className="block"
            >
              <defs>
                <linearGradient id="bankGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(215 20% 94%)" />
                  <stop offset="100%" stopColor="hsl(215 15% 88%)" />
                </linearGradient>
                <linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(217 91% 96%)" />
                  <stop offset="100%" stopColor="hsl(217 91% 88%)" />
                </linearGradient>
                <filter id="blueGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6" fill="hsl(217 91% 45%)" />
                </marker>
              </defs>

              {/* Bank Partner Database */}
              <rect x={80} y={10} width={SVG_WIDTH - 160} height={44} rx={10} fill="url(#bankGrad)" stroke="hsl(215 20% 82%)" strokeWidth={1} />
              <text x={SVG_WIDTH / 2} y={28} textAnchor="middle" fill="hsl(215 20% 25%)" fontSize={13} fontWeight={600}>BANK PARTNER DATABASE</text>
              <text x={SVG_WIDTH / 2} y={44} textAnchor="middle" fill="hsl(215 10% 50%)" fontSize={10}>Core Banking System</text>

              {/* Connection line down */}
              <line x1={SVG_WIDTH / 2} y1={54} x2={SVG_WIDTH / 2} y2={95} stroke="hsl(217 91% 60% / 0.4)" strokeWidth={1.5} strokeDasharray="4 3" />

              {/* Ventus AI Hub */}
              <rect x={SVG_WIDTH / 2 - 110} y={95} width={220} height={46} rx={12} fill="url(#hubGrad)" stroke="hsl(217 91% 60% / 0.6)" strokeWidth={1.5} filter="url(#blueGlow)" />
              <text x={SVG_WIDTH / 2} y={115} textAnchor="middle" fill="hsl(217 91% 40%)" fontSize={12} fontWeight={700}>VENTUS AI</text>
              <text x={SVG_WIDTH / 2} y={130} textAnchor="middle" fill="hsl(217 91% 50%)" fontSize={10} fontWeight={500}>Intelligence Hub</text>

              {/* Connection lines from hub to pillars */}
              {PAIRS.map((pair, pi) => {
                const a = ACCENT[pair.id];
                const exX = getPillarX(pi, false) + PILLAR_WIDTH / 2;
                const vxX = getPillarX(pi, true) + PILLAR_WIDTH / 2;
                return (
                  <g key={`hub-${pi}`}>
                    <line x1={SVG_WIDTH / 2} y1={141} x2={exX} y2={PILLAR_TOP - 8} stroke="hsl(215 15% 75%)" strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#arrowHead)" />
                    <line x1={SVG_WIDTH / 2} y1={141} x2={vxX} y2={PILLAR_TOP - 8} stroke={a.stroke + "99"} strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#arrowHead)" />
                  </g>
                );
              })}

              {/* Pillar pairs */}
              {PAIRS.map((pair, pi) => {
                const isActive = pair.id === activeVariant;
                const a = ACCENT[pair.id];
                const exX = getPillarX(pi, false);
                const vxX = getPillarX(pi, true);
                const groupX = exX - 4;
                const groupW = PILLAR_WIDTH * 2 + PILLAR_GAP + 8;

                return (
                  <g key={pair.id} opacity={isActive ? 1 : 0.55}>
                    {/* Pair grouping bracket */}
                    <rect x={groupX} y={PILLAR_TOP - 18} width={groupW} height={maxPillarH + 28} rx={8} fill="none" stroke={isActive ? a.light : "hsl(215 20% 80% / 0.5)"} strokeWidth={1} strokeDasharray="6 3" />

                    {/* Existing pillar */}
                    <rect x={exX} y={PILLAR_TOP} width={PILLAR_WIDTH} height={maxPillarH} rx={8} fill="hsl(215 15% 96%)" stroke="hsl(215 20% 85%)" strokeWidth={1} />
                    <text x={exX + PILLAR_WIDTH / 2} y={PILLAR_TOP + 16} textAnchor="middle" fill="hsl(215 10% 50%)" fontSize={8} fontWeight={600} letterSpacing={1}>EXISTING STACK</text>
                    <text x={exX + PILLAR_WIDTH / 2} y={PILLAR_TOP + 32} textAnchor="middle" fill="hsl(215 20% 30%)" fontSize={10} fontWeight={600}>{pair.existing.title}</text>
                    {pair.existing.items.map((item, i) => (
                      <text key={i} x={exX + PILLAR_WIDTH / 2} y={PILLAR_TOP + PILLAR_PADDING + 6 + i * ITEM_HEIGHT} textAnchor="middle" fill="hsl(215 10% 45%)" fontSize={9}>{item}</text>
                    ))}

                    {/* Ventus pillar */}
                    <rect x={vxX} y={PILLAR_TOP} width={PILLAR_WIDTH} height={maxPillarH} rx={8} fill={isActive ? a.fill : "hsl(215 10% 98%)"} stroke={isActive ? a.stroke + "88" : "hsl(215 15% 85%)"} strokeWidth={1} />
                    <text x={vxX + PILLAR_WIDTH / 2} y={PILLAR_TOP + 16} textAnchor="middle" fill={a.text} fontSize={8} fontWeight={600} letterSpacing={1}>NEW w/ VENTUS</text>
                    <text x={vxX + PILLAR_WIDTH / 2} y={PILLAR_TOP + 32} textAnchor="middle" fill={a.text} fontSize={10} fontWeight={600}>{pair.ventus.title}</text>
                    {pair.ventus.items.map((item, i) => (
                      <text key={i} x={vxX + PILLAR_WIDTH / 2} y={PILLAR_TOP + PILLAR_PADDING + 6 + i * ITEM_HEIGHT} textAnchor="middle" fill={a.text} fontSize={9}>{item}</text>
                    ))}
                  </g>
                );
              })}

              {/* Connection lines from pillars to benefits area */}
              {PAIRS.map((pair, pi) => {
                const midX = getPillarX(pi, false) + PILLAR_WIDTH + PILLAR_GAP / 2;
                return (
                  <line key={`pb-${pi}`} x1={midX} y1={PILLAR_TOP + maxPillarH + 14} x2={SVG_WIDTH / 2} y2={bracketY} stroke={ACCENT[pair.id].light} strokeWidth={1} strokeDasharray="4 3" />
                );
              })}

              {/* Personalized Banking Experience bracket */}
              <rect
                x={benefitsStartX - bracketPad}
                y={bracketY}
                width={totalBenefitsW + bracketPad * 2}
                height={bracketH}
                rx={12}
                fill="hsl(217 91% 98%)"
                stroke="hsl(217 91% 60% / 0.3)"
                strokeWidth={1.5}
                strokeDasharray="8 4"
              />
              <text
                x={SVG_WIDTH / 2}
                y={bracketY + 14}
                textAnchor="middle"
                fill="hsl(217 91% 40%)"
                fontSize={10}
                fontWeight={700}
                letterSpacing={0.5}
              >
                PERSONALIZED BANKING EXPERIENCE
              </text>

              {/* Benefit blocks */}
              {BENEFITS.map((b, i) => {
                const bx = benefitsStartX + i * (benefitBlockW + benefitGap);
                const by = bracketY + 24;
                return (
                  <g key={b.label}>
                    <rect x={bx} y={by} width={benefitBlockW} height={benefitBlockH} rx={19} fill={b.color.fill} stroke={b.color.stroke + "66"} strokeWidth={1.2} />
                    <text x={bx + benefitBlockW / 2} y={by + benefitBlockH / 2 + 4} textAnchor="middle" fill={b.color.text} fontSize={10} fontWeight={600}>{b.label}</text>
                  </g>
                );
              })}

              {/* Connection line from bracket to customers */}
              <line x1={SVG_WIDTH / 2} y1={bracketY + bracketH} x2={SVG_WIDTH / 2} y2={customersY - 4} stroke="hsl(217 91% 60% / 0.4)" strokeWidth={1.5} strokeDasharray="4 3" />

              {/* Customers */}
              <rect x={180} y={customersY} width={SVG_WIDTH - 360} height={44} rx={10} fill="url(#bankGrad)" stroke="hsl(215 20% 82%)" strokeWidth={1} />
              <text x={SVG_WIDTH / 2} y={customersY + 18} textAnchor="middle" fill="hsl(215 20% 25%)" fontSize={13} fontWeight={600}>CUSTOMERS</text>
              <text x={SVG_WIDTH / 2} y={customersY + 34} textAnchor="middle" fill="hsl(215 10% 50%)" fontSize={10}>Enhanced Digital Banking Experience</text>

              {/* Footer tagline */}
              <text x={SVG_WIDTH / 2} y={svgHeight - 6} textAnchor="middle" fill="hsl(217 91% 50% / 0.6)" fontSize={9} fontStyle="italic">
                Ventus enhances your existing stack — no rip-and-replace required
              </text>
            </svg>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationArchitectureDialog;
