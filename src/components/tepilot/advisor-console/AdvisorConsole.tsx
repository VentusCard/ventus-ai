import { useState, useCallback, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ClientSnapshotPanel } from "./ClientSnapshotPanel";
import { VentusChatPanel } from "./VentusChatPanel";
import { ActionWorkspacePanel } from "./ActionWorkspacePanel";
import { ChatMessage, Task, sampleTasks, sampleClientData, NextStepsData, NextStepsActionItem, PsychologicalInsight, MeetingNotesResult, NextMeetingInfo } from "./sampleData";
import { AIInsights, SavedFinancialProjection, LifeEvent } from "@/types/lifestyle-signals";
import { EnrichedTransaction } from "@/types/transaction";
import { AdvisorContext, FinancialPlanContext } from "@/lib/advisorContextBuilder";
import { exportFinancialTimelinePDF } from "@/lib/financialTimelinePdfExport";
import { useToast } from "@/hooks/use-toast";
import { ClientProfileData } from "@/types/clientProfile";
import { generateRandomProfile, generateRandomPsychologicalInsights } from "@/lib/randomProfileGenerator";
import { DetectedLifeEvent } from "@/types/dashboardClient";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

interface AdvisorConsoleProps {
  aiInsights?: AIInsights | null;
  isLoadingInsights?: boolean;
  enrichedTransactions?: EnrichedTransaction[];
  advisorContext?: AdvisorContext;
  onBackToDashboard?: () => void;
  initialPendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
  selectedClientProfile?: ClientProfileData;
  selectedDashboardEvents?: DetectedLifeEvent[];
}

