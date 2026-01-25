import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp } from "lucide-react";
import { ProductRecommendation } from "@/types/lifestyle-signals";

interface ProductRecommendationCardProps {
  product: ProductRecommendation;
  onAddToAgenda: () => void;
}

export function ProductRecommendationCard({ product, onAddToAgenda }: ProductRecommendationCardProps) {
  const priorityVariant = 
    product.priority === "high" ? "destructive" : 
    product.priority === "medium" ? "default" : 
    "outline";

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-slate-900">{product.name}</h4>
            <Badge variant={priorityVariant} className="text-xs shrink-0">
              {product.priority}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mb-3">{product.rationale}</p>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{product.estimated_value}</span>
          </div>
          <Button onClick={onAddToAgenda} size="sm" variant="outline" className="w-full">
            Add to Meeting Agenda
          </Button>
        </div>
      </div>
    </Card>
  );
}
