import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, MapPin } from "lucide-react";
import { AvailableDealsGrid } from "@/components/tepilot/rewards-pipeline/AvailableDealsGrid";
import { LocationExperienceManager } from "./LocationExperienceManager";
import { TabHeader } from "./TabHeader";

interface DealsAndPerksViewProps {
  defaultTab?: "shopping" | "perks";
}

export function DealsAndPerksView({ defaultTab = "shopping" }: DealsAndPerksViewProps) {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<ShoppingBag className="w-4 h-4" />}
        title="Deals & Perks"
        subtitle="Shopping deals are transactional merchant discounts. Location perks are place-based experiences — not tied to a purchase."
        howItWorks="Manage the two distinct reward inventories from one place: merchant-funded shopping offers and city-specific partner perks."
        whyItMatters="Keeps rewards teams from confusing checkout discounts with lifestyle privileges — each drives different engagement patterns."
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="shopping" className="gap-2">
            <ShoppingBag className="w-4 h-4" />
            Shopping Deals
          </TabsTrigger>
          <TabsTrigger value="perks" className="gap-2">
            <MapPin className="w-4 h-4" />
            Location Perks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shopping" className="mt-6 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-sm text-blue-900">
            <ShoppingBag className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>Shopping deals</strong> — merchant discounts and cashback offers customers activate and redeem at checkout (e.g. 10% off Nike).
            </span>
          </div>
          <AvailableDealsGrid />
        </TabsContent>

        <TabsContent value="perks" className="mt-6 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-900">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>Location perks</strong> — curated local experiences and partner benefits tied to where customers live or travel (e.g. lounge access in NYC). Not tied to a purchase.
            </span>
          </div>
          <LocationExperienceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
