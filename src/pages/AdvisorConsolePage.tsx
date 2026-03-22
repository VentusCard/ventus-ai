import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdvisorConsole } from "@/components/tepilot/advisor-console/AdvisorConsole";
import { LifeEventsAlertDashboard } from "@/components/tepilot/advisor-console/LifeEventsAlertDashboard";
import { ArrowLeft, LayoutDashboard, User } from "lucide-react";
import { EnrichedTransaction } from "@/types/transaction";
import { AIInsights } from "@/types/lifestyle-signals";
import { buildAdvisorContext, AdvisorContext } from "@/lib/advisorContextBuilder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateDashboardClients } from "@/lib/randomProfileGenerator";
import { DashboardClient, EventPreparationData } from "@/types/dashboardClient";
import { cn } from "@/lib/utils";
import { buildEventPreparationPrompt } from "@/lib/eventPreparationPromptBuilder";

import type { DemoCustomer } from "@/lib/demoData";

type ViewMode = "dashboard" | "client";

const AdvisorConsolePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as {
    initialView?: ViewMode;
    demoCustomerA?: DemoCustomer;
    demoCustomerB?: DemoCustomer;
    activeCustomerId?: string;
  } | null;
  const initialView = routeState?.initialView;
  const [viewMode, setViewMode] = useState<ViewMode>(initialView || "dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    routeState?.activeCustomerId || null
  );
  const [advisorContext, setAdvisorContext] = useState<AdvisorContext | undefined>(undefined);
  const [pendingVentusMessage, setPendingVentusMessage] = useState<string | null>(null);

  // Store demo customers passed from the demo overlay (if any)
  const [demoCustomers] = useState<{ a: DemoCustomer; b: DemoCustomer } | null>(
    routeState?.demoCustomerA && routeState?.demoCustomerB
      ? { a: routeState.demoCustomerA, b: routeState.demoCustomerB }
      : null
  );

  // Generate dashboard clients once on mount
  const dashboardClients = useMemo(() => generateDashboardClients(60), []);

  // Derive selected client data for direct prop passing
  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    // Check demo customers first
    if (demoCustomers) {
      const demoMatch = [demoCustomers.a, demoCustomers.b].find(c => c.id === selectedClientId);
      if (demoMatch) {
        // Wrap DemoCustomer profile into a DashboardClient-like shape
        return {
          id: demoMatch.id,
          profile: demoMatch.profile,
          detectedEvents: [],
          lastContactDate: new Date(),
          engagementStatus: "active" as const,
        } satisfies DashboardClient;
      }
    }
    return dashboardClients.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId, dashboardClients, demoCustomers]);

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

  const handleOpenClient = useCallback((clientId: string) => {
    const client = dashboardClients.find(c => c.id === clientId);
    if (client) {
      // Store client profile in sessionStorage for AdvisorConsole to pick up
      sessionStorage.setItem("tepilot_client_profile", JSON.stringify(client.profile));
      // Also store the detected life events from dashboard
      sessionStorage.setItem("tepilot_detected_events", JSON.stringify(client.detectedEvents));
      setSelectedClientId(clientId);
      setViewMode("client");
    }
  }, [dashboardClients]);

  const handleScheduleCall = useCallback((clientId: string) => {
    const client = dashboardClients.find(c => c.id === clientId);
    toast.success(`Scheduling call with ${client?.profile.name || 'client'}...`);
  }, [dashboardClients]);

  const handleBackToDashboard = useCallback(() => {
    sessionStorage.removeItem("tepilot_detected_events");
    setViewMode("dashboard");
    setSelectedClientId(null);
    setPendingVentusMessage(null);
  }, []);

  const handlePrepareWithVentus = useCallback((data: EventPreparationData) => {
    // Store client profile
    sessionStorage.setItem("tepilot_client_profile", JSON.stringify(data.client.profile));
    // Store all detected events from this client
    sessionStorage.setItem("tepilot_detected_events", JSON.stringify(data.client.detectedEvents));
    
    // Store event preparation context for the chat
    sessionStorage.setItem("tepilot_event_preparation", JSON.stringify(data));
    
    // Build context-rich prompt
    const prompt = buildEventPreparationPrompt(data);
    
    // Set pending message and switch view
    setPendingVentusMessage(prompt);
    setSelectedClientId(data.client.id);
    setViewMode("client");
  }, []);

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

  // Handle launch from WM Copilot sign-in dialog
  useEffect(() => {
    const launchData = sessionStorage.getItem("wm_copilot_launch_client");
    if (launchData) {
      try {
        const profile = JSON.parse(launchData);
        sessionStorage.setItem("tepilot_client_profile", JSON.stringify(profile));
        sessionStorage.removeItem("wm_copilot_launch_client");
        // Use a stable ID from the profile name
        const syntheticId = `wm-launch-${profile.name?.replace(/\s+/g, '-').toLowerCase() || 'client'}`;
        setSelectedClientId(syntheticId);
        setViewMode("client");
      } catch (e) {
        console.error("Error parsing WM copilot launch data:", e);
        sessionStorage.removeItem("wm_copilot_launch_client");
      }
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
    <div className="tepilot-theme flex flex-col h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b px-4 py-3 bg-white z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToTePilot}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 h-9 w-9 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("dashboard")}
                className={cn(
                  "h-8 px-3 rounded-md",
                  viewMode === "dashboard" 
                    ? "bg-white shadow-sm text-slate-900" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("client")}
                className={cn(
                  "h-8 px-3 rounded-md",
                  viewMode === "client" 
                    ? "bg-white shadow-sm text-slate-900" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <User className="h-4 w-4 mr-2" />
                Client View
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-medium text-slate-500">
              Wealth Management Copilot
            </h2>
            
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {viewMode === "dashboard" ? (
          <LifeEventsAlertDashboard
            clients={dashboardClients}
            onOpenClient={handleOpenClient}
            onScheduleCall={handleScheduleCall}
            onPrepareWithVentus={handlePrepareWithVentus}
          />
        ) : (
          <AdvisorConsole 
            enrichedTransactions={enrichedTransactions}
            aiInsights={aiInsights}
            isLoadingInsights={isLoadingInsights}
            advisorContext={advisorContext}
            onBackToDashboard={handleBackToDashboard}
            initialPendingMessage={pendingVentusMessage}
            onPendingMessageConsumed={() => setPendingVentusMessage(null)}
            selectedClientProfile={selectedClient?.profile}
            selectedDashboardEvents={selectedClient?.detectedEvents}
          />
        )}
      </div>
    </div>
  );
};

export default AdvisorConsolePage;
