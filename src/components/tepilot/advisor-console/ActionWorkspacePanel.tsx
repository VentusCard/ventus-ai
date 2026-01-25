import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, Users, Phone, Mail, Brain, ListChecks, MessageSquare, FileDown, Plus, X, ChevronDown } from "lucide-react";
import { sampleMeeting, sampleEngagementData, NextStepsData } from "./sampleData";
import { SavedFinancialProjection } from "@/types/lifestyle-signals";
interface ActionWorkspacePanelProps {
  nextStepsData: NextStepsData;
  onToggleActionItem: (itemId: string) => void;
  onDeleteActionItem: (itemId: string) => void;
  onAddActionItem: (text: string) => void;
  savedProjection?: SavedFinancialProjection | null;
  onExportTimelinePDF?: () => void;
}
export function ActionWorkspacePanel({
  nextStepsData,
  onToggleActionItem,
  onDeleteActionItem,
  onAddActionItem,
  savedProjection,
  onExportTimelinePDF
}: ActionWorkspacePanelProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [isPsychologyOpen, setIsPsychologyOpen] = useState(true);
  const engagementColor = sampleEngagementData.status === 'high' ? 'bg-green-500' : sampleEngagementData.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500';
  const engagementText = sampleEngagementData.status === 'high' ? 'Strong' : sampleEngagementData.status === 'medium' ? 'Moderate' : 'Needs Attention';
  const incompleteItems = nextStepsData.actionItems.filter(item => !item.completed);
  const completedItems = nextStepsData.actionItems.filter(item => item.completed);

  // Default placeholder insights when none are filled
  const defaultPsychologicalInsights = [
    { aspect: "Decision Style", assessment: "Not assessed", confidence: 0, sliderValue: 3 },
    { aspect: "Risk Tolerance", assessment: "Not assessed", confidence: 0, sliderValue: 3 },
    { aspect: "Emotional State", assessment: "Not assessed", confidence: 0, sliderValue: 3 },
    { aspect: "Trust Level", assessment: "Not assessed", confidence: 0, sliderValue: 3 },
    { aspect: "Communication Style", assessment: "Not assessed", confidence: 0, sliderValue: 3 }
  ];

  const displayInsights = nextStepsData.psychologicalInsights.length > 0 
    ? nextStepsData.psychologicalInsights 
    : defaultPsychologicalInsights;
  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddActionItem(newItemText.trim());
      setNewItemText("");
      setIsAddingItem(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    } else if (e.key === 'Escape') {
      setIsAddingItem(false);
      setNewItemText("");
    }
  };
  return <div className="h-full flex flex-col bg-slate-50">
      {/* Meeting & Engagement Section */}
      <div className="border-b bg-white p-4 space-y-4 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">
            Next Interaction
          </h3>

          {/* Upcoming Meeting Card */}
          <Card className="p-3 mb-3 border-l-4 border-l-primary hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{sampleMeeting.date}</p>
                <p className="text-xs text-slate-600">{sampleMeeting.time} • {sampleMeeting.duration} min</p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <Users className="w-3 h-3 text-slate-400" />
                  {sampleMeeting.participants.slice(0, 2).map((p, idx) => <span key={idx} className="text-xs text-slate-600">{p}{idx < 1 ? ',' : ''}</span>)}
                </div>
              </div>
            </div>
          </Card>

          {/* Engagement Health */}
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="text-xs text-slate-600">Engagement Health</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${engagementColor}`} />
              <span className="text-xs font-medium text-slate-900">{engagementText}</span>
            </div>
          </div>

          {/* Psychological Insights Section */}
          <Card className="p-3">
            <Collapsible open={isPsychologyOpen} onOpenChange={setIsPsychologyOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-slate-900">Psychological Insights</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPsychologyOpen ? 'rotate-180' : ''}`} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <ul className="space-y-2">
                  {displayInsights.map((insight, idx) => {
                    const sliderValue = insight.sliderValue || 3;
                    const isAssessed = insight.confidence > 0;
                    
                    return (
                      <li 
                        key={idx} 
                        className={`text-xs ${
                          !isAssessed ? 'text-slate-400 italic' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`font-medium ${!isAssessed ? 'text-slate-400' : ''}`}>
                            {insight.aspect}
                          </span>
                          <span className={`text-[10px] ${!isAssessed ? 'text-slate-400' : 'text-slate-500'}`}>
                            {insight.assessment}
                          </span>
                        </div>
                        {/* 5-dot indicator + Action tip on same line */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <div 
                                key={dot} 
                                className={`w-3 h-1.5 rounded-sm transition-colors ${
                                  dot === sliderValue && isAssessed
                                    ? 'bg-primary' 
                                    : dot === sliderValue && !isAssessed
                                    ? 'bg-slate-300'
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          {isAssessed && insight.actionTip ? (
                            <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                              <span>→</span>
                              <span>{insight.actionTip}</span>
                            </span>
                          ) : (
                            <span />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Next Steps
            </h3>
            {nextStepsData.lastUpdated && <span className="text-xs text-slate-500">
                Updated {nextStepsData.lastUpdated.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}
              </span>}
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mb-3">
            {/* Empty State - only for action items */}
            {nextStepsData.actionItems.length === 0 && !isAddingItem && <Card className="border-dashed p-6 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h4 className="font-medium text-slate-900 mb-1">No Action Items Yet</h4>
                <p className="text-xs text-slate-500">
                  Chat with Ventus AI or upload a meeting transcript to generate action items.
                </p>
              </Card>}

            {/* Action Items Section */}
            {(nextStepsData.actionItems.length > 0 || isAddingItem) && (
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-slate-900">
                      Action Items ({incompleteItems.length} remaining)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsAddingItem(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {isAddingItem && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add action item..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 px-2" onClick={handleAddItem}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => { setIsAddingItem(false); setNewItemText(""); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {incompleteItems.length > 0 && (
                  <ul className="space-y-2">
                    {incompleteItems.map(item => (
                      <li key={item.id} className="flex items-start gap-2 group">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => onToggleActionItem(item.id)}
                          className="mt-0.5"
                        />
                        <span className="text-xs text-slate-700 flex-1">{item.text}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.source}
                        </Badge>
                        <button
                          onClick={() => onDeleteActionItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                          aria-label="Delete action item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {completedItems.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-dashed">
                    <span className="text-xs text-slate-400 mb-1 block">
                      Completed ({completedItems.length})
                    </span>
                    <ul className="space-y-1">
                      {completedItems.map(item => (
                        <li key={item.id} className="flex items-start gap-2 opacity-50 group">
                          <Checkbox checked onCheckedChange={() => onToggleActionItem(item.id)} className="mt-0.5" />
                          <span className="text-xs text-slate-500 line-through flex-1">{item.text}</span>
                          <button
                            onClick={() => onDeleteActionItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                            aria-label="Delete action item"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {savedProjection && <Button size="sm" variant="default" className="w-full text-xs" onClick={onExportTimelinePDF}>
                <FileDown className="w-3 h-3 mr-1" />
                Export {savedProjection.projectName} PDF
              </Button>}
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="flex-1 min-w-0 text-xs">
                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Call</span>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 min-w-0 text-xs">
                <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Email</span>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 min-w-0 text-xs">
                <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Schedule</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}