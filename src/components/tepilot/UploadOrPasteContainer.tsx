import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { 
  SAMPLE_CSV, SAMPLE_CSV_SPORTS_WELLNESS, SAMPLE_CSV_FOOD_HOME, 
  SAMPLE_CSV_TRAVEL_FAMILY_12, SAMPLE_CSV_NYC_SPORTS_HOME_12, SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12,
  SAMPLE_CUSTOMER_1, SAMPLE_CUSTOMER_2, SAMPLE_CUSTOMER_3,
  SAMPLE_CUSTOMER_4, SAMPLE_CUSTOMER_5, SAMPLE_CUSTOMER_6
} from "@/lib/sampleData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";

interface UploadOrPasteContainerProps {
  mode: "paste" | "upload";
  onModeChange: (mode: "paste" | "upload") => void;
  onLoadSample: (sampleData: string, zipCode: string, demographics: ClientProfileData) => void;
  children: React.ReactNode;
  activeSelection: "sample" | "paste" | "upload";
  onActiveSelectionChange: (selection: "sample" | "paste" | "upload") => void;
}

export function UploadOrPasteContainer({
  mode,
  onModeChange,
  onLoadSample,
  children,
  activeSelection,
  onActiveSelectionChange
}: UploadOrPasteContainerProps) {
  const handleLoadSample = (data: string, zip: string, demographics: ClientProfileData) => {
    onActiveSelectionChange("sample");
    onLoadSample(data, zip, demographics);
  };

  const handleModeChange = (newMode: "paste" | "upload") => {
    onActiveSelectionChange(newMode);
    onModeChange(newMode);
  };

  return <Card className="bg-white border-slate-200">
      <CardHeader>
        <div>
          <CardTitle>Transaction Enrichment Setup</CardTitle>
          <CardDescription>
            Upload files or paste your transaction data to get started
          </CardDescription>
        </div>
        <div className="flex gap-2 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={activeSelection === "sample" ? "default" : "outline"} size="sm" className="flex-1">
                Load Sample Data
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white border-slate-200">
              <DropdownMenuItem className="text-slate-700" onClick={() => handleLoadSample(SAMPLE_CSV, "94102", SAMPLE_CUSTOMER_1)}>
                Dataset 1 (1 month)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700" onClick={() => handleLoadSample(SAMPLE_CSV_SPORTS_WELLNESS, "78701", SAMPLE_CUSTOMER_2)}>
                Dataset 2 (1 month)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700" onClick={() => handleLoadSample(SAMPLE_CSV_FOOD_HOME, "60614", SAMPLE_CUSTOMER_3)}>
                Dataset 3 (1 month)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700" onClick={() => handleLoadSample(SAMPLE_CSV_TRAVEL_FAMILY_12, "94102", SAMPLE_CUSTOMER_4)}>
                Dataset 4 (12 months)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700" onClick={() => handleLoadSample(SAMPLE_CSV_NYC_SPORTS_HOME_12, "10003", SAMPLE_CUSTOMER_5)}>
                Dataset 5 (12 months)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-700" onClick={() => handleLoadSample(SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12, "60610", SAMPLE_CUSTOMER_6)}>
                Dataset 6 (12 months)
              </DropdownMenuItem>
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
