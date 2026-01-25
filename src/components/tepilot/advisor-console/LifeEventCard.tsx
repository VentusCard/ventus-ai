import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, TrendingUp, X, Calculator } from "lucide-react";
import { useState } from "react";
import { LifeEvent } from "@/types/lifestyle-signals";

interface LifeEventCardProps {
  event: LifeEvent;
  onViewDetails: () => void;
  onDismiss: () => void;
  onPlanEvent?: (event: LifeEvent) => void;
}

export function LifeEventCard({ event, onViewDetails, onDismiss, onPlanEvent }: LifeEventCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const confidenceColor = 
    event.confidence >= 80 ? "bg-green-500" : 
    event.confidence >= 60 ? "bg-yellow-500" : 
    "bg-orange-500";

  const confidenceLabel = 
    event.confidence >= 80 ? "High" : 
    event.confidence >= 60 ? "Medium" : 
    "Low";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{event.event_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
                <span className="text-xs text-slate-500">
                  {confidenceLabel} Confidence ({event.confidence}%)
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-500 hover:text-slate-900 transition-colors">
              <span>View {event.evidence.length} supporting transactions</span>
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {event.evidence.map((evidence, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded text-xs">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-slate-900">{evidence.merchant}</span>
                  <span className="text-slate-500">${evidence.amount.toFixed(2)}</span>
                </div>
                <p className="text-slate-500 text-xs">{evidence.relevance}</p>
                <span className="text-slate-500 text-xs">{evidence.date}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2 mt-4">
          <Button onClick={onViewDetails} className="flex-1" size="sm">
            View Details & Recommendations
          </Button>
          {event.financial_projection && onPlanEvent && (
            <Button onClick={() => onPlanEvent(event)} variant="secondary" size="sm">
              <Calculator className="w-3 h-3 mr-1" />
              Plan This Event
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
