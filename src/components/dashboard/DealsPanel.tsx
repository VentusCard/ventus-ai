import { ScrollArea } from "@/components/ui/scroll-area";
import { DealCard, Deal } from "./DealCard";
import { Package, Gift } from "lucide-react";

interface DealsPanelProps {
  deals: Deal[];
  isLoading: boolean;
}

export const DealsPanel = ({ deals, isLoading }: DealsPanelProps) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20">
      <div className="p-6 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg border border-primary/10">
            <Gift className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Deals for You</h2>
            <p className="text-sm text-muted-foreground">
              {deals.length > 0 ? `${deals.length} deals found` : "Your deals will appear here"}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-6">
        {deals.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No deals yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Start chatting with the AI to discover personalized deals that match your interests!
            </p>
          </div>
        )}

          <div className="space-y-6">
            {deals.map((deal, index) => (
              <DealCard key={`${deal.title}-${index}`} deal={deal} index={index} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
