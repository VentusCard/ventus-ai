import { useState } from "react";
import { EnrichedTransaction } from "@/types/transaction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Loader2, Plane, MapPin, Settings2 } from "lucide-react";
import { PILLAR_COLORS, getSourceColor } from "@/lib/sampleData";
import { TransactionDetailModal } from "./TransactionDetailModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface ResultsTableProps {
  transactions: EnrichedTransaction[];
  currentPhase?: "idle" | "classification" | "travel" | "complete";
  statusMessage?: string;
  onCorrection: (transactionId: string, correctedPillar: string, correctedSubcategory: string, reason: string) => void;
}

export function ResultsTable({ transactions, currentPhase = "idle", statusMessage = "", onCorrection }: ResultsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<EnrichedTransaction | null>(null);
  

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500/10 text-green-700 border-green-500/20";
    if (confidence >= 0.5) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    return "bg-red-500/10 text-red-700 border-red-500/20";
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Premium": return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "Standard": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "Budget": return "bg-teal-500/10 text-teal-700 border-teal-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Weekly": return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
      case "Monthly": return "bg-violet-500/10 text-violet-700 border-violet-500/20";
      case "Occasional": return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
      case "Annually": return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "One-Time": return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <>
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Enriched Results</CardTitle>
          <CardDescription>
            AI-classified transactions with lifestyle pillar assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPhase === "classification" && transactions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">{statusMessage}</span>
              </div>
            </div>
          )}
          {transactions.length === 0 && currentPhase === "classification" && (
            <div className="text-center py-12 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p>Waiting for first batch of results...</p>
              <p className="text-sm mt-2">This should take ~10 seconds</p>
            </div>
          )}
          {transactions.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-auto">
              <Table className="text-xs table-fixed w-full">
                <colgroup>
                  <col className="w-[110px]" /> {/* Merchant */}
                  <col className="w-[52px]" />  {/* Amt */}
                  <col className="w-[72px]" />  {/* Date */}
                  <col className="w-[20px]" />  {/* Arrow */}
                  <col className="w-[130px]" /> {/* Pillar */}
                  <col className="w-[85px]" />  {/* Category */}
                  <col className="w-[85px]" />  {/* Subcategories */}
                  <col className="w-[60px]" />  {/* Trip */}
                  <col className="w-[52px]" />  {/* Tier */}
                  <col className="w-[56px]" />  {/* Freq */}
                  {transactions.some(t => t.source) && <col className="w-[60px]" />}
                  <col className="w-[40px]" />  {/* Conf */}
                  <col className="w-[36px]" />  {/* Actions */}
                </colgroup>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Merchant</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Amt</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Date</TableHead>
                    <TableHead className="px-0">
                      <span className="sr-only">Arrow</span>
                    </TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Pillar</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Category</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Sub-cat</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Trip</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Tier</TableHead>
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Freq</TableHead>
                    {transactions.some(t => t.source) && (
                      <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Source</TableHead>
                    )}
                    <TableHead className="text-slate-700 text-[11px] px-1.5 py-1.5">Conf</TableHead>
                    <TableHead className="text-center text-slate-700 text-[11px] px-1 py-1.5">
                       <Settings2 className="w-4 h-4 text-slate-500 mx-auto" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.transaction_id} className="hover:bg-slate-50/50">
                      <TableCell className="px-1.5 py-1">
                        <div className="truncate font-medium text-slate-900" title={transaction.normalized_merchant}>
                          {transaction.normalized_merchant}
                        </div>
                        {transaction.merchant_name !== transaction.normalized_merchant && (
                          <div className="text-[10px] text-slate-500 truncate" title={transaction.merchant_name}>
                            {transaction.merchant_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-slate-900 px-1.5 py-1 whitespace-nowrap">${transaction.amount.toFixed(0)}</TableCell>
                      <TableCell className="text-slate-700 whitespace-nowrap px-1.5 py-1">{transaction.date}</TableCell>
                      <TableCell className="px-0 py-1">
                        <ArrowRight className="w-3 h-3 text-primary mx-auto" />
                      </TableCell>
                      <TableCell className="px-1.5 py-1">
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${PILLAR_COLORS[transaction.pillar]}20`,
                            color: PILLAR_COLORS[transaction.pillar],
                            borderColor: `${PILLAR_COLORS[transaction.pillar]}40`,
                          }}
                          className="border text-[9px] px-1 py-0 truncate max-w-full text-center"
                          title={transaction.pillar}
                        >
                          {transaction.pillar}
                        </Badge>
                        {!transaction.travel_context && currentPhase === "travel" && (
                          <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 font-medium mt-0.5 px-1 py-0">
                            <Loader2 className="h-2.5 w-2.5 animate-spin mr-0.5" />
                            …
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-700 px-1.5 py-1">
                        <span className="truncate block" title={transaction.category}>{transaction.category || "—"}</span>
                      </TableCell>
                      <TableCell className="px-1.5 py-1">
                        <div className="flex flex-wrap gap-0.5">
                          {(transaction.subcategories ?? [transaction.subcategory]).map((sub, i) => (
                            <span key={i} className="inline-block bg-slate-100 text-slate-600 text-[9px] px-1 py-px rounded truncate max-w-[80px]" title={sub}>{sub}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-1.5 py-1">
                        {transaction.trip_label ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-0.5 bg-purple-500/10 text-purple-700 border border-purple-500/20 text-[9px] px-1 py-px rounded cursor-help truncate max-w-full" title={transaction.trip_label}>
                                  <Plane className="w-2.5 h-2.5 shrink-0" />
                                  {transaction.travel_context?.travel_destination || "Trip"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="text-xs space-y-1.5">
                                  <p className="font-semibold flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {transaction.trip_label}
                                  </p>
                                  {transaction.travel_context?.travel_period_start && (
                                    <p>🗓️ {new Date(transaction.travel_context.travel_period_start).toLocaleDateString()} - {new Date(transaction.travel_context.travel_period_end!).toLocaleDateString()}</p>
                                  )}
                                  {transaction.travel_context?.reclassification_reason && (
                                    <p className="text-slate-600 italic pt-1 border-t border-slate-200 mt-1">
                                      {transaction.travel_context.reclassification_reason}
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-1.5 py-1">
                        <Badge
                          variant="outline"
                          className={`${getTierColor(transaction.spending_tier)} text-[9px] px-1 py-0`}
                        >
                          {transaction.spending_tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-1.5 py-1">
                        <Badge
                          variant="outline"
                          className={`${getFrequencyColor(transaction.purchase_frequency)} text-[9px] px-1 py-0`}
                        >
                          {transaction.purchase_frequency}
                        </Badge>
                      </TableCell>
                      {transactions.some(t => t.source) && (
                        <TableCell className="px-1.5 py-1">
                          {transaction.source ? (
                            <Badge variant="outline" className={`text-[9px] font-medium px-1 py-0 ${getSourceColor(transaction.source)}`}>
                              {transaction.source}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="px-1.5 py-1">
                        <Badge
                          variant="outline"
                          className={`${getConfidenceColor(transaction.confidence)} text-[9px] px-1 py-0`}
                        >
                          {(transaction.confidence * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center px-1 py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 mx-auto"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="w-2.5 h-2.5 text-slate-700" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onCorrection={onCorrection}
        />
      )}
    </>
  );
}