export function AdvisorConsole({ 
  aiInsights: propAiInsights, 
  isLoadingInsights = false,
  enrichedTransactions = [],
  advisorContext,
  onBackToDashboard,
  initialPendingMessage,
  onPendingMessageConsumed,
  selectedClientProfile,
  selectedDashboardEvents
}: AdvisorConsoleProps) {
  const { toast } = useToast();
  const [selectedLifestyleChip, setSelectedLifestyleChip] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [nextStepsData, setNextStepsData] = useState<NextStepsData>({
    actionItems: [],
    psychologicalInsights: [],
    lastUpdated: null
  });
  const [savedProjection, setSavedProjection] = useState<SavedFinancialProjection | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfileData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [financialPlanData, setFinancialPlanData] = useState<FinancialPlanContext | null>(null);
  const [dashboardEvents, setDashboardEvents] = useState<DetectedLifeEvent[] | null>(null);
  
  // Cross-panel communication state
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [pendingTimelineEvent, setPendingTimelineEvent] = useState<LifeEvent | null>(null);
  const [openTimelineTrigger, setOpenTimelineTrigger] = useState(false);
  const [nextMeetingInfo, setNextMeetingInfo] = useState<NextMeetingInfo | null>(null);

  // When parent passes a new client via props, overwrite all client state
  useEffect(() => {
    if (!selectedClientProfile) return;
    
    const newPsych = generateRandomPsychologicalInsights();
    
    setClientProfile(selectedClientProfile);
    setDashboardEvents(selectedDashboardEvents || null);
    setNextStepsData({
      actionItems: [],
      psychologicalInsights: newPsych,
      lastUpdated: new Date()
    });
    
    // Persist to sessionStorage for sub-pages
    sessionStorage.setItem("tepilot_client_profile", JSON.stringify(selectedClientProfile));
    sessionStorage.setItem("tepilot_psychological_insights", JSON.stringify(newPsych));
    if (selectedDashboardEvents) {
      sessionStorage.setItem("tepilot_detected_events", JSON.stringify(selectedDashboardEvents));
    }
    
    setIsInitialized(true);
  }, [selectedClientProfile, selectedDashboardEvents]);

  // Handle initial pending message from parent (e.g., Prepare with Ventus)
  useEffect(() => {
    if (initialPendingMessage) {
      setPendingChatMessage(initialPendingMessage);
      onPendingMessageConsumed?.();
    }
  }, [initialPendingMessage, onPendingMessageConsumed]);

  // Load financial plan data from sessionStorage
  useEffect(() => {
    const loadFinancialPlan = () => {
      const stored = sessionStorage.getItem("tepilot_financial_plan");
      if (stored) {
        try {
          setFinancialPlanData(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse financial plan data:", e);
        }
      }
    };
    
    loadFinancialPlan();
    
    // Listen for storage changes (when user navigates back from financial planning page)
    const handleStorageChange = () => loadFinancialPlan();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadFinancialPlan);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadFinancialPlan);
    };
  }, []);

  // Auto-generate all client data on mount
  useEffect(() => {
    if (isInitialized) return;

    // Check sessionStorage for existing data (returning from another page)
    const existingProfile = sessionStorage.getItem("tepilot_client_profile");
    const existingPsych = sessionStorage.getItem("tepilot_psychological_insights");
    const existingEvents = sessionStorage.getItem("tepilot_detected_events");

    // Load dashboard events if available
    if (existingEvents) {
      try {
        setDashboardEvents(JSON.parse(existingEvents));
      } catch (e) {
        console.error("Failed to parse dashboard events:", e);
      }
    }

    if (existingProfile && existingPsych) {
      // Restore from session
      setClientProfile(JSON.parse(existingProfile));
      setNextStepsData(prev => ({
        ...prev,
        psychologicalInsights: JSON.parse(existingPsych)
      }));
    } else {
      // Generate fresh data
      const newProfile = generateRandomProfile();
      const newPsych = generateRandomPsychologicalInsights();
      
      setClientProfile(newProfile);
      setNextStepsData(prev => ({
        ...prev,
        psychologicalInsights: newPsych
      }));
      
      // Persist to sessionStorage
      sessionStorage.setItem("tepilot_client_profile", JSON.stringify(newProfile));
      sessionStorage.setItem("tepilot_psychological_insights", JSON.stringify(newPsych));
      
      toast({
        title: "Client Loaded",
        description: `${newProfile.name} (${newProfile.segment}) ready for review`,
      });
    }
    
    setIsInitialized(true);
  }, [isInitialized, toast]);

  const handleGenerateProfile = useCallback(() => {
    const newProfile = generateRandomProfile();
    const newPsych = generateRandomPsychologicalInsights();
    
    setClientProfile(newProfile);
    setNextStepsData(prev => ({
      ...prev,
      psychologicalInsights: newPsych,
      actionItems: [], // Clear action items for new client
      lastUpdated: new Date()
    }));
    
    // Clear dashboard events for fresh client
    sessionStorage.removeItem("tepilot_detected_events");
    setDashboardEvents(null);
    
    // Persist to sessionStorage
    sessionStorage.setItem("tepilot_client_profile", JSON.stringify(newProfile));
    sessionStorage.setItem("tepilot_psychological_insights", JSON.stringify(newPsych));
    
    toast({
      title: "New Client Loaded",
      description: `${newProfile.name} (${newProfile.segment}) ready for review`,
    });
  }, [toast]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleExtractNextSteps = useCallback((actionItems: NextStepsActionItem[], psychologicalInsights: PsychologicalInsight[], chipSource?: string) => {
    setNextStepsData(prev => {
      let baseItems = prev.actionItems;
      
      // If same chip clicked again, remove ALL existing items from that chip (refresh behavior)
      if (chipSource) {
        baseItems = baseItems.filter(item => item.chipSource !== chipSource);
      }
      
      // Deduplicate by normalizing text (lowercase, trim, remove punctuation)
      const normalizeText = (text: string) => text.toLowerCase().trim().replace(/[^\w\s]/g, '');
      const existingTexts = new Set(baseItems.map(item => normalizeText(item.text)));
      
      // Only add items that don't already exist
      const newUniqueItems = actionItems.filter(item => 
        !existingTexts.has(normalizeText(item.text))
      );
      
      return {
        actionItems: [...baseItems, ...newUniqueItems],
        psychologicalInsights: psychologicalInsights.length > 0 ? psychologicalInsights : prev.psychologicalInsights,
        lastUpdated: new Date()
      };
    });
  }, []);

  const handleToggleActionItem = useCallback((itemId: string) => {
    setNextStepsData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  }, []);

  const handleAddActionItem = useCallback((text: string) => {
    const newItem: NextStepsActionItem = {
      id: `manual-${Date.now()}`,
      text: text.trim(),
      completed: false,
      source: 'manual',
      timestamp: new Date()
    };
    
    setNextStepsData(prev => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
      lastUpdated: new Date()
    }));
  }, []);

  const handleDeleteActionItem = useCallback((itemId: string) => {
    setNextStepsData(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== itemId),
      lastUpdated: new Date()
    }));
  }, []);

  const handleAddTimelineActionItems = useCallback((items: NextStepsActionItem[]) => {
    setNextStepsData(prev => {
      // Deduplicate by normalizing text
      const normalizeText = (text: string) => text.toLowerCase().trim().replace(/[^\w\s]/g, '');
      const existingTexts = new Set(prev.actionItems.map(item => normalizeText(item.text)));
      
      const newUniqueItems = items.filter(item => 
        !existingTexts.has(normalizeText(item.text))
      );
      
      return {
        ...prev,
        actionItems: [...newUniqueItems, ...prev.actionItems],
        lastUpdated: new Date()
      };
    });
  }, []);

  const handleSaveProjection = useCallback((projection: SavedFinancialProjection) => {
    setSavedProjection(projection);
  }, []);

  const handleExportTimelinePDF = useCallback(async () => {
    if (!savedProjection) return;
    
    toast({
      title: "Generating PDF...",
      description: "Please wait while we create your document",
    });

    try {
      await exportFinancialTimelinePDF(savedProjection);
      toast({
        title: "✓ PDF Downloaded",
        description: "Life event plan exported successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [savedProjection, toast]);

  const handleAskVentus = useCallback((context: string) => {
    setPendingChatMessage(context);
  }, []);

  const handlePlanEvent = useCallback((event: LifeEvent) => {
    setPendingTimelineEvent(event);
    setOpenTimelineTrigger(true);
  }, []);

  const handleMeetingNotesResult = useCallback((result: MeetingNotesResult) => {
    // Store products discussed for Product Recommendations chip
    if (result.productsDiscussed.length > 0) {
      sessionStorage.setItem("tepilot_products_discussed", JSON.stringify(result.productsDiscussed));
    }

    // Update next meeting info
    if (result.nextMeetingDate) {
      setNextMeetingInfo({
        date: result.nextMeetingDate,
        topic: result.nextMeetingTopic || undefined,
      });
    }
  }, []);

  const handleSaveToDocument = (message: ChatMessage) => {
    console.log("Save to document:", message);
    // Future: Add to document builder
  };

  const handleAddToTodo = (message: ChatMessage) => {
    console.log("Add to todo:", message);
    // Future: Create new task
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header with BofA/Merrill/Ventus branding */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-gradient-to-r from-white to-slate-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToDashboard}
              className="text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Wealth Management Advisor Co-Pilot
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              AI-powered relationship intelligence and client engagement platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-600">AI Active</span>
          </div>
        </div>
      </div>

      {/* 3-Panel Resizable Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* Left Panel: Client Snapshot */}
        <ResizablePanel defaultSize={22} minSize={15} maxSize={30}>
          <ClientSnapshotPanel 
            onAskVentus={handleAskVentus}
            onPlanEvent={handlePlanEvent}
            advisorContext={advisorContext}
            aiInsights={propAiInsights}
            isLoadingInsights={isLoadingInsights}
            clientData={clientProfile}
            onGenerateProfile={handleGenerateProfile}
            dashboardEvents={dashboardEvents}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="hover:bg-primary/20 transition-colors" />

        {/* Center Panel: Chat */}
        <ResizablePanel defaultSize={48} minSize={35} maxSize={60}>
          <VentusChatPanel
            selectedLifestyleChip={selectedLifestyleChip}
            onSaveToDocument={handleSaveToDocument}
            onAddToTodo={handleAddToTodo}
            tasks={tasks}
            onToggleTask={toggleTask}
            aiInsights={propAiInsights}
            isLoadingInsights={isLoadingInsights}
            enrichedTransactions={enrichedTransactions}
            advisorContext={advisorContext ? { ...advisorContext, financialPlan: financialPlanData || undefined } : undefined}
            onExtractNextSteps={handleExtractNextSteps}
            onSaveProjection={handleSaveProjection}
            onAddTimelineActionItems={handleAddTimelineActionItems}
            psychologicalInsights={nextStepsData.psychologicalInsights}
            clientProfile={clientProfile}
            pendingMessage={pendingChatMessage}
            onPendingMessageConsumed={() => setPendingChatMessage(null)}
            externalTimelineEvent={pendingTimelineEvent}
            externalTimelineOpen={openTimelineTrigger}
            onExternalTimelineHandled={() => {
              setOpenTimelineTrigger(false);
              setPendingTimelineEvent(null);
            }}
            onMeetingNotesResult={handleMeetingNotesResult}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="hover:bg-primary/20 transition-colors" />

        {/* Right Panel: Action Workspace */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <ActionWorkspacePanel 
            nextStepsData={nextStepsData}
            onToggleActionItem={handleToggleActionItem}
            onDeleteActionItem={handleDeleteActionItem}
            onAddActionItem={handleAddActionItem}
            savedProjection={savedProjection}
            onExportTimelinePDF={handleExportTimelinePDF}
            nextMeeting={nextMeetingInfo}
            clientProfile={clientProfile}
            dashboardEvents={dashboardEvents}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
