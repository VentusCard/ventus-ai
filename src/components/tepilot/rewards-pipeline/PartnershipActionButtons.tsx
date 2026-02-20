import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageSquare, FileText, Send } from "lucide-react";
import type { MerchantPartnershipPitch, ContactLogEntry } from "@/types/bankwide";
import { toast } from "sonner";

interface PartnershipActionButtonsProps {
  pitch: MerchantPartnershipPitch;
  opportunityId: string;
  onLogContact: (entry: Omit<ContactLogEntry, 'date'>) => void;
}

export function PartnershipActionButtons({ pitch, opportunityId, onLogContact }: PartnershipActionButtonsProps) {
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState<'email' | 'call' | 'meeting' | 'note'>('email');
  const [contactSummary, setContactSummary] = useState('');

  const handleLogContact = () => {
    if (!contactSummary.trim()) {
      toast.error('Please enter a summary');
      return;
    }
    onLogContact({ type: contactType, summary: contactSummary });
    setContactSummary('');
    setShowContactModal(false);
    toast.success('Contact logged');
  };

  const generatePitchEmail = () => {
    return `Subject: Strategic Partnership Opportunity - ${pitch.merchantName}

Dear ${pitch.merchantName} Partnership Team,

We've identified a significant opportunity for a strategic partnership that would benefit both our organizations.

PROPOSED PARTNERSHIP:
${pitch.proposedDeal}

VALUE FOR ${pitch.merchantName.toUpperCase()}:
${pitch.merchantBenefit}

VALUE FOR OUR BANK:
${pitch.bankBenefit}

KEY METRICS:
• Target audience: ${(pitch.targetedUserCount / 1000000).toFixed(1)}M users
• Projected conversion rate: ${pitch.projectedConversionRate}%
• Optimal deployment window: ${pitch.deploymentWindow}
• Pattern confidence: ${pitch.patternConfidence}%

TIMING:
This partnership should be finalized by ${pitch.negotiationDeadline} to capture the ${pitch.peakQuarter} peak spending window.

I'd welcome the opportunity to discuss this partnership in more detail. Would you be available for a call next week?

Best regards,
[Your Name]
Consumer Rewards Team`;
  };

  const copyPitchToClipboard = () => {
    navigator.clipboard.writeText(generatePitchEmail());
    toast.success('Pitch email copied to clipboard');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowPitchModal(true)} className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Draft Pitch</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowContactModal(true)} className="gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Log Contact</span>
        </Button>
      </div>

      {/* Draft Pitch Modal */}
      <Dialog open={showPitchModal} onOpenChange={setShowPitchModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto tepilot-popup">
          <DialogHeader>
            <DialogTitle>Draft Pitch Email - {pitch.merchantName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatePitchEmail()}</pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPitchModal(false)}>Close</Button>
            <Button onClick={copyPitchToClipboard} className="gap-2">
              <Send className="h-4 w-4" />
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="tepilot-popup">
          <DialogHeader>
            <DialogTitle>Log Contact - {pitch.merchantName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contact Type</Label>
              <Select value={contactType} onValueChange={(v) => setContactType(v as typeof contactType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="call">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Meeting
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Note
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea 
                placeholder="Describe the contact..."
                value={contactSummary}
                onChange={(e) => setContactSummary(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button onClick={handleLogContact}>Log Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
