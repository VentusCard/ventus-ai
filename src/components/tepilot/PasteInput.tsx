import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";
import { DemographicsGenerator } from "./DemographicsGenerator";
import { ClientProfileData } from "@/types/clientProfile";

interface PasteInputProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  anchorZip: string;
  onAnchorZipChange: (value: string) => void;
  demographics: ClientProfileData | null;
  onDemographicsChange: (demographics: ClientProfileData | null) => void;
  isFromSampleData?: boolean;
  showFormatHint?: boolean;
}

export function PasteInput({ 
  value, 
  onChange, 
  onParse, 
  anchorZip, 
  onAnchorZipChange,
  demographics,
  onDemographicsChange,
  isFromSampleData = false,
  showFormatHint = false
}: PasteInputProps) {
  const lineCount = value.split("\n").filter(line => line.trim()).length;

  return (
    <div className="space-y-4">
      {showFormatHint && (
        <Alert className="bg-slate-50 border-slate-200 text-slate-700">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Format:</strong> Paste CSV data with headers. Required: transaction_id, merchant_name, description, mcc, amount, date. Optional: zip_code
          </AlertDescription>
        </Alert>
      )}

      <DemographicsGenerator
        demographics={demographics}
        onDemographicsChange={onDemographicsChange}
        onZipChange={onAnchorZipChange}
        anchorZip={anchorZip}
        isFromSampleData={isFromSampleData}
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Paste your transaction data below</span>
          <span>{lineCount} lines</span>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="transaction_id,merchant_name,description,mcc,amount,date,zip_code&#10;1,STARBUCKS COFFEE,Morning coffee,5814,12.45,2025-10-01,94102&#10;2,WHOLE FOODS,Groceries,5411,156.78,2025-10-02,94103"
          className="font-mono text-sm min-h-[300px] bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
        />
      </div>

      <Button 
        onClick={onParse} 
        disabled={!value.trim()}
        className="w-full h-[60px]"
        variant="ai"
      >
        Enrichment Preview
      </Button>
    </div>
  );
}
