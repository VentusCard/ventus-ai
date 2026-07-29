import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Flag } from "lucide-react";
import { CAMPAIGN_GOALS } from "@/lib/campaignStudioData";

interface CampaignGoalSelectorProps {
  selectedGoal: string;
  onSelect: (goalId: string) => void;
}

export function CampaignGoalSelector({ selectedGoal, onSelect }: CampaignGoalSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Campaign Goal</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedGoal && (
            <Badge variant="secondary" className="bg-primary/15 text-primary text-xs px-2">
              {CAMPAIGN_GOALS.find(g => g.id === selectedGoal)?.label}
            </Badge>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
          {CAMPAIGN_GOALS.map(goal => {
            const selected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => onSelect(selected ? '' : goal.id)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  border transition-all cursor-pointer
                  ${selected
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${selected ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                {goal.label}
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
