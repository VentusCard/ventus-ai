import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, X, Sparkles, DollarSign, Building2, MapPin, RefreshCw } from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";
import { generateRandomProfile } from "@/lib/randomProfileGenerator";

interface DemographicsGeneratorProps {
  demographics: ClientProfileData | null;
  onDemographicsChange: (demographics: ClientProfileData | null) => void;
  onZipChange: (zip: string) => void;
  anchorZip: string;
  isFromSampleData?: boolean;
}

const INCOME_LEVELS = [
  "$75K-$100K", "$100K-$150K", "$150K-$200K", "$175K-$225K",
  "$250K-$350K", "$350K-$500K", "$400K-$600K", "$500K-$750K",
  "$600K-$1M", "$750K+",
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Legal", "Real Estate",
  "Manufacturing", "Education", "Consulting", "Retail", "Energy",
];

const FAMILY_STATUSES = [
  "Single", "Engaged", "Married, no children", "Married, 1 child",
  "Married, 2 children", "Married, 3 children", "Married, adult children",
  "Empty nester", "Divorced, children",
];

export function DemographicsGenerator({ 
  demographics, 
  onDemographicsChange, 
  onZipChange,
  anchorZip,
  isFromSampleData = false
}: DemographicsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const profile = generateRandomProfile();
      onDemographicsChange(profile);
      const zipMatch = profile.contact.address.match(/\d{5}$/);
      if (zipMatch) {
        onZipChange(zipMatch[0]);
      }
      setIsGenerating(false);
    }, 150);
  };

  const handleClear = () => {
    onDemographicsChange(null);
    onZipChange("");
  };

  const updateDemographicField = (field: 'incomeLevel' | 'industry' | 'familyStatus', value: string) => {
    if (!demographics) return;
    onDemographicsChange({
      ...demographics,
      demographics: {
        ...demographics.demographics,
        [field]: value,
      },
    });
  };

  // No demographics - show ZIP + generate button in one row
  if (!demographics) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1.5 text-slate-900">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Customer Context
        </label>
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <Input
            type="text"
            value={anchorZip}
            onChange={(e) => onZipChange(e.target.value)}
            placeholder="ZIP"
            className="w-[80px] h-8 bg-white border-slate-300 text-sm font-mono"
            maxLength={5}
          />
          <span className="text-xs text-slate-500">Home ZIP for travel detection</span>
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-8 border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {isGenerating ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Users className="h-3.5 w-3.5 mr-1.5" />
            )}
            Generate Profile
          </Button>
        </div>
      </div>
    );
  }

  // Sample data loaded - show read-only demographics in one row
  if (isFromSampleData) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1.5 text-slate-900">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Customer Context
        </label>
        <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-700">
            <DollarSign className="h-3.5 w-3.5 text-green-600" />
            <span className="text-sm font-medium">{demographics.demographics.incomeLevel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-sm">{demographics.demographics.industry}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Users className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-sm">{demographics.demographics.familyStatus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-sm font-mono">{anchorZip}</span>
          </div>
          <div className="flex-1" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Clear sample data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // User-generated demographics - show editable fields in one row
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1.5 text-slate-900">
        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
        Customer Context
      </label>
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-green-600" />
          <Select
            value={demographics.demographics.incomeLevel}
            onValueChange={(value) => updateDemographicField('incomeLevel', value)}
          >
            <SelectTrigger className="w-[130px] h-8 bg-white border-slate-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          <Select
            value={demographics.demographics.industry}
            onValueChange={(value) => updateDemographicField('industry', value)}
          >
            <SelectTrigger className="w-[120px] h-8 bg-white border-slate-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-purple-600" />
          <Select
            value={demographics.demographics.familyStatus}
            onValueChange={(value) => updateDemographicField('familyStatus', value)}
          >
            <SelectTrigger className="w-[160px] h-8 bg-white border-slate-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FAMILY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-500" />
          <Input
            type="text"
            value={anchorZip}
            onChange={(e) => onZipChange(e.target.value)}
            placeholder="ZIP"
            className="w-[70px] h-8 bg-white border-slate-300 text-sm font-mono"
            maxLength={5}
          />
        </div>

        <div className="flex-1" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Regenerate</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Clear</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
