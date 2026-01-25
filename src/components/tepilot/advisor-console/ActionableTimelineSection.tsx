import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Copy } from "lucide-react";
import { ActionableTimelineItem } from "@/types/lifestyle-signals";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ActionableTimelineSectionProps {
  items: ActionableTimelineItem[];
  onToggleItem?: (id: string) => void;
}

export function ActionableTimelineSection({ items, onToggleItem }: ActionableTimelineSectionProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
    onToggleItem?.(id);
  };

  const copyToClipboard = () => {
    const text = items.map(item => `${item.timing}: ${item.action}`).join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: "✓ Copied to Clipboard",
      description: "Action timeline copied successfully",
    });
  };

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Actionable Timeline</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 group">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${checkedItems.has(item.id) ? 'bg-primary' : 'bg-slate-200 border-2 border-primary'}`} />
              <div className="w-0.5 h-full bg-slate-200 mt-1" />
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-start gap-2">
                <Checkbox 
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{item.timing}</p>
                  <p className={`text-sm mt-1 ${checkedItems.has(item.id) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.action}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
