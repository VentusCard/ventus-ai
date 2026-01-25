import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Save, ListTodo, CheckCircle, Clock, Sparkles, Loader2 } from "lucide-react";
import { sampleChatMessages, ChatMessage, Task, NextStepsActionItem, PsychologicalInsight } from "./sampleData";
import { useToast } from "@/hooks/use-toast";
import { AIInsights, LifeEvent, SavedFinancialProjection } from "@/types/lifestyle-signals";
import { EnrichedTransaction } from "@/types/transaction";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { AdvisorContext, FinancialPlanContext } from "@/lib/advisorContextBuilder";
import { TaskItem } from "./TaskItem";
import { FinancialTimelineTool } from "./FinancialTimelineTool";
import { ClientPsychologyDialog } from "./ClientPsychologyDialog";
import { TaxPlanningDialog } from "./TaxPlanningDialog";
import { ClientProfileData } from "@/types/clientProfile";

interface VentusChatPanelProps {
  selectedLifestyleChip?: string | null;
  onSaveToDocument?: (message: ChatMessage) => void;
  onAddToTodo?: (message: ChatMessage) => void;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  aiInsights: AIInsights | null;
  isLoadingInsights: boolean;
  enrichedTransactions?: EnrichedTransaction[];
  advisorContext?: AdvisorContext;
  onExtractNextSteps?: (actionItems: NextStepsActionItem[], psychologicalInsights: PsychologicalInsight[], chipSource?: string) => void;
  onSaveProjection?: (projection: SavedFinancialProjection) => void;
  onAddTimelineActionItems?: (items: NextStepsActionItem[]) => void;
  psychologicalInsights?: PsychologicalInsight[];
  clientProfile?: ClientProfileData | null;
  // Cross-panel communication props
  pendingMessage?: string | null;
  onPendingMessageConsumed?: () => void;
  externalTimelineEvent?: LifeEvent | null;
  externalTimelineOpen?: boolean;
  onExternalTimelineHandled?: () => void;
}
// Helper function to extract action items from AI response
// ONLY matches checkbox format: - [ ] text or * [ ] text
function extractActionItemsFromMessage(content: string): string[] {
  const items: string[] = [];
  const lines = content.split('\n');
  
  console.log('[extractActionItems] Processing content with', lines.length, 'lines');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // ONLY match checkbox format: - [ ] text or - [] text or * [ ] text
    const checkboxMatch = trimmed.match(/^[-*]\s*\[\s*\]\s+(.+)/);
    
    if (checkboxMatch) {
      const cleanedItem = checkboxMatch[1].replace(/\*\*/g, '').trim();
      if (cleanedItem.length > 3 && cleanedItem.length < 200) {
        console.log('[extractActionItems] Found checkbox item:', cleanedItem.slice(0, 50));
        items.push(cleanedItem);
      }
    }
  }
  
  console.log('[extractActionItems] Total items extracted:', items.length);
  return items.slice(0, 10); // Allow up to 10 items
}

