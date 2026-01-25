import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2 } from "lucide-react";

interface Recommendation {
  deal_id: string;
  title: string;
  description: string;
  matching_data: {
    current_behavior: string;
    opportunity: string;
    lift_opportunity?: string;
  };
  tier: "deal" | "experience" | "financial_product";
  priority: number;
  lift_type?: "frequency" | "amount" | "new_category" | "merchant_expansion";
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: Recommendation[];
  summary: {
    message: string;
  };
}

export function RecommendationsModal({ isOpen, onClose, recommendations, summary }: RecommendationsModalProps) {
  const getTierBadgeVariant = (tier: string) => {
    switch(tier) {
      case "deal": return "default";
      case "experience": return "secondary";
      case "financial_product": return "outline";
      default: return "outline";
    }
  };

  const getTierLabel = (tier: string) => {
    switch(tier) {
      case "deal": return "Deal";
      case "experience": return "Experience";
      case "financial_product": return "Financial Product";
      default: return tier;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Example Banking Partner Recommendations</DialogTitle>
          <DialogDescription>
            {recommendations.length} strategic recommendations for incremental revenue
          </DialogDescription>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full">
          {recommendations.map((rec, index) => (
            <AccordionItem key={rec.deal_id} value={`item-${index}`}>
              
              {/* COLLAPSED TRIGGER */}
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex flex-col items-start gap-2">
                    <h3 className="font-semibold text-lg text-left">{rec.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant={getTierBadgeVariant(rec.tier)}>
                        {getTierLabel(rec.tier)}
                      </Badge>
                      <Badge variant="outline">
                        Priority {rec.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              {/* EXPANDED CONTENT */}
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  
                  {/* Description */}
                  <p className="text-slate-500">{rec.description}</p>

                  {/* Matching Data */}
                  <Card className="bg-slate-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Why This Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {rec.matching_data.lift_opportunity && (
                          <li className="flex items-start gap-2 mb-3 p-2 bg-primary/5 rounded-md">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <div className="text-sm text-primary font-medium">
                              {rec.matching_data.lift_opportunity}
                            </div>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium">Current Behavior:</span> {rec.matching_data.current_behavior}
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium">Opportunity:</span> {rec.matching_data.opportunity}
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                </div>
              </AccordionContent>

            </AccordionItem>
          ))}
        </Accordion>

        {/* Summary Footer */}
        <Card className="mt-4 bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-sm text-center text-slate-500">
              {summary.message}
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
