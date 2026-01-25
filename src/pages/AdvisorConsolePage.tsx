import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdvisorConsole } from "@/components/tepilot/advisor-console/AdvisorConsole";
import { ArrowLeft } from "lucide-react";
import { EnrichedTransaction } from "@/types/transaction";
import { AIInsights } from "@/types/lifestyle-signals";
import { buildAdvisorContext, AdvisorContext } from "@/lib/advisorContextBuilder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdvisorConsolePage = () => {
  const navigate = useNavigate();
  const [advisorContext, setAdvisorContext] = useState<AdvisorContext | undefined>(undefined);

  const handleBackToTePilot = () => {
    // Clear all advisor console related sessionStorage
    sessionStorage.removeItem("tepilot_advisor_context");
    sessionStorage.removeItem("tepilot_client_profile");
    sessionStorage.removeItem("tepilot_psychological_insights");
    sessionStorage.removeItem("tepilot_financial_plan");
    sessionStorage.removeItem("pendingFinancialGoals");
    sessionStorage.removeItem("pendingLifeEvent");
    sessionStorage.removeItem("financialPlanActionItems");
    
    // Navigate back to TePilot
    navigate("/tepilot", { state: { activeTab: "insights" } });
  };
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const fetchLifestyleSignals = useCallback(async (transactions: EnrichedTransaction[]) => {
    if (transactions.length === 0) return;
    
    setIsLoadingInsights(true);
    toast.info('Analyzing lifestyle signals...');
    
    try {
      // Prepare spending summary
      const spendingSummary: Record<string, number> = {};
      transactions.forEach(tx => {
        const pillar = tx.pillar || 'Unknown';
        spendingSummary[pillar] = (spendingSummary[pillar] || 0) + Math.abs(tx.amount);
      });

      const { data, error } = await supabase.functions.invoke('analyze-lifestyle-signals', {
        body: {
          client: {
            name: "Client",
            age: 45,
            occupation: "Professional"
          },
          transactions: [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 100)
            .map(tx => ({
            merchant_name: tx.normalized_merchant || tx.merchant_name,
            amount: tx.amount,
            date: tx.date,
            pillar: tx.pillar,
            subcategory: tx.subcategory
          })),
          spending_summary: spendingSummary
        }
      });

      if (error) {
        console.error('Error analyzing lifestyle signals:', error);
        toast.error('Failed to analyze lifestyle signals');
        return;
      }

      const insights: AIInsights = {
        detected_events: data?.detected_events || []
      };
      
      setAiInsights(insights);
      
      // Build and set advisor context
      const context = buildAdvisorContext(transactions, insights);
      setAdvisorContext(context);
      
      // Update sessionStorage with the insights
      const existingContext = sessionStorage.getItem("tepilot_advisor_context");
      if (existingContext) {
        const parsed = JSON.parse(existingContext);
        sessionStorage.setItem("tepilot_advisor_context", JSON.stringify({
          ...parsed,
          aiInsights: insights,
          needsAnalysis: false
        }));
      }
      
      toast.success('Lifestyle analysis complete');
      console.log("Lifestyle signals analyzed:", insights);
    } catch (error) {
      console.error('Error in lifestyle signal analysis:', error);
      toast.error('Failed to analyze lifestyle signals');
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    // Load advisor context from sessionStorage
    const contextStr = sessionStorage.getItem("tepilot_advisor_context");
    if (contextStr) {
      try {
        const contextData = JSON.parse(contextStr);
        const transactions = contextData.enrichedTransactions || [];
        setEnrichedTransactions(transactions);
        
        // Check if we need to fetch lifestyle signals
        if (contextData.needsAnalysis && !contextData.aiInsights) {
          // Build initial context without insights
          const initialContext = buildAdvisorContext(transactions, null);
          setAdvisorContext(initialContext);
          
          // Fetch insights in background
          fetchLifestyleSignals(transactions);
        } else {
          setAiInsights(contextData.aiInsights || null);
          
          // Build advisor context
          const context = buildAdvisorContext(
            transactions,
            contextData.aiInsights || null
          );
          setAdvisorContext(context);
          console.log("Loaded advisor context from sessionStorage", context);
        }
      } catch (error) {
        console.error("Error loading advisor context:", error);
      }
    }
  }, [fetchLifestyleSignals]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b px-4 py-3 bg-white z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTePilot}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to TePilot
          </Button>
          <h2 className="text-sm font-medium text-slate-500">
            Wealth Management Copilot
          </h2>
        </div>
      </div>

      {/* Full Advisor Console */}
      <div className="flex-1 min-h-0">
        <AdvisorConsole 
          enrichedTransactions={enrichedTransactions}
          aiInsights={aiInsights}
          isLoadingInsights={isLoadingInsights}
          advisorContext={advisorContext}
        />
      </div>
    </div>
  );
};

export default AdvisorConsolePage;
