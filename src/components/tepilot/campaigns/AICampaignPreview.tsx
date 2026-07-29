import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sparkles, RefreshCw, Copy, Loader2, Users, ChevronDown, Send, Download, Bookmark } from "lucide-react";
import { toast } from "sonner";
import type { CampaignBrief } from "@/types/campaign-studio";

interface AICampaignPreviewProps {
  brief: CampaignBrief | null;
  isGenerating: boolean;
  onGenerate: () => void;
  estimatedSize: number;
  hasSelections: boolean;
  onSave: () => void;
}

const BRIEF_FIELDS: { key: keyof CampaignBrief; label: string; multiline?: boolean }[] = [
  { key: 'subject_line', label: 'Email Subject Line' },
  { key: 'email_body', label: 'Email Body', multiline: true },
  { key: 'push_copy', label: 'Push Notification' },
  { key: 'sms_copy', label: 'SMS (160 chars)' },
  { key: 'in_app_copy', label: 'In-App Banner' },
  { key: 'cta_text', label: 'CTA Text' },
  { key: 'cta_link', label: 'CTA Link' },
  { key: 'imagery_direction', label: 'Imagery Direction', multiline: true },
  { key: 'offer_type', label: 'Offer Type' },
  { key: 'offer_value', label: 'Offer Value' },
];

export function AICampaignPreview({
  brief,
  isGenerating,
  onGenerate,
  estimatedSize,
  hasSelections,
  onSave,
}: AICampaignPreviewProps) {
  const [editedBrief, setEditedBrief] = useState<CampaignBrief | null>(null);
  const currentBrief = editedBrief || brief;

  const handleFieldChange = (key: keyof CampaignBrief, value: string) => {
    if (!currentBrief) return;
    setEditedBrief({ ...currentBrief, [key]: value });
  };

  const handleCopyAll = () => {
    if (!currentBrief) return;
    const text = BRIEF_FIELDS.map(f => `${f.label}: ${currentBrief[f.key]}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success("Copied all fields to clipboard");
  };

  const handleCrmTransfer = (provider: string) => {
    toast.info(`${provider} integration coming soon`, {
      description: "CRM transfer will be available in a future update",
    });
  };

  const formatted = estimatedSize >= 1_000_000
    ? `${(estimatedSize / 1_000_000).toFixed(1)}M`
    : estimatedSize >= 1_000
      ? `${(estimatedSize / 1_000).toFixed(0)}K`
      : estimatedSize.toString();

  // Reset edited brief when new brief arrives
  if (brief && editedBrief && brief.campaign_name !== editedBrief.campaign_name) {
    setEditedBrief(null);
  }

  return (
    <Card className="bg-card border-border sticky top-4">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">AI Campaign Brief</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4 pb-4">
        {!currentBrief && !isGenerating ? (
          <div className="text-center py-5">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              Select targeting criteria, then generate a brief
            </p>
            <Button
              onClick={onGenerate}
              disabled={!hasSelections}
              size="sm"
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Brief
            </Button>
          </div>
        ) : isGenerating ? (
          <div className="text-center py-5">
            <Loader2 className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <p className="text-xs text-muted-foreground">Generating brief...</p>
          </div>
        ) : currentBrief ? (
          <div className="space-y-2">
            {/* Campaign name */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Campaign Name</label>
              <Input
                value={currentBrief.campaign_name}
                onChange={(e) => handleFieldChange('campaign_name', e.target.value)}
                className="mt-0.5 bg-secondary/50 border-border text-xs h-8"
              />
            </div>

            {/* Brief fields */}
            {BRIEF_FIELDS.map(field => (
              <div key={field.key}>
                <label className="text-[11px] font-medium text-muted-foreground">{field.label}</label>
                {field.multiline ? (
                  <Textarea
                    value={String(currentBrief[field.key])}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="mt-0.5 bg-secondary/50 border-border text-xs min-h-[44px]"
                    rows={2}
                  />
                ) : (
                  <Input
                    value={String(currentBrief[field.key])}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="mt-0.5 bg-secondary/50 border-border text-xs h-8"
                  />
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-1.5 pt-1">
              <Button variant="outline" size="sm" onClick={onGenerate} className="gap-1 h-7 text-xs px-2">
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1 h-7 text-xs px-2">
                <Copy className="w-3 h-3" />
                Copy All
              </Button>
            </div>

            {/* Audience */}
            {hasSelections && (
              <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-primary/5 border border-primary/15">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">{formatted} audience</span>
              </div>
            )}

            {/* Save / Export / CRM */}
            <div className="flex gap-1.5 pt-0.5">
              <Button size="sm" onClick={onSave} className="gap-1 h-7 text-xs px-2">
                <Bookmark className="w-3 h-3" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2" onClick={() => toast.info("CSV export coming soon")}>
                <Download className="w-3 h-3" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2">
                    <Send className="w-3 h-3" />
                    CRM
                    <ChevronDown className="w-2.5 h-2.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleCrmTransfer("Salesforce")}>Salesforce</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCrmTransfer("HubSpot")}>HubSpot</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCrmTransfer("Marketo")}>Marketo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCrmTransfer("Custom API")}>Custom API Endpoint</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
