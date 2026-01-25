import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
interface EnrichActionBarProps {
  transactionCount: number;
  isProcessing: boolean;
  statusMessage?: string;
  currentPhase?: "idle" | "classification" | "travel" | "complete";
  onEnrich: () => void;
}
export function EnrichActionBar({
  transactionCount,
  isProcessing,
  statusMessage = "",
  currentPhase = "idle",
  onEnrich
}: EnrichActionBarProps) {
  return <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        {!isProcessing ? <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1 text-slate-900">Ready to Analyze</h3>
              <p className="text-sm text-slate-600">
                {transactionCount} transactions will be classified into lifestyle pillars using AI
              </p>
            </div>
            <Button size="lg" onClick={onEnrich} className="w-full max-w-md" variant="ai" disabled={transactionCount === 0}>
              <Sparkles className="w-5 h-5 mr-2" />
              Ventus AI Transaction Enrichment (Live Service)
            </Button>
          </div> : <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-sm font-medium text-slate-900">
                {currentPhase === "classification" && "Classifying with flash-lite (fast)..."}
                {currentPhase === "travel" && "Algo 2: Analyzing travel patterns..."}
                {statusMessage || "Processing transactions..."}
              </p>
            </div>
            <p className="text-xs text-center text-slate-500">
              {currentPhase === "classification" && statusMessage.includes("Batch") 
                ? "Results are appearing below as each batch completes..." 
                : currentPhase === "classification" 
                ? "First results will appear in ~3 seconds..." 
                : "Results are visible! Travel context is being added in the background..."}
            </p>
          </div>}
      </CardContent>
    </Card>;
}