import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
export interface Deal {
  id?: string;
  title: string;
  merchant: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  category: string;
  imageUrl?: string;
  dealUrl?: string;
}
interface DealCardProps {
  deal: Deal;
  index: number;
}
export const DealCard = ({
  deal,
  index
}: DealCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    toast
  } = useToast();
  const handleSaveDeal = async () => {
    setIsSaving(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save deals",
          variant: "destructive"
        });
        return;
      }
      const {
        error
      } = await supabase.from("saved_deals").insert({
        user_id: user.id,
        deal_title: deal.title,
        merchant_name: deal.merchant,
        deal_description: deal.description,
        original_price: deal.originalPrice,
        discounted_price: deal.dealPrice,
        discount_percentage: deal.discount,
        category: deal.category,
        deal_url: deal.dealUrl
      });
      if (error) throw error;
      setIsSaved(true);
      toast({
        title: "Deal saved!",
        description: "You can view it in your saved deals"
      });
    } catch (error) {
      console.error("Error saving deal:", error);
      toast({
        title: "Failed to save deal",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  return <Card className={cn("group hover:shadow-titanium transition-all duration-300 hover:scale-[1.02] animate-in", "slide-in-from-right-10 fade-in")} style={{
    animationDelay: `${index * 150}ms`,
    animationFillMode: "backwards"
  }}>
      <CardHeader className="relative pb-2">
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground font-bold text-xs">
            {deal.discount}% OFF
          </Badge>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">{deal.merchant}</p>
            <CardTitle className="text-base leading-tight">{deal.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <CardDescription className="line-clamp-2 text-sm">
          {deal.description}
        </CardDescription>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">
            ${deal.dealPrice.toFixed(2)}
          </span>
          <span className="text-base text-muted-foreground line-through">
            ${deal.originalPrice.toFixed(2)}
          </span>
        </div>

        

        <div className="flex gap-2 pt-1">
          <Button onClick={handleSaveDeal} disabled={isSaved || isSaving} variant={isSaved ? "secondary" : "outline"} className="flex-1">
            <Heart className={cn("w-4 h-4 mr-2", isSaved && "fill-current")} />
            {isSaved ? "Saved" : "Save Deal"}
          </Button>
          {deal.dealUrl && <Button variant="default" className="flex-1" asChild>
              <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Deal
              </a>
            </Button>}
        </div>
      </CardContent>
    </Card>;
};