import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, Zap, User, CheckCircle2 } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";
import {
  SAMPLE_CSV, SAMPLE_CSV_SPORTS_WELLNESS, SAMPLE_CSV_FOOD_HOME,
  SAMPLE_CSV_TRAVEL_FAMILY_12, SAMPLE_CSV_NYC_SPORTS_HOME_12, SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
  SAMPLE_CUSTOMER_1, SAMPLE_CUSTOMER_2, SAMPLE_CUSTOMER_3,
  SAMPLE_CUSTOMER_4, SAMPLE_CUSTOMER_5, SAMPLE_CUSTOMER_6
} from "@/lib/sampleData";

interface SampleDataset {
  label: string;
  csv: string;
  zip: string;
  demographics: ClientProfileData;
}

const DATASETS: SampleDataset[] = [
  { label: "Sarah Mitchell (1 mo)", csv: SAMPLE_CSV, zip: "94102", demographics: SAMPLE_CUSTOMER_1 },
  { label: "James Rodriguez (1 mo)", csv: SAMPLE_CSV_SPORTS_WELLNESS, zip: "78701", demographics: SAMPLE_CUSTOMER_2 },
  { label: "Emily Chen (1 mo)", csv: SAMPLE_CSV_FOOD_HOME, zip: "60614", demographics: SAMPLE_CUSTOMER_3 },
  { label: "Michael Thompson (12 mo)", csv: SAMPLE_CSV_TRAVEL_FAMILY_12, zip: "94102", demographics: SAMPLE_CUSTOMER_4 },
  { label: "Amanda Williams (12 mo)", csv: SAMPLE_CSV_NYC_SPORTS_HOME_12, zip: "10003", demographics: SAMPLE_CUSTOMER_5 },
  { label: "Robert Garcia (12 mo)", csv: SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12, zip: "60610", demographics: SAMPLE_CUSTOMER_6 },
];

interface ComparisonSetupProps {
  selectedA: { csv: string; zip: string; demographics: ClientProfileData } | null;
  selectedB: { csv: string; zip: string; demographics: ClientProfileData } | null;
  onSelectA: (csv: string, zip: string, demographics: ClientProfileData) => void;
  onSelectB: (csv: string, zip: string, demographics: ClientProfileData) => void;
  onEnrichBoth: () => void;
  isProcessing: boolean;
}

function CustomerSlot({ 
  label, 
  selected, 
  onSelect,
  color
}: { 
  label: string; 
  selected: ClientProfileData | null; 
  onSelect: (csv: string, zip: string, demographics: ClientProfileData) => void;
  color: string;
}) {
  return (
    <Card className="flex-1 bg-white border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <CardTitle className="text-base">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {selected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-sm text-slate-900">{selected.name}</span>
            </div>
            <div className="text-xs text-slate-500 space-y-0.5">
              <p>{selected.demographics?.occupation} · {selected.demographics?.age}y</p>
              <p>{selected.segment} · AUM {selected.aum}</p>
              <p>{selected.demographics?.familyStatus}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No customer selected</p>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-3">
              {selected ? "Change Customer" : "Select Customer"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-white border-slate-200">
            {DATASETS.map((ds, i) => (
              <DropdownMenuItem
                key={i}
                className="text-slate-700"
                onClick={() => onSelect(ds.csv, ds.zip, ds.demographics)}
              >
                {ds.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

export function ComparisonSetup({ selectedA, selectedB, onSelectA, onSelectB, onEnrichBoth, isProcessing }: ComparisonSetupProps) {
  const bothSelected = selectedA && selectedB;

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Side-by-Side Customer Comparison</CardTitle>
        </div>
        <CardDescription>
          Select two different customers to compare how the same deals produce different personalizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CustomerSlot
            label="Customer A"
            selected={selectedA?.demographics || null}
            onSelect={onSelectA}
            color="bg-blue-500"
          />
          <CustomerSlot
            label="Customer B"
            selected={selectedB?.demographics || null}
            onSelect={onSelectB}
            color="bg-emerald-500"
          />
        </div>

        {bothSelected && (
          <Button
            onClick={onEnrichBoth}
            disabled={isProcessing}
            className="w-full gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enriching Both Customers...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Enrich Both & Compare
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
