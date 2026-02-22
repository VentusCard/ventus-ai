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
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">AI Campaign Brief</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentBrief && !isGenerating ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Select targeting criteria, then generate an AI-powered campaign brief
            </p>
            <Button
              onClick={onGenerate}
              disabled={!hasSelections}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Campaign Brief
            </Button>
          </div>
        ) : isGenerating ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">Generating campaign brief...</p>
          </div>
        ) : currentBrief ? (
          <div className="space-y-3">
            {/* Campaign name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Campaign Name</label>
              <Input
                value={currentBrief.campaign_name}
                onChange={(e) => handleFieldChange('campaign_name', e.target.value)}
                className="mt-1 bg-secondary/50 border-border text-sm"
              />
            </div>

            {/* Brief fields */}
            {BRIEF_FIELDS.map(field => (
              <div key={field.key}>
                <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                {field.multiline ? (
                  <Textarea
                    value={String(currentBrief[field.key])}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="mt-1 bg-secondary/50 border-border text-sm min-h-[60px]"
                    rows={2}
                  />
                ) : (
                  <Input
                    value={String(currentBrief[field.key])}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="mt-1 bg-secondary/50 border-border text-sm"
                  />
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onGenerate} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                Copy All
              </Button>
            </div>

            {/* Audience */}
            {hasSelections && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/15">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{formatted} audience</span>
              </div>
            )}

            {/* Save / Export / CRM */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={onSave} className="gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("CSV export coming soon")}>
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    CRM
                    <ChevronDown className="w-3 h-3" />
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
