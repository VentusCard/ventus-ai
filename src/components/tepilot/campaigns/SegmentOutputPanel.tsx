import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Image as ImageIcon, Users } from "lucide-react";
import { LIFESTYLE_ASSET_SIGNALS } from "@/lib/lifestyleAssetSignals";
import { getProductFlow } from "@/lib/productAutomatedFlows";

interface Persona {
  label: string;
  signalIds: string[];
  subject: string;
  body: string;
  cta: string;
  imagery: string;
  share: number; // share of audience
}

interface SegmentOutputPanelProps {
  productId: string;
  audienceSize: number;
  selectedAssetSignals: string[];
}

function formatN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function getPersonas(productId: string, selected: string[]): Persona[] {
  const product = getProductFlow(productId);
  const productName = product?.name ?? "this product";

  // Always 3 representative personas; pick from selected if available, else defaults
  const pickSignal = (preferred: string[], fallback: string[]): string[] => {
    const has = preferred.filter((id) => selected.includes(id));
    return has.length > 0 ? has : fallback;
  };

  return [
    {
      label: "Coastal Empty-Nester with Marine Lifestyle",
      signalIds: pickSignal(["marine", "second-home", "country-club"], ["marine", "second-home"]),
      subject: `A more considered way to manage what you've built`,
      body: `Your relationship with the bank reflects a life of considered choices — from the coast to the clubhouse. ${productName} brings the same level of intention to your long-term picture, with a dedicated advisor who already understands the rhythm of your year.`,
      cta: "Schedule a private consultation",
      imagery: "Soft morning light on a teak yacht deck, neutral palette, no people in frame",
      share: 0.32,
    },
    {
      label: "Established Suburban Family, Education-Forward",
      signalIds: pickSignal(["private-school", "luxury-auto", "philanthropy"], ["private-school"]),
      subject: `Plans that grow with the kids`,
      body: `Tuition, tournaments, and college visits — your family's runway gets shorter every year. ${productName} gives you a structured way to fund what's next without disrupting the everyday.`,
      cta: "See your family's plan",
      imagery: "Hardcover books stacked on a quiet study desk, late-afternoon warm light",
      share: 0.38,
    },
    {
      label: "Quietly Affluent Professional, Asset-Builder",
      signalIds: pickSignal(["private-banking", "watch-collector", "fine-dining"], ["fine-dining"]),
      subject: `Built for what you don't talk about`,
      body: `You've kept things straightforward — but the picture is getting more complex. ${productName} pairs you with an advisor who matches the discretion you already expect from us, and who can pull on every part of the bank when you need it.`,
      cta: "Meet your advisor",
      imagery: "Minimal architectural interior, slate and brass details, sharp focus on a single object",
      share: 0.30,
    },
  ];
}

export function SegmentOutputPanel({ productId, audienceSize, selectedAssetSignals }: SegmentOutputPanelProps) {
  const product = getProductFlow(productId);
  const personas = getPersonas(productId, selectedAssetSignals);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Generated segment</p>
            <p className="text-base font-bold text-slate-900">{formatN(audienceSize)} customers · {product?.name}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-600 text-xs">
          {personas.length} personalized variants
        </Badge>
      </div>

      <div className="space-y-3">
        {personas.map((p, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{p.label}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {p.signalIds.map((sid) => {
                    const sig = LIFESTYLE_ASSET_SIGNALS.find((s) => s.id === sid);
                    if (!sig) return null;
                    return (
                      <span key={sid} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {sig.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Share</p>
                <p className="text-sm font-bold text-slate-900">{Math.round(p.share * 100)}%</p>
                <p className="text-[10px] text-slate-500">{formatN(Math.floor(audienceSize * p.share))}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  <Mail className="w-3 h-3" />
                  Personalized message
                </div>
                <p className="text-xs font-semibold text-slate-900">{p.subject}</p>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.body}</p>
                <Button size="sm" className="mt-3 h-8 text-xs">
                  {p.cta}
                </Button>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  <ImageIcon className="w-3 h-3" />
                  Imagery direction
                </div>
                <div className="flex-1 rounded-md bg-gradient-to-br from-slate-200 to-slate-100 border border-slate-200 min-h-[80px]" />
                <p className="text-[11px] text-slate-600 mt-2 leading-snug italic">{p.imagery}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
