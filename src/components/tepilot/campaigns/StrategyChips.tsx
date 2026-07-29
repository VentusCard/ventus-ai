import { DimensionChipCloud } from "./DimensionChipCloud";
import { ArrowRightLeft, TrendingUp } from "lucide-react";
import { CROSS_SELL_STRATEGIES, UPSELL_STRATEGIES } from "@/lib/campaignStudioData";

interface StrategyChipsProps {
  crossSellStrategies: string[];
  upsellStrategies: string[];
  onToggleCrossSell: (id: string) => void;
  onToggleUpsell: (id: string) => void;
}

export function StrategyChips({
  crossSellStrategies,
  upsellStrategies,
  onToggleCrossSell,
  onToggleUpsell,
}: StrategyChipsProps) {
  return (
    <>
      <DimensionChipCloud
        title="Cross-Sell Strategy"
        icon={<ArrowRightLeft className="w-4 h-4 text-primary" />}
        chips={CROSS_SELL_STRATEGIES.map(s => ({ id: s.id, label: s.label, description: s.description }))}
        selectedChips={crossSellStrategies}
        onToggle={onToggleCrossSell}
      />
      <DimensionChipCloud
        title="Upsell Strategy"
        icon={<TrendingUp className="w-4 h-4 text-primary" />}
        chips={UPSELL_STRATEGIES.map(s => ({ id: s.id, label: s.label, description: s.description }))}
        selectedChips={upsellStrategies}
        onToggle={onToggleUpsell}
      />
    </>
  );
}