export function VentusChatPanel({
  selectedLifestyleChip,
  onSaveToDocument,
  onAddToTodo,
  tasks,
  onToggleTask,
  aiInsights,
  isLoadingInsights,
  enrichedTransactions = [],
  advisorContext,
  onExtractNextSteps,
  onSaveProjection,
  onAddTimelineActionItems,
  psychologicalInsights = [],
  clientProfile,
  pendingMessage,
  onPendingMessageConsumed,
  externalTimelineEvent,
  externalTimelineOpen,
  onExternalTimelineHandled
}: VentusChatPanelProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [todoOpen, setTodoOpen] = useState(true);
  const [psychologyDialogOpen, setPsychologyDialogOpen] = useState(false);
  const [financialTimelineOpen, setFinancialTimelineOpen] = useState(false);
  const [taxPlanningDialogOpen, setTaxPlanningDialogOpen] = useState(false);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<LifeEvent | null>(null);
  const [activeChipSource, setActiveChipSource] = useState<string | null>(null);
  const {
    toast
  } = useToast();

  // Merge psychology insights and client profile into advisor context for AI
  const activePsychologyInsights = psychologicalInsights.filter(p => p.confidence > 0);
  const enrichedContext = useMemo(() => {
    // Build context even without advisorContext, as long as we have clientProfile or psychology insights
    if (!advisorContext && !clientProfile && activePsychologyInsights.length === 0) {
      return undefined;
    }
    return {
      ...(advisorContext || {}),
      clientPsychology: activePsychologyInsights,
      clientProfile: clientProfile || undefined
    };
  }, [advisorContext, activePsychologyInsights, clientProfile]);

  // Use advisor chat hook for live AI conversations with enriched context
  const {
    messages,
    isLoading: isChatLoading,
    sendMessage
  } = useAdvisorChat({
    advisorContext: enrichedContext
  });

  // Track processed messages by content hash to prevent duplicate extraction
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // Extract action items when AI responds
  useEffect(() => {
    if (messages.length === 0 || !onExtractNextSteps) return;
    const lastMessage = messages[messages.length - 1];

    // Skip if not an assistant message
    if (lastMessage.role !== 'assistant') {
      console.log('[VentusChatPanel] Skipping non-assistant message');
      return;
    }

    // Use content hash for reliable tracking (first 100 chars + length)
    const messageHash = `${lastMessage.content.slice(0, 100)}-${lastMessage.content.length}`;
    if (processedMessagesRef.current.has(messageHash)) {
      console.log('[VentusChatPanel] Message already processed, skipping');
      return;
    }

    // Mark as processed BEFORE extraction to prevent re-runs
    processedMessagesRef.current.add(messageHash);
    console.log('[VentusChatPanel] Processing new assistant message...');

    // Extract action items from the message
    const extractedItems = extractActionItemsFromMessage(lastMessage.content);
    console.log('[VentusChatPanel] Extracted items count:', extractedItems.length);
    
    const currentChipSource = activeChipSource;
    const actionItems: NextStepsActionItem[] = extractedItems.map((text, idx) => ({
      id: `action-${Date.now()}-${idx}`,
      text,
      completed: false,
      source: 'chat',
      chipSource: currentChipSource || undefined,
      timestamp: new Date()
    }));

    if (actionItems.length > 0) {
      console.log('[VentusChatPanel] Adding', actionItems.length, 'items to Action Items panel');
      onExtractNextSteps(actionItems, [], currentChipSource || undefined);
      toast({
        title: `${actionItems.length} Action Items Added`,
        description: "Check the Next Steps panel",
        duration: 2000
      });
    } else {
      console.log('[VentusChatPanel] No action items found in response');
    }
    
    // Clear active chip after extraction
    setActiveChipSource(null);
  }, [messages, onExtractNextSteps, activeChipSource, toast]);
  // Handle pending message from other panels (Ask Ventus)
  useEffect(() => {
    if (pendingMessage) {
      setInputValue(pendingMessage);
      onPendingMessageConsumed?.();
    }
  }, [pendingMessage, onPendingMessageConsumed]);

  // Handle external timeline trigger (Plan This Event)
  useEffect(() => {
    if (externalTimelineOpen && externalTimelineEvent) {
      setSelectedTimelineEvent(externalTimelineEvent);
      setFinancialTimelineOpen(true);
      onExternalTimelineHandled?.();
    }
  }, [externalTimelineOpen, externalTimelineEvent, onExternalTimelineHandled]);

  const todayTasks = tasks.filter(t => t.category === 'today');
  const incompleteTasks = todayTasks.filter(t => !t.completed);
  const completedTasks = todayTasks.filter(t => t.completed);
  const primaryChips = ["Financial Planning", "Life Event Planner", "Tax Planning", "Product Recommendations"];
  const secondaryChips = ["Meeting Prep", "Spending Trends", "Financial Standing", "Lifestyle Profile", "Client Psychology"];
  const handleChipClick = (chip: string) => {
    // Track which chip was clicked for refresh logic
    setActiveChipSource(chip);
    
    let prompt = "";
    switch (chip) {
      case "Meeting Prep":
        prompt = "Give me 5 actionable meeting prep tasks for my upcoming client meeting. These should be specific things I need to do or discuss.";
        break;
      case "Product Recommendations":
        prompt = "Based on spending patterns, what products should I recommend to this client?";
        break;
      case "Life Events Summary":
        prompt = "Summarize the detected life events and their implications.";
        break;
      case "Spending Trends":
        prompt = "Analyze this client's spending trends and highlight key insights.";
        break;
      case "Financial Standing":
        prompt = "Summarize this client's overall financial standing, including their retirement readiness, progress toward financial goals, tax-advantaged account utilization, and any areas needing attention.";
        break;
      case "Lifestyle Profile":
        prompt = "Create a brief lifestyle profile for this client.";
        break;
      case "Merchant Loyalty":
        prompt = "What are the top merchant loyalty patterns for this client?";
        break;
      case "Financial Planning":
        // Navigate to financial planning page
        navigate("/tepilot/financial-planning");
        return;
      case "Life Event Planner":
        // Find the highest-confidence event with a financial projection
        const bestEvent = visibleEvents.filter(e => e.financial_projection).sort((a, b) => b.confidence - a.confidence)[0];
        setSelectedTimelineEvent(bestEvent || null);
        setFinancialTimelineOpen(true);
        return;
      case "Tax Planning":
        setTaxPlanningDialogOpen(true);
        return;
      case "Client Psychology":
        setPsychologyDialogOpen(true);
        return;
      default:
        prompt = `[${chip}] `;
    }
    setInputValue(prompt);
  };
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatLoading) return;
    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message);
  };
  const handleSaveToDoc = (content: string) => {
    toast({
      title: "✓ Saved to Document",
      description: "Message added to Client Brief Builder",
      duration: 2000
    });
  };
  const handleAddToTodoFromMessage = (content: string) => {
    const extractedItems = extractActionItemsFromMessage(content);
    
    if (extractedItems.length === 0) {
      // If no structured items found, add the whole message as a single item (truncated)
      const singleItem: NextStepsActionItem = {
        id: `todo-${Date.now()}`,
        text: content.slice(0, 200),
        completed: false,
        source: 'chat',
        timestamp: new Date()
      };
      onExtractNextSteps?.([singleItem], []);
      toast({
        title: "✓ Added to Action Items",
        description: "1 item added to Next Steps",
        duration: 2000
      });
    } else {
      const actionItems: NextStepsActionItem[] = extractedItems.map((text, idx) => ({
        id: `todo-${Date.now()}-${idx}`,
        text,
        completed: false,
        source: 'chat',
        timestamp: new Date()
      }));
      onExtractNextSteps?.(actionItems, []);
      toast({
        title: "✓ Added to Action Items",
        description: `${extractedItems.length} item(s) added to Next Steps`,
        duration: 2000
      });
    }
  };
  const visibleEvents = aiInsights?.detected_events || [];
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-gradient-to-r from-white to-slate-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Ventus AI Advisor Chat
            </h2>
          </div>
        {isLoadingInsights && <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing lifestyle signals...</span>
            </div>}
        </div>
      </div>


      {/* Smart Chips */}
      <div className="border-b px-4 py-3 bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-slate-700">Recommended Prompts</span>
        </div>
        {/* Row 1: Primary Planning Prompts */}
        <div className="flex flex-wrap gap-2 mb-2">
          {primaryChips.map(chip => (
            <Button key={chip} variant="default" size="sm" onClick={() => handleChipClick(chip)} className="text-xs">
              {chip}
            </Button>
          ))}
        </div>
        {/* Row 2: Insights & Analysis Prompts */}
        <div className="flex flex-wrap gap-2">
          {secondaryChips.map(chip => (
            <Button key={chip} variant="outline" size="sm" onClick={() => handleChipClick(chip)} className="text-xs">
              {chip}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && <div className="text-center py-12">
            
            <h3 className="font-semibold mb-2">Start a Conversation</h3>
            <p className="text-sm text-slate-500">
              Ask me anything about the client's spending patterns, life events, or get recommendations
            </p>
          </div>}
        
        {messages.map((message, idx) => <Card key={idx} className={`p-3 ${message.role === 'assistant' ? 'bg-slate-50 border-slate-200' : 'bg-primary/5 border-primary/20'}`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${message.role === 'assistant' ? 'bg-primary text-white' : 'bg-slate-900 text-white'}`}>
                {message.role === 'assistant' ? 'V' : 'You'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900">
                    {message.role === 'assistant' ? 'Ventus AI' : 'Advisor'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
                  </span>
                </div>
                
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Action Buttons for AI messages */}
                {message.role === 'assistant' && <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => handleSaveToDoc(message.content)} className="text-xs">
                      <Save className="w-3 h-3 mr-1" />
                      Save to Document
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={() => handleAddToTodoFromMessage(message.content)} className="text-xs">
                      <ListTodo className="w-3 h-3 mr-1" />
                      Add to To-Do
                    </Button>

                    {/* Show timeline button if message mentions financial planning keywords */}
                    {(message.content.toLowerCase().includes('timeline') || message.content.toLowerCase().includes('projection') || message.content.toLowerCase().includes('college') || message.content.toLowerCase().includes('retirement') || message.content.toLowerCase().includes('financial plan')) && <Button variant="ghost" size="sm" onClick={() => {
                // Find best event or use null for custom timeline
                const bestEvent = visibleEvents.filter(e => e.financial_projection).sort((a, b) => b.confidence - a.confidence)[0];
                setSelectedTimelineEvent(bestEvent || null);
                setFinancialTimelineOpen(true);
              }} className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Generate Timeline
                      </Button>}
                  </div>}
              </div>
            </div>
          </Card>)}
        
        {isChatLoading && <Card className="p-3 bg-slate-50 border-slate-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-primary text-white">
                V
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-900">Ventus AI</span>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <p className="text-sm text-slate-500">Analyzing context and preparing response...</p>
              </div>
            </div>
          </Card>}
      </div>

      {/* Input Area */}
      <div className="border-t px-4 py-3 bg-slate-50 flex-shrink-0">
        <div className="flex gap-2">
          <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Ask about spending patterns, life events, product recommendations..." className="flex-1" onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }} disabled={isChatLoading} />
          <Button size="icon" onClick={handleSendMessage} disabled={isChatLoading || !inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Client Psychology Dialog */}
      <ClientPsychologyDialog 
        open={psychologyDialogOpen} 
        onOpenChange={setPsychologyDialogOpen} 
        onSaveInsights={(insights) => {
          if (onExtractNextSteps) {
            onExtractNextSteps([], insights);
          }
        }}
      />

      <FinancialTimelineTool 
        open={financialTimelineOpen} 
        onOpenChange={setFinancialTimelineOpen} 
        detectedEvent={selectedTimelineEvent || undefined} 
        onSaveProjection={onSaveProjection}
        onAddActionItems={onAddTimelineActionItems}
      />

      <TaxPlanningDialog
        open={taxPlanningDialogOpen}
        onOpenChange={setTaxPlanningDialogOpen}
        clientProfile={clientProfile || null}
        financialPlanData={(enrichedContext as any)?.financialPlan || null}
        enrichedTransactions={enrichedTransactions}
        onAskAI={(prompt) => {
          setInputValue(prompt);
          setTaxPlanningDialogOpen(false);
        }}
      />
    </div>;
}