import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  SAMPLE_CSV, SAMPLE_CSV_SPORTS_WELLNESS, SAMPLE_CSV_FOOD_HOME, 
  SAMPLE_CSV_TRAVEL_FAMILY_12, SAMPLE_CSV_NYC_SPORTS_HOME_12, SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
  SAMPLE_CUSTOMER_1, SAMPLE_CUSTOMER_2, SAMPLE_CUSTOMER_3,
  SAMPLE_CUSTOMER_4, SAMPLE_CUSTOMER_5, SAMPLE_CUSTOMER_6
} from "@/lib/sampleData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";
import { toast } from "sonner";

interface SampleDataset {
  label: string;
  csv: string;
  zip: string;
  demographics: ClientProfileData;
}

const DATASETS: SampleDataset[] = [
  { label: "Dataset 1 (1 month)", csv: SAMPLE_CSV, zip: "94102", demographics: SAMPLE_CUSTOMER_1 },
  { label: "Dataset 2 (1 month)", csv: SAMPLE_CSV_SPORTS_WELLNESS, zip: "78701", demographics: SAMPLE_CUSTOMER_2 },
  { label: "Dataset 3 (1 month)", csv: SAMPLE_CSV_FOOD_HOME, zip: "60614", demographics: SAMPLE_CUSTOMER_3 },
  { label: "Dataset 4 (12 months)", csv: SAMPLE_CSV_TRAVEL_FAMILY_12, zip: "94102", demographics: SAMPLE_CUSTOMER_4 },
  { label: "Dataset 5 (12 months)", csv: SAMPLE_CSV_NYC_SPORTS_HOME_12, zip: "10003", demographics: SAMPLE_CUSTOMER_5 },
  { label: "Dataset 6 (12 months)", csv: SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12, zip: "60610", demographics: SAMPLE_CUSTOMER_6 },
];

interface UploadOrPasteContainerProps {
  mode: "paste" | "upload";
  onModeChange: (mode: "paste" | "upload") => void;
  onLoadSample: (sampleData: string, zipCode: string, demographics: ClientProfileData) => void;
  onLoadComparisonSamples?: (
    dataA: { csv: string; zip: string; demographics: ClientProfileData },
    dataB: { csv: string; zip: string; demographics: ClientProfileData }
  ) => void;
  onExitComparisonMode?: () => void;
  comparisonMode?: boolean;
  children: React.ReactNode;
  activeSelection: "sample" | "paste" | "upload";
  onActiveSelectionChange: (selection: "sample" | "paste" | "upload") => void;
}

export function UploadOrPasteContainer({
  mode,
  onModeChange,
  onLoadSample,
  onLoadComparisonSamples,
  children,
  activeSelection,
  onActiveSelectionChange
}: UploadOrPasteContainerProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleToggleDataset = (index: number) => {
    setSelectedIndices(prev => {
      const isSelected = prev.includes(index);
      if (isSelected) {
        // Deselect
        const next = prev.filter(i => i !== index);
        if (next.length === 1) {
          // Back to single mode
          const ds = DATASETS[next[0]];
          onActiveSelectionChange("sample");
          onLoadSample(ds.csv, ds.zip, ds.demographics);
        } else if (next.length === 0) {
          // Nothing selected
        }
        return next;
      } else {
        // Select
        if (prev.length >= 2) {
          toast.info("Maximum 2 datasets. Deselect one first.");
          return prev;
        }
        const next = [...prev, index];
        if (next.length === 1) {
          const ds = DATASETS[index];
          onActiveSelectionChange("sample");
          onLoadSample(ds.csv, ds.zip, ds.demographics);
        } else if (next.length === 2 && onLoadComparisonSamples) {
          const dsA = DATASETS[next[0]];
          const dsB = DATASETS[next[1]];
          onActiveSelectionChange("sample");
          onLoadComparisonSamples(
            { csv: dsA.csv, zip: dsA.zip, demographics: dsA.demographics },
            { csv: dsB.csv, zip: dsB.zip, demographics: dsB.demographics }
          );
        }
        return next;
      }
    });
  };

  const handleModeChange = (newMode: "paste" | "upload") => {
    setSelectedIndices([]);
    onActiveSelectionChange(newMode);
    onModeChange(newMode);
  };

  return <Card className="bg-white border-slate-200">
      <CardHeader>
        <div>
          <CardTitle>Transaction Enrichment Setup</CardTitle>
          <CardDescription>
            Upload files or paste your transaction data to get started. Select two samples to compare side-by-side.
          </CardDescription>
        </div>
        <div className="flex gap-2 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={activeSelection === "sample" ? "default" : "outline"} size="sm" className="flex-1 gap-2">
                Load Sample Data
                {selectedIndices.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white/20 text-xs px-1.5 py-0">
                    {selectedIndices.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 bg-white border-slate-200" onCloseAutoFocus={(e) => e.preventDefault()}>
              <div className="px-2 py-1.5 text-xs text-slate-500 font-medium">
                Select 1 for single view, or 2 to compare
              </div>
              {DATASETS.map((ds, i) => (
                <DropdownMenuItem
                  key={i}
                  className="text-slate-700 gap-2 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleToggleDataset(i);
                  }}
                >
                  <Checkbox 
                    checked={selectedIndices.includes(i)} 
                    className="pointer-events-none"
                  />
                  <span className="flex-1">{ds.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant={activeSelection === "paste" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("paste")} className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Paste Text
          </Button>
          <Button variant={activeSelection === "upload" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("upload")} className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>;
}
