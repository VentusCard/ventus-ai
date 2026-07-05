import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, MapPin } from "lucide-react";
import { AvailableDealsGrid } from "@/components/tepilot/rewards-pipeline/AvailableDealsGrid";
import { LocationExperienceManager } from "./LocationExperienceManager";

interface DealsAndPerksViewProps {
  defaultTab?: "shopping" | "perks";
}

export function DealsAndPerksView({ defaultTab = "shopping" }: DealsAndPerksViewProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <TabsList className="h-9">
          <TabsTrigger value="shopping" className="gap-1.5 text-xs">
            <ShoppingBag className="w-3.5 h-3.5" />
            Shopping Deals
          </TabsTrigger>
          <TabsTrigger value="perks" className="gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            Location Perks
          </TabsTrigger>
        </TabsList>
        <p className="text-xs text-slate-500 truncate">
          Shopping = merchant discounts · Perks = place-based benefits
        </p>
      </div>

      <TabsContent value="shopping" className="mt-0">
        <AvailableDealsGrid />
      </TabsContent>
      <TabsContent value="perks" className="mt-0">
        <LocationExperienceManager />
      </TabsContent>
    </Tabs>
  );
}
