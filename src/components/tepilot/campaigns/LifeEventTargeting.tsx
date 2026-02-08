import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sunset, 
  GraduationCap, 
  Baby, 
  Home, 
  Heart, 
  Briefcase, 
  Gift 
} from "lucide-react";
import { LIFE_EVENTS, type LifeEventCriteria } from "@/types/campaign";

interface LifeEventTargetingProps {
  criteria: LifeEventCriteria;
  onChange: (criteria: LifeEventCriteria) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunset,
  GraduationCap,
  Baby,
  Home,
  Heart,
  Briefcase,
  Gift,
};

export function LifeEventTargeting({ criteria, onChange }: LifeEventTargetingProps) {
  const toggleEvent = (eventId: string) => {
    const newEvents = criteria.eventTypes.includes(eventId)
      ? criteria.eventTypes.filter(e => e !== eventId)
      : [...criteria.eventTypes, eventId];
    onChange({ ...criteria, eventTypes: newEvents });
  };

  const updateConfidence = (value: number[]) => {
    onChange({ ...criteria, minConfidence: value[0] });
  };

  return (
    <div className="space-y-6">
      {/* Event Type Selection */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Select Life Event Types
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LIFE_EVENTS.map((event) => {
            const Icon = ICON_MAP[event.icon] || Heart;
            const isSelected = criteria.eventTypes.includes(event.id);
            
            return (
              <div
                key={event.id}
                onClick={() => toggleEvent(event.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <Checkbox 
                  checked={isSelected} 
                  onCheckedChange={() => toggleEvent(event.id)}
                  className="pointer-events-none"
                />
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-slate-100'}`}>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                    {event.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    ~{(event.detectionRate * 100).toFixed(1)}% detection rate
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence Threshold */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium text-slate-700">
            Minimum Confidence Threshold
          </Label>
          <Badge variant="outline" className="font-mono">
            {(criteria.minConfidence * 100).toFixed(0)}%
          </Badge>
        </div>
        <Slider
          value={[criteria.minConfidence]}
          onValueChange={updateConfidence}
          min={0.4}
          max={0.95}
          step={0.05}
          className="w-full"
        />
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>40% (More reach)</span>
          <span>95% (Higher precision)</span>
        </div>
      </div>

      {/* Help Text */}
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          <strong>Tip:</strong> Life event detection uses behavioral signals like spending patterns, 
          transaction timing, and merchant categories to identify customers approaching major life transitions.
          Higher confidence thresholds mean fewer false positives but smaller audiences.
        </p>
      </div>
    </div>
  );
}
