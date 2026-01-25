import { EnrichedTransaction } from "@/types/transaction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PILLAR_COLORS } from "@/lib/sampleData";
import { Plane, MapPin } from "lucide-react";

interface TransactionDetailModalProps {
  transaction: EnrichedTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Transaction Details</DialogTitle>
          <DialogDescription className="text-slate-500">
            AI classification details and explanation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Merchant</p>
              <p className="font-medium text-slate-900">{transaction.normalized_merchant}</p>
              {transaction.merchant_name !== transaction.normalized_merchant && (
                <p className="text-xs text-slate-500">Original: {transaction.merchant_name}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Amount</p>
              <p className="font-medium text-lg text-slate-900">${transaction.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-medium text-slate-900">{transaction.date}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">MCC Code</p>
              <p className="font-medium text-slate-900">{transaction.mcc || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Zip Code</p>
              <p className="font-medium text-slate-900">{transaction.zip_code || "Not provided"}</p>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          <div>
            <p className="text-sm text-slate-500 mb-2">Lifestyle Pillar</p>
            {transaction.travel_context?.is_travel_related && transaction.travel_context.original_pillar && transaction.travel_context.original_pillar !== "Travel & Exploration" ? (
              <div className="flex items-center gap-2">
                <Badge
                  className="border flex items-center gap-1"
                  style={{
                    backgroundColor: `${PILLAR_COLORS["Travel & Exploration"]}15`,
                    color: PILLAR_COLORS["Travel & Exploration"],
                    borderColor: `${PILLAR_COLORS["Travel & Exploration"]}30`,
                  }}
                >
                  <Plane className="w-4 h-4" />
                  Travel Context
                </Badge>
                <span className="text-muted-foreground">for</span>
                <Badge
                  style={{
                    backgroundColor: `${PILLAR_COLORS[transaction.travel_context.original_pillar]}20`,
                    color: PILLAR_COLORS[transaction.travel_context.original_pillar],
                    borderColor: `${PILLAR_COLORS[transaction.travel_context.original_pillar]}40`,
                  }}
                  className="border text-base px-3 py-1"
                >
                  {transaction.travel_context.original_pillar}
                </Badge>
              </div>
            ) : (
              <Badge
                style={{
                  backgroundColor: `${PILLAR_COLORS[transaction.pillar]}20`,
                  color: PILLAR_COLORS[transaction.pillar],
                  borderColor: `${PILLAR_COLORS[transaction.pillar]}40`,
                }}
                className="border text-base px-3 py-1"
              >
                {transaction.pillar}
              </Badge>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-2">Subcategory</p>
            <p className="font-medium text-slate-900">{transaction.subcategory}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-2">Confidence Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${transaction.confidence * 100}%` }}
                />
              </div>
              <span className="font-medium text-slate-900">{(transaction.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          <div>
            <p className="text-sm font-medium mb-2 text-slate-900">AI Explanation</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              {transaction.explanation}
            </p>
          </div>

          {transaction.travel_context?.is_travel_related && (
            <>
              <Separator />
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                    Travel Pattern Detected
                  </p>
                </div>
                
                <div className="space-y-3">
                  {transaction.travel_context.travel_destination && (
                    <div>
                      <p className="text-xs text-slate-500">Destination</p>
                      <p className="text-sm font-medium flex items-center gap-1 text-slate-900">
                        <MapPin className="w-3 h-3" />
                        {transaction.travel_context.travel_destination}
                      </p>
                    </div>
                  )}
                  
                  {transaction.travel_context.travel_period_start && (
                    <div>
                      <p className="text-xs text-slate-500">Travel Period</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(transaction.travel_context.travel_period_start).toLocaleDateString()} - {new Date(transaction.travel_context.travel_period_end!).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {transaction.travel_context.reclassification_reason && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">AI Reasoning</p>
                      <p className="text-sm leading-relaxed italic text-slate-700">
                        {transaction.travel_context.reclassification_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {transaction.description && (
            <>
              <Separator className="bg-slate-200" />
              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-900">{transaction.description}</p>
              </div>
            </>
          )}

          <div className="text-xs text-slate-500">
            Enriched at: {new Date(transaction.enriched_at).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
