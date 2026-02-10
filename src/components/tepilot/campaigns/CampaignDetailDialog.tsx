import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  DollarSign,
  Mail,
  Bell,
  Smartphone,
  Send
} from "lucide-react";
import { toast } from "sonner";
import type { CampaignTemplate, AudienceSegment, CampaignChannel } from "@/types/campaign";

interface CampaignDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: CampaignTemplate | null;
  initialAudience?: Partial<AudienceSegment>;
}

const CHANNEL_CONFIG: Record<CampaignChannel, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  email: { label: 'Email', icon: Mail },
  push: { label: 'Push', icon: Bell },
  in_app: { label: 'In-App', icon: Smartphone },
  sms: { label: 'SMS', icon: MessageSquare },
  direct_mail: { label: 'Direct Mail', icon: Send },
};

export function CampaignDetailDialog({ 
  open, 
  onOpenChange, 
  template,
  initialAudience 
}: CampaignDetailDialogProps) {
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<CampaignChannel[]>(['email']);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pre-fill from template when available
  useEffect(() => {
    if (template) {
      setCampaignName(template.name);
      setObjective(template.description);
      const suggestedChannel = template.suggestedMessages[0]?.channel || 'email';
      setSelectedChannels([suggestedChannel]);
      setMessageSubject(template.suggestedMessages[0]?.subject || '');
      setMessageBody(template.suggestedMessages[0]?.body || '');
    } else {
      // Reset form
      setCampaignName("");
      setObjective("");
      setSelectedChannels(['email']);
      setMessageSubject("");
      setMessageBody("");
    }
  }, [template, open]);

  const toggleChannel = (channel: CampaignChannel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleCreate = () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    
    toast.success(`Campaign "${campaignName}" created successfully!`);
    onOpenChange(false);
  };

  const estimatedSize = initialAudience?.estimatedSize || template?.suggestedAudience?.estimatedSize || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto tepilot-popup">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {template ? `Create from "${template.name}"` : "Create New Campaign"}
          </DialogTitle>
          <DialogDescription>
            Configure your campaign details, messaging, and schedule
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q1 Travel Card Acquisition"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="objective">Objective</Label>
              <Textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What is this campaign trying to achieve?"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Audience Summary */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Target Audience</Label>
                <Badge className="bg-primary text-white">
                  <Users className="w-3 h-3 mr-1" />
                  {(estimatedSize / 1_000_000).toFixed(1)}M users
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                {initialAudience?.targetingMode === 'life_event' && 'Life event-based targeting'}
                {initialAudience?.targetingMode === 'lifestyle' && 'Lifestyle pillar-based targeting'}
                {initialAudience?.targetingMode === 'product' && 'Product holdings-based targeting'}
                {!initialAudience?.targetingMode && template && `Template: ${template.category.replace('_', ' ')}`}
              </p>
            </div>

            {/* Offer Details */}
            {template?.suggestedOffer && (
              <div className="p-4 border border-slate-200 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Suggested Offer</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {template.suggestedOffer.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-slate-700">{template.suggestedOffer.value}</span>
                </div>
                {template.suggestedOffer.merchantPartner && (
                  <p className="text-xs text-slate-500 mt-1">
                    Partner: {template.suggestedOffer.merchantPartner}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-4 mt-4">
            {/* Channel Selection */}
            <div>
              <Label className="mb-3 block">Channels</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CHANNEL_CONFIG) as CampaignChannel[]).map((channel) => {
                  const config = CHANNEL_CONFIG[channel];
                  const Icon = config.icon;
                  const isSelected = selectedChannels.includes(channel);
                  
                  return (
                    <Button
                      key={channel}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleChannel(channel)}
                      className="gap-1.5"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Message Content */}
            {selectedChannels.includes('email') && (
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="e.g., {first_name}, you're missing out on rewards"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Variables: {'{first_name}'}, {'{top_pillar}'}, {'{savings_estimate}'}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Your personalized message content..."
                className="mt-1"
                rows={4}
              />
            </div>

            {/* Preview */}
            {(messageSubject || messageBody) && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <Label className="text-xs text-slate-500 mb-2 block">Preview (Sample Customer)</Label>
                {messageSubject && (
                  <p className="font-medium text-slate-900 mb-1">
                    {messageSubject
                      .replace('{first_name}', 'Sarah')
                      .replace('{top_pillar}', 'Travel')
                      .replace('{savings_estimate}', '$450')}
                  </p>
                )}
                <p className="text-sm text-slate-700">
                  {messageBody
                    .replace('{first_name}', 'Sarah')
                    .replace('{top_pillar}', 'Travel')
                    .replace('{savings_estimate}', '$450')}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., 500000"
                  className="pl-9"
                />
              </div>
            </div>

            {template?.seasonalWindow && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Recommended Window:</strong> {template.seasonalWindow}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
