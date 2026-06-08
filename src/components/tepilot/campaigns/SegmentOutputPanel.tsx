import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Image as ImageIcon, Users, Copy, ExternalLink } from "lucide-react";
import { getProductFlow } from "@/lib/productAutomatedFlows";
import { type ImageryBrief, formatImageryBriefForClipboard } from "@/lib/segmentImageryBrief";
import { buildStockPickerUrl, providerLabel, STOCK_PROVIDERS, DEFAULT_PROVIDER, type StockProvider } from "@/lib/stockPickerLink";
import { toast } from "@/hooks/use-toast";

const PROVIDER_STORAGE_KEY = "tepilot.stockPicker.provider";

export interface GeneratedPersona {
  label: string;
  signalLabels: string[];
  sharePct: number;
  subject: string;
  body: string;
  cta: string;
  imageryBrief: ImageryBrief;
}

interface SegmentOutputPanelProps {
  productId: string;
  audienceSize: number;
  personas: GeneratedPersona[];
}

function formatN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function SegmentOutputPanel({ productId, audienceSize, personas }: SegmentOutputPanelProps) {
  const product = getProductFlow(productId);

  const [provider, setProvider] = useState<StockProvider>(DEFAULT_PROVIDER);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PROVIDER_STORAGE_KEY) as StockProvider | null;
      if (saved && STOCK_PROVIDERS.some((p) => p.id === saved)) setProvider(saved);
    } catch {/* ignore */}
  }, []);
  const handleProviderChange = (v: string) => {
    const next = v as StockProvider;
    setProvider(next);
    try { sessionStorage.setItem(PROVIDER_STORAGE_KEY, next); } catch {/* ignore */}
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Brief copied", description: "Paste into your stock image selector." });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard not available." });
    }
  };

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
        <div className="flex items-center gap-2">
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="h-7 w-[150px] text-[11px] border-slate-200 bg-white">
              <SelectValue placeholder="Picker" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {STOCK_PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  Picker · {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="border-slate-200 bg-white text-slate-600 text-xs">
            {personas.length} personalized variants
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {personas.map((p, idx) => {
          const brief = p.imageryBrief;
          const clipboardText = formatImageryBriefForClipboard(brief, product?.name ?? "Product", p.label);
          const share = p.sharePct / 100;
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{p.label}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {p.signalLabels.map((label) => (
                      <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Share</p>
                  <p className="text-sm font-bold text-slate-900">{p.sharePct}%</p>
                  <p className="text-[10px] text-slate-500">{formatN(Math.floor(audienceSize * share))}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-3">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      <ImageIcon className="w-3 h-3" />
                      Stock image brief
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-white text-[9px] text-slate-500 px-1.5 py-0">
                      {brief.mood}
                    </Badge>
                  </div>

                  <div className="rounded-md bg-gradient-to-br from-slate-200 to-slate-100 border border-slate-200 h-16 mb-2" />

                  <p className="font-mono text-[11px] text-slate-900 leading-snug break-words">
                    {brief.query}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {brief.keywords.map((k) => (
                      <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {k}
                      </span>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 mt-2 leading-snug">
                    <span className="text-slate-400">Composition · </span>{brief.composition}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    <span className="text-slate-400">Avoid · </span>{brief.avoid.join(", ")}
                  </p>

                  <div className="flex gap-1.5 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[10px] text-slate-600 hover:text-slate-900"
                      onClick={() => handleCopy(clipboardText)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy brief
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[10px] border-slate-200"
                    >
                      <a
                        href={buildStockPickerUrl(provider, brief)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          toast({
                            title: `Opening ${providerLabel(provider)}`,
                            description: `${p.label} · ${brief.query}`,
                          })
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in {providerLabel(provider)}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
