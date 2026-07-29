import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ParsedIntent {
  campaign_goal: string;
  lifestyle_pillars: string[];
  life_events: string[];
  products_has: string[];
  products_lacks: string[];
  cross_sell_strategies: string[];
  upsell_strategies: string[];
  regions: string[];
  age_ranges: string[];
  income_bands: string[];
  summary: string;
}

interface SemanticIntentInputProps {
  onIntentParsed: (result: ParsedIntent) => void;
}

export function SemanticIntentInput({ onIntentParsed }: SemanticIntentInputProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedIntent | null>(null);

  const handleInterpret = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setParsedResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("parse-campaign-intent", {
        body: { intent: inputText.trim() },
      });

      if (error) {
        console.error("Parse intent error:", error);
        toast.error("Failed to interpret intent", { description: error.message });
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        if (data.status === 429) {
          toast.error("Rate limit exceeded", { description: "Please try again in a moment" });
        } else if (data.status === 402) {
          toast.error("Usage limit reached", { description: "Please add credits to your workspace" });
        } else {
          toast.error("Interpretation failed", { description: data.error });
        }
        setIsLoading(false);
        return;
      }

      const result = data as ParsedIntent;
      setParsedResult(result);
      onIntentParsed(result);
      toast.success("Intent interpreted!", { description: result.summary });
    } catch (err) {
      console.error("Parse intent error:", err);
      toast.error("Failed to interpret intent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setParsedResult(null);
  };

  const hasBadges = parsedResult && (
    parsedResult.campaign_goal ||
    parsedResult.lifestyle_pillars.length > 0 ||
    parsedResult.life_events.length > 0 ||
    parsedResult.products_has.length > 0 ||
    parsedResult.products_lacks.length > 0 ||
    parsedResult.cross_sell_strategies.length > 0 ||
    parsedResult.upsell_strategies.length > 0
  );

  return (
    <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent p-4 rounded-lg border border-primary/20 mb-4 space-y-3">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-2.5 shrink-0" />
        <div className="flex-1 space-y-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your campaign target... e.g. 'cross sell high spenders in cashback cards with wealth management, theme of financial wellness'"
            className="min-h-[60px] resize-none bg-background/80 border-border text-sm"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleInterpret();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleInterpret}
              disabled={!inputText.trim() || isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isLoading ? "Interpreting…" : "Interpret & Build"}
            </Button>
            {(inputText || parsedResult) && (
              <button
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">⌘+Enter to submit</span>
          </div>
        </div>
      </div>

      {hasBadges && (
        <div className="flex flex-wrap gap-1.5 pl-8">
          {parsedResult.campaign_goal && (
            <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] px-2 py-0.5">
              Goal: {formatGoal(parsedResult.campaign_goal)}
            </Badge>
          )}
          {parsedResult.lifestyle_pillars.map(p => (
            <Badge key={p} variant="secondary" className="bg-violet-500/15 text-violet-400 text-[10px] px-2 py-0.5">
              {p}
            </Badge>
          ))}
          {parsedResult.life_events.map(e => (
            <Badge key={e} variant="secondary" className="bg-amber-500/15 text-amber-400 text-[10px] px-2 py-0.5">
              Event: {e}
            </Badge>
          ))}
          {parsedResult.products_has.map(p => (
            <Badge key={`has-${p}`} variant="secondary" className="bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5">
              Has: {p}
            </Badge>
          ))}
          {parsedResult.products_lacks.map(p => (
            <Badge key={`lacks-${p}`} variant="secondary" className="bg-destructive/15 text-destructive text-[10px] px-2 py-0.5">
              Lacks: {p}
            </Badge>
          ))}
          {parsedResult.cross_sell_strategies.map(s => (
            <Badge key={s} variant="secondary" className="bg-blue-500/15 text-blue-400 text-[10px] px-2 py-0.5">
              Cross-Sell: {s.replace(/_/g, " ")}
            </Badge>
          ))}
          {parsedResult.upsell_strategies.map(s => (
            <Badge key={s} variant="secondary" className="bg-cyan-500/15 text-cyan-400 text-[10px] px-2 py-0.5">
              Upsell: {s.replace(/_/g, " ")}
            </Badge>
          ))}
          {parsedResult.income_bands.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-400 text-[10px] px-2 py-0.5">
              Income: {parsedResult.income_bands.map(b => b.replace(/_/g, " ")).join(", ")}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

function formatGoal(id: string): string {
  return id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
