import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Brain, Trash2 } from "lucide-react";
import { PsychologicalInsight } from "./sampleData";

interface ClientPsychologyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveInsights: (insights: PsychologicalInsight[]) => void;
}

interface CategorySelection {
  value: number; // 1-5 scale
}

const PSYCHOLOGY_CATEGORIES = [
  {
    id: "decision_style",
    label: "Decision Style",
    leftLabel: "Analytical",
    rightLabel: "Intuitive",
    markers: ["Very Analytical", "Analytical", "Balanced", "Intuitive", "Very Intuitive"],
    actionTips: [
      "Lead with data & charts",
      "Provide supporting evidence",
      "Balance data with narrative",
      "Tell stories, use examples",
      "Trust their gut, keep simple"
    ]
  },
  {
    id: "risk_tolerance",
    label: "Risk Tolerance",
    leftLabel: "Conservative",
    rightLabel: "Aggressive",
    markers: ["Very Conservative", "Conservative", "Moderate", "Growth", "Aggressive"],
    actionTips: [
      "Emphasize capital preservation",
      "Focus on stability & safety",
      "Present balanced options",
      "Highlight growth potential",
      "Lead with upside opportunity"
    ]
  },
  {
    id: "emotional_state",
    label: "Emotional State",
    leftLabel: "Anxious",
    rightLabel: "Confident",
    markers: ["Very Anxious", "Anxious", "Neutral", "Confident", "Very Confident"],
    actionTips: [
      "Reassure frequently, small steps",
      "Acknowledge concerns first",
      "Be direct, neutral tone",
      "Validate their confidence",
      "Challenge & stretch thinking"
    ]
  },
  {
    id: "trust_level",
    label: "Trust Level",
    leftLabel: "Guarded",
    rightLabel: "High Trust",
    markers: ["Very Guarded", "Guarded", "Building", "Trusting", "High Trust"],
    actionTips: [
      "Document everything, verify claims",
      "Build rapport, cite credentials",
      "Be transparent, earn trust",
      "Speak directly, they trust you",
      "Make recommendations freely"
    ]
  },
  {
    id: "communication_style",
    label: "Communication Style",
    leftLabel: "Big Picture",
    rightLabel: "Detail-Oriented",
    markers: ["Very Concise", "Concise", "Balanced", "Detailed", "Very Detailed"],
    actionTips: [
      "Headlines only, no deep dives",
      "Keep it brief, summary format",
      "Balanced depth",
      "Provide thorough explanations",
      "Go deep, show all details"
    ]
  }
];

// Initialize with default middle values for all categories
const createInitialSelections = () => 
  PSYCHOLOGY_CATEGORIES.reduce((acc, cat) => ({
    ...acc,
    [cat.id]: { value: 3 }
  }), {} as Record<string, CategorySelection>);

export function ClientPsychologyDialog({ open, onOpenChange, onSaveInsights }: ClientPsychologyDialogProps) {
  const [selections, setSelections] = useState<Record<string, CategorySelection>>(createInitialSelections);

  const handleSliderChange = (categoryId: string, value: number[]) => {
    setSelections(prev => ({
      ...prev,
      [categoryId]: { value: value[0] }
    }));
  };

  const handleClear = () => {
    setSelections(createInitialSelections());
  };

  const handleSave = () => {
    const insights: PsychologicalInsight[] = [];

    for (const category of PSYCHOLOGY_CATEGORIES) {
      const selection = selections[category.id];
      if (selection?.value) {
        const markerLabel = category.markers[selection.value - 1];
        const actionTip = category.actionTips[selection.value - 1];
        insights.push({
          aspect: category.label,
          assessment: markerLabel,
          evidence: "Advisor observation",
          confidence: 0.85,
          sliderValue: selection.value,
          actionTip: actionTip
        });
      }
    }

    onSaveInsights(insights);
    onOpenChange(false);
    setSelections(createInitialSelections());
  };

  // Always allow saving since we have default values
  const hasSelections = true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Client Psychology Profile
          </DialogTitle>
          <DialogDescription>
            Use the sliders to capture psychological insights about your client. Move away from center to indicate a tendency.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {PSYCHOLOGY_CATEGORIES.map(category => {
            const currentValue = selections[category.id]?.value || 3;
            const currentMarker = category.markers[currentValue - 1];
            const isNeutral = currentValue === 3;

            return (
              <Card key={category.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">{category.label}</Label>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    isNeutral 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {currentMarker}
                  </span>
                </div>
                
                {/* Slider with labels */}
                <div className="px-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{category.leftLabel}</span>
                    <span>{category.rightLabel}</span>
                  </div>
                  
                  <Slider
                    value={[currentValue]}
                    onValueChange={(value) => handleSliderChange(category.id, value)}
                    min={1}
                    max={5}
                    step={1}
                    className="mb-2"
                  />
                  
                  {/* 5 markers below slider */}
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((marker) => (
                      <div 
                        key={marker} 
                        className={`w-2 h-2 rounded-full transition-colors ${
                          marker === currentValue 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={!hasSelections}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasSelections}>
              Save Insights
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
