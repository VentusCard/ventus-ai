import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileSpreadsheet, FileJson, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { 
  exportSegment, 
  type ExportFormat, 
  type ExportSize 
} from "@/lib/segmentExportUtils";
import type { 
  SavedSegment, 
  TargetingMode,
  LifeEventCriteria,
  LifestyleCriteria,
  ProductCriteria
} from "@/types/segment";

interface SegmentExportControlsProps {
  targetingMode: TargetingMode;
  estimatedSize: number;
  lifeEventCriteria?: LifeEventCriteria;
  lifestyleCriteria?: LifestyleCriteria;
  productCriteria?: ProductCriteria;
}

const EXPORT_FORMATS: { value: ExportFormat; label: string; description: string; icon: typeof FileSpreadsheet }[] = [
  { 
    value: "csv_standard", 
    label: "CSV (Standard)", 
    description: "Universal format for all providers",
    icon: FileSpreadsheet 
  },
  { 
    value: "csv_mailchimp", 
    label: "CSV (Mailchimp)", 
    description: "Formatted for Mailchimp import",
    icon: FileSpreadsheet 
  },
  { 
    value: "csv_sendgrid", 
    label: "CSV (SendGrid)", 
    description: "Formatted for SendGrid Marketing",
    icon: FileSpreadsheet 
  },
  { 
    value: "json", 
    label: "JSON", 
    description: "For API integrations & Twilio Segment",
    icon: FileJson 
  },
];

const EXPORT_SIZES: { value: ExportSize; label: string }[] = [
  { value: 1000, label: "Sample (1K)" },
  { value: 5000, label: "Medium (5K)" },
  { value: 10000, label: "Large (10K)" },
  { value: 100000, label: "Full (100K)" },
];

export function SegmentExportControls({
  targetingMode,
  estimatedSize,
  lifeEventCriteria,
  lifestyleCriteria,
  productCriteria,
}: SegmentExportControlsProps) {
  const [format, setFormat] = useState<ExportFormat>("csv_standard");
  const [size, setSize] = useState<ExportSize>(1000);
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    const segment: Partial<SavedSegment> = {
      targetingMode,
      estimatedSize,
      lifeEventCriteria,
      lifestyleCriteria,
      productCriteria,
    };

    try {
      exportSegment(segment, format, size);
      
      const formatLabel = EXPORT_FORMATS.find(f => f.value === format)?.label || format;
      toast.success(`Exported ${size.toLocaleString()} contacts as ${formatLabel}`, {
        description: "File downloaded successfully",
      });
      
      setIsOpen(false);
    } catch (error) {
      toast.error("Export failed", {
        description: "Please try again",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
          <Download className="w-4 h-4 mr-2" />
          Export Segment
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-slate-900 mb-1">Export Segment</h4>
            <p className="text-xs text-slate-500">
              Download contact data for use with external marketing providers
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Format</Label>
            <RadioGroup 
              value={format} 
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="space-y-2"
            >
              {EXPORT_FORMATS.map((f) => (
                <div 
                  key={f.value} 
                  className="flex items-start space-x-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
                  onClick={() => setFormat(f.value)}
                >
                  <RadioGroupItem value={f.value} id={f.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label 
                      htmlFor={f.value} 
                      className="text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      {f.label}
                    </Label>
                    <p className="text-xs text-slate-500">{f.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Sample Size</Label>
            <RadioGroup 
              value={size.toString()} 
              onValueChange={(v) => setSize(parseInt(v) as ExportSize)}
              className="grid grid-cols-2 gap-2"
            >
              {EXPORT_SIZES.map((s) => (
                <div 
                  key={s.value}
                  className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                    size === s.value 
                      ? "border-primary bg-primary/5" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSize(s.value)}
                >
                  <RadioGroupItem value={s.value.toString()} id={`size-${s.value}`} />
                  <Label 
                    htmlFor={`size-${s.value}`} 
                    className="text-sm text-slate-700 cursor-pointer"
                  >
                    {s.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            className="w-full"
            disabled={isExporting}
          >
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {size.toLocaleString()} Contacts
              </>
            )}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            Mock data for demonstration purposes
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
