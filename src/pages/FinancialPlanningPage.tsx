import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EnrichedTransaction } from "@/types/transaction";
import { AIInsights, LifeEvent } from "@/types/lifestyle-signals";
import { ClientProfileData } from "@/types/clientProfile";
import { PsychologicalInsight } from "@/components/tepilot/advisor-console/sampleData";
import { FinancialPlanner } from "@/components/tepilot/advisor-console/FinancialPlanner";
import { FinancialGoal } from "@/types/financial-planning";
import { useToast } from "@/hooks/use-toast";

const FinancialPlanningPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfileData | null>(null);
  const [psychologicalInsights, setPsychologicalInsights] = useState<PsychologicalInsight[]>([]);
  const [importedGoals, setImportedGoals] = useState<FinancialGoal[]>([]);

  useEffect(() => {
    // Load context from sessionStorage (same pattern as AdvisorConsolePage)
    const contextStr = sessionStorage.getItem("tepilot_advisor_context");
    if (contextStr) {
      try {
        const contextData = JSON.parse(contextStr);
        setEnrichedTransactions(contextData.enrichedTransactions || []);
        setAiInsights(contextData.aiInsights || null);
        console.log("Loaded financial planning context from sessionStorage");
      } catch (error) {
        console.error("Error loading context:", error);
      }
    }

    // Load client profile
    const profileStr = sessionStorage.getItem("tepilot_client_profile");
    if (profileStr) {
      try {
        setClientProfile(JSON.parse(profileStr));
      } catch (error) {
        console.error("Error loading client profile:", error);
      }
    }

    // Load psychological insights
    const psychStr = sessionStorage.getItem("psychologicalInsights");
    if (psychStr) {
      try {
        setPsychologicalInsights(JSON.parse(psychStr));
      } catch (error) {
        console.error("Error loading psychological insights:", error);
      }
    }

    // Check for pending goals from Life Event Planner
    const pendingGoalsStr = sessionStorage.getItem('pendingFinancialGoals');
    if (pendingGoalsStr) {
      try {
        const pendingGoals: FinancialGoal[] = JSON.parse(pendingGoalsStr);
        if (pendingGoals.length > 0) {
          setImportedGoals(pendingGoals);
          sessionStorage.removeItem('pendingFinancialGoals');
          toast({
            title: "Goals Imported",
            description: `${pendingGoals.length} goal(s) imported from Life Event Planner`,
          });
        }
      } catch (error) {
        console.error("Error loading pending goals:", error);
      }
    }
  }, [toast]);

  const handleOpenLifeEventPlanner = (event: LifeEvent) => {
    // Store the event to be opened
    sessionStorage.setItem("pendingLifeEvent", JSON.stringify(event));
    navigate("/tepilot/advisor-console", { state: { openTimeline: true } });
  };

  const handleSaveActionItems = (items: { id: string; text: string; completed: boolean }[]) => {
    // Store action items for the Advisor Console
    const existingItems = JSON.parse(sessionStorage.getItem("financialPlanActionItems") || "[]");
    const newItems = [...existingItems, ...items];
    sessionStorage.setItem("financialPlanActionItems", JSON.stringify(newItems));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200 px-4 py-3 bg-white z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tepilot/advisor-console")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Advisor Console
          </Button>
          <h2 className="text-sm font-medium text-slate-600">
            Financial Planning Tool
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <FinancialPlanner
          clientProfile={clientProfile}
          aiInsights={aiInsights}
          enrichedTransactions={enrichedTransactions}
          psychologicalInsights={psychologicalInsights}
          onOpenLifeEventPlanner={handleOpenLifeEventPlanner}
          onSaveActionItems={handleSaveActionItems}
          importedGoals={importedGoals}
        />
      </div>
    </div>
  );
};

export default FinancialPlanningPage;
