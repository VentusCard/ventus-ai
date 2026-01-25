import { Filters } from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
interface FilterControlsProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}
export function FilterControls({
  filters,
  onFiltersChange,
  onReset
}: FilterControlsProps) {
  return <Card className="bg-white border-slate-200">
      
    </Card>;
}