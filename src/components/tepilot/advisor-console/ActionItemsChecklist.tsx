import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare } from "lucide-react";
import { useState } from "react";

interface ActionItemsChecklistProps {
  items: string[];
}

export function ActionItemsChecklist({ items }: ActionItemsChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (idx: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(idx)) {
      newChecked.delete(idx);
    } else {
      newChecked.add(idx);
    }
    setCheckedItems(newChecked);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Action Items</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 transition-colors">
            <Checkbox 
              checked={checkedItems.has(idx)}
              onCheckedChange={() => toggleItem(idx)}
              className="mt-0.5"
            />
            <span className={`text-sm flex-1 ${checkedItems.has(idx) ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {item}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
