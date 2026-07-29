import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DimensionChip } from "@/types/campaign-studio";

interface DimensionChipCloudProps {
  title: string;
  icon: React.ReactNode;
  chips: DimensionChip[];
  selectedChips: string[];
  onToggle: (chipId: string) => void;
  defaultOpen?: boolean;
  badge?: string;
}

export function DimensionChipCloud({
  title,
  icon,
  chips,
  selectedChips,
  onToggle,
  defaultOpen = false,
  badge,
}: DimensionChipCloudProps) {
  const [open, setOpen] = useState(defaultOpen);
  const count = selectedChips.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm text-foreground">{title}</span>
          {badge && (
            <span className="text-xs text-muted-foreground">({badge})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2">
              {count}
            </Badge>
          )}
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
          {chips.map((chip) => {
            const selected = selectedChips.includes(chip.id);
            return (
              <button
                key={chip.id}
                onClick={() => onToggle(chip.id)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  border transition-all cursor-pointer
                  ${selected
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }
                `}
                title={chip.description}
              >
                <span className={`w-2 h-2 rounded-full ${selected ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                {chip.label}
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
