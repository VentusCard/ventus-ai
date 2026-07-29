import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { METRO_AREAS, AREA_TYPES } from "@/lib/campaignStudioData";
import { REGIONS } from "@/types/segment";

interface GeoDimensionSelectorProps {
  selectedRegions: string[];
  selectedMetros: string[];
  areaType: string;
  onToggleRegion: (region: string) => void;
  onToggleMetro: (metroId: string) => void;
  onSetAreaType: (type: string) => void;
}

export function GeoDimensionSelector({
  selectedRegions,
  selectedMetros,
  areaType,
  onToggleRegion,
  onToggleMetro,
  onSetAreaType,
}: GeoDimensionSelectorProps) {
  const [open, setOpen] = useState(false);
  const totalSelected = selectedRegions.length + selectedMetros.length + (areaType !== 'All' ? 1 : 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Geography</span>
        </div>
        <div className="flex items-center gap-2">
          {totalSelected > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2">
              {totalSelected}
            </Badge>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 space-y-3">
          {/* Regions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Regions</p>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map(region => {
                const selected = selectedRegions.includes(region);
                return (
                  <button
                    key={region}
                    onClick={() => onToggleRegion(region)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selected
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selected ? 'bg-blue-600' : 'bg-muted-foreground/30'}`} />
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metro Areas */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Top Metro Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {METRO_AREAS.map(metro => {
                const selected = selectedMetros.includes(metro.id);
                return (
                  <button
                    key={metro.id}
                    onClick={() => onToggleMetro(metro.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selected
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-blue-600' : 'bg-muted-foreground/30'}`} />
                    {metro.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area Type */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Area Type</p>
            <div className="flex gap-1.5">
              {AREA_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => onSetAreaType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    areaType === type
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
