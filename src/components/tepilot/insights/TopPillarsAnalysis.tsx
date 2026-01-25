import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, Sparkles, Loader2, Bot, CheckCircle2 } from "lucide-react";
import { EnrichedTransaction } from "@/types/transaction";
import { aggregateByPillar } from "@/lib/aggregations";
import { supabase } from "@/integrations/supabase/client";
import { UserPersonaCard } from "./UserPersonaCard";
import { cn } from "@/lib/utils";

// Helper function for confidence color styling
const getConfidenceStyle = (confidence: number) => {
  if (confidence >= 0.85) return { 
    bg: 'bg-green-500/10', 
    text: 'text-green-600',
    border: 'border-green-500/30',
    progress: '[&>div]:bg-green-500',
    label: 'HIGH' 
  };
  if (confidence >= 0.60) return { 
    bg: 'bg-amber-500/10', 
    text: 'text-amber-600',
    border: 'border-amber-500/30',
    progress: '[&>div]:bg-amber-500',
    label: 'MODERATE' 
  };
  return { 
    bg: 'bg-red-500/10', 
    text: 'text-red-600',
    border: 'border-red-500/30',
    progress: '[&>div]:bg-red-500',
    label: 'LOW' 
  };
};

interface AnalyzedTransaction {
  transaction_id: string;
  inferred_purchase: string;
  confidence: number;
}

interface AnalyzedPillar {
  pillar: string;
  totalSpend: number;
  transactions: AnalyzedTransaction[];
}

interface UserPersona {
  summary: string;
  lifestyle_traits: string[];
  spending_behaviors: string[];
  interests: string[];
}

interface CustomerContext {
  homeZip?: string;
  incomeLevel?: string;
  industry?: string;
  familyStatus?: string;
}

interface TopPillarsAnalysisProps {
  transactions: EnrichedTransaction[];
  autoAnalyze?: boolean;
  onPersonaGenerated?: (persona: UserPersona) => void;
  customerContext?: CustomerContext;
}

const PILLAR_ICON = "💳";

export function TopPillarsAnalysis({ transactions, autoAnalyze = false, onPersonaGenerated, customerContext }: TopPillarsAnalysisProps) {
  const [analyzedPillars, setAnalyzedPillars] = useState<AnalyzedPillar[]>([]);
  const [userPersona, setUserPersona] = useState<UserPersona | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [analysisSucceeded, setAnalysisSucceeded] = useState(false);

  // Get top 3 pillars by spend
  const pillarAggregates = aggregateByPillar(transactions)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 3);

  const totalSpend = pillarAggregates.reduce((sum, p) => sum + p.totalSpend, 0);

  // Auto-trigger analysis on mount when autoAnalyze prop is true (no need to expand)
  useEffect(() => {
    if (autoAnalyze && !hasAnalyzed && !isAnalyzing && pillarAggregates.length > 0) {
      analyzeWithAI();
    }
  }, [autoAnalyze, hasAnalyzed, isAnalyzing, pillarAggregates.length]);

  const togglePillar = (pillar: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev);
      if (next.has(pillar)) {
        next.delete(pillar);
      } else {
        next.add(pillar);
      }
      return next;
    });
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare data for AI analysis
      // Prefer customerContext.homeZip, fallback to transaction-derived ZIP
      const homeZip = customerContext?.homeZip || transactions.find(t => t.home_zip)?.home_zip;

      const pillarsData = pillarAggregates.map(agg => {
        const pillarTransactions = transactions
          .filter(t => t.pillar === agg.pillar)
          .slice(0, 10)
          .map(t => ({
            transaction_id: t.transaction_id,
            merchant_name: t.normalized_merchant || t.merchant_name,
            amount: t.amount,
            date: t.date,
            subcategory: t.subcategory,
            zip_code: t.zip_code,
            home_zip: t.home_zip
          }));
        
        return {
          pillar: agg.pillar,
          totalSpend: agg.totalSpend,
          transactions: pillarTransactions
        };
      });

      const { data, error } = await supabase.functions.invoke('analyze-pillar-transactions', {
        body: { 
          pillars: pillarsData, 
          home_zip: homeZip,
          customer_context: customerContext ? {
            income_level: customerContext.incomeLevel,
            industry: customerContext.industry,
            family_status: customerContext.familyStatus,
          } : undefined
        }
      });

      if (error) throw error;

      if (data.analyzed_pillars) {
        setAnalyzedPillars(data.analyzed_pillars);
      }
      if (data.user_persona) {
        setUserPersona(data.user_persona);
        // Notify parent and persist to sessionStorage
        onPersonaGenerated?.(data.user_persona);
        sessionStorage.setItem("tepilot_user_persona", JSON.stringify(data.user_persona));
      }
      setHasAnalyzed(true);
      setAnalysisSucceeded(true);
      
      // Expand first pillar by default
      if (pillarAggregates.length > 0) {
        setExpandedPillars(new Set([pillarAggregates[0].pillar]));
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get analyzed transactions for a pillar
  const getAnalyzedTransactions = (pillar: string): AnalyzedTransaction[] => {
    const analyzed = analyzedPillars.find(p => p.pillar === pillar);
    return analyzed?.transactions || [];
  };

  if (pillarAggregates.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden bg-white border-slate-200">
      <Collapsible open={isCardExpanded} onOpenChange={setIsCardExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start gap-2">
                <CardTitle className="text-2xl text-slate-900">
                  Spending Profile Deep Dive
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Analyze parent-SKU level spending insight and construct spending persona
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isAnalyzing && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {analysisSucceeded && !isAnalyzing && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-fade-in" />
                )}
                <Badge variant="secondary" className="text-sm font-semibold">
                  ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Badge>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isCardExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {/* Collapsed Preview - Top 3 Pillars */}
            {!isCardExpanded && (
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                {pillarAggregates.map((pillar) => {
                  const percentage = (pillar.totalSpend / totalSpend) * 100;
                  return (
                    <div 
                      key={pillar.pillar}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{PILLAR_ICON}</span>
                        <span className="font-semibold">{pillar.pillar}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">
                          ${pillar.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                        <Badge variant="outline" className="text-xs min-w-[45px] justify-center">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="border-t border-slate-200 pt-4 space-y-6">
            {/* Analyze Button */}
            {!hasAnalyzed && !isAnalyzing && (
              <div className="flex justify-end">
                <Button onClick={analyzeWithAI} disabled={isAnalyzing}>
                  <Bot className="h-4 w-4 mr-2" />
                  Analyze with AI
                </Button>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-slate-500">Analyzing transactions...</span>
              </div>
            )}

            {/* Pillar Cards */}
            <div className="space-y-4">
              {pillarAggregates.map((pillar) => {
                const percentage = (pillar.totalSpend / totalSpend) * 100;
                const isExpanded = expandedPillars.has(pillar.pillar);
                const analyzedTxns = getAnalyzedTransactions(pillar.pillar);
                const pillarTransactions = transactions
                  .filter(t => t.pillar === pillar.pillar)
                  .slice(0, 10);

                return (
                  <Card key={pillar.pillar} className="overflow-hidden border-slate-200 bg-white">
                    <Collapsible open={isExpanded} onOpenChange={() => togglePillar(pillar.pillar)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{PILLAR_ICON}</span>
                              <div>
                                <CardTitle className="text-base font-medium text-slate-900">
                                  {pillar.pillar}
                                </CardTitle>
                                <p className="text-sm text-slate-500">
                                  {pillar.transactionCount} transactions
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold">${pillar.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-slate-500" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-slate-500" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="border-t border-slate-200 bg-slate-50 pt-4">
                          <div className="space-y-3">
                            {pillarTransactions.map((txn) => {
                              const analyzed = analyzedTxns.find(a => a.transaction_id === txn.transaction_id);
                              const confidenceStyle = analyzed ? getConfidenceStyle(analyzed.confidence) : null;
                              
                              return (
                                <div 
                                  key={txn.transaction_id}
                                  className="p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-all"
                                >
                                  {/* Line 1: Merchant + Amount */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-base">{PILLAR_ICON}</span>
                                      <span className="font-semibold truncate">
                                        {txn.normalized_merchant || txn.merchant_name}
                                      </span>
                                    </div>
                                    <span className="font-bold text-base shrink-0 ml-3">
                                      ${txn.amount.toFixed(2)}
                                    </span>
                                  </div>
                                  
                                  {/* Line 2: Date/Category + AI inference/Confidence */}
                                  <div className="flex items-center justify-between mt-1.5 text-sm">
                                    <span className="text-slate-500">
                                      {new Date(txn.date).toLocaleDateString()}
                                      {txn.subcategory && ` · ${txn.subcategory}`}
                                    </span>
                                    
                                    {analyzed ? (
                                      <div className="flex items-center gap-2 flex-wrap justify-end">
                                        <span className="text-slate-500 text-right">
                                          {analyzed.inferred_purchase}
                                        </span>
                                        <Badge 
                                          variant="outline" 
                                          className={cn("text-xs shrink-0", confidenceStyle?.text, confidenceStyle?.border)}
                                        >
                                          {Math.round(analyzed.confidence * 100)}%
                                        </Badge>
                                      </div>
                                    ) : isAnalyzing ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>

            {/* User Persona Card */}
            {userPersona && <UserPersonaCard persona={userPersona} />}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
