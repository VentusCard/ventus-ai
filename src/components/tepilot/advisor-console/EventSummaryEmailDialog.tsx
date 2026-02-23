import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mail, Paperclip, X, Copy, Send, Loader2 } from "lucide-react";
import { EventPreparationData, LIFE_EVENT_CONFIG, DetectedLifeEvent } from "@/types/dashboardClient";
import { exportEventPreparationPDFBase64 } from "@/lib/eventPreparationPdfExport";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventSummaryEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EventPreparationData;
}

const mockInsightsByEventType: Record<DetectedLifeEvent['eventType'], string> = {
  retirement: "Client is in the early exploration phase of retirement planning. Increased 401k contributions and AARP enrollment signal mental preparation for this transition.",
  education: "Parent is deep in the college planning research phase. SAT prep, Princeton Review enrollment, and campus visits indicate serious commitment.",
  home_purchase: "Client is in active home acquisition mode. Earnest money and closing cost payments confirm an imminent transaction.",
  wealth_transfer: "Sophisticated wealth holder beginning to think intergenerationally. Goldman Sachs Private Wealth engagement shows institutional-grade interest.",
  business_liquidity: "Entrepreneur approaching a transformational exit. Merrill DataSite subscription and Deloitte advisory indicate a structured M&A process.",
  family_formation: "Growing family preparing for a new arrival. Baby registry activity and hospital pre-registration confirm timeline clarity.",
  elder_care: "Client is stepping into a caregiver role. Medical alert system purchases and accessibility modifications suggest aging family member needs support.",
};

function buildSummaryBody(data: EventPreparationData): string {
  const config = LIFE_EVENT_CONFIG[data.event.eventType];
  const eventLabel = config?.label || data.event.eventName;

  return `Client: ${data.client.profile.name}\nDetected Life Event: ${eventLabel} (${data.event.confidence}% confidence)\n\nPlease see the attached PDF for the full event preparation summary.\n`;
}

export function EventSummaryEmailDialog({ open, onOpenChange, data }: EventSummaryEmailDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");

  useEffect(() => {
    if (!open) return;

    const config = LIFE_EVENT_CONFIG[data.event.eventType];
    const eventLabel = config?.label || data.event.eventName;
    const clientNameSlug = data.client.profile.name.replace(/\s+/g, "_");
    const eventTypeSlug = data.event.eventType.replace(/_/g, "-");

    setSubject(`Event Preparation: ${eventLabel} — ${data.client.profile.name}`);
    setBody(buildSummaryBody(data));
    setAttachmentName(`${clientNameSlug}_${eventTypeSlug}_Preparation.pdf`);
    setRecipientEmail("");

    setPdfBase64(null);
    setIsGeneratingPdf(true);
    exportEventPreparationPDFBase64(data)
      .then((b64) => setPdfBase64(b64))
      .catch((err) => console.error("PDF generation failed", err))
      .finally(() => setIsGeneratingPdf(false));
  }, [open, data]);

  const handleCopy = () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmail);
    toast.success("Summary copied to clipboard");
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error("Please enter a recipient email");
      return;
    }
    setIsSending(true);
    try {
      const emailAttachments: { filename: string; content: string }[] = [];
      if (pdfBase64) {
        emailAttachments.push({ filename: attachmentName, content: pdfBase64 });
      }

      const { data: resData, error } = await supabase.functions.invoke('send-follow-up-email', {
        body: {
          to: recipientEmail,
          subject,
          body,
          advisorName: "Wealth Management Co-Pilot",
          attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
        },
      });
      if (error) throw error;
      if (resData?.error) throw new Error(resData.error);
      toast.success("Summary email sent successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tepilot-popup max-w-2xl max-h-[85vh] flex flex-col bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Mail className="w-5 h-5 text-primary" />
            Email Event Summary
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-14 flex-shrink-0">To:</span>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="h-8 text-sm"
              placeholder="your-email@example.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-14 flex-shrink-0">Subject:</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <ScrollArea className="flex-1 min-h-[200px] max-h-[320px]">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[280px] text-sm font-mono leading-relaxed resize-none border-slate-200"
            />
          </ScrollArea>

          {attachmentName && (
            <div>
              <span className="text-xs font-semibold text-slate-700 mb-1.5 block">Attachments</span>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="secondary"
                  className="pl-2 pr-1 py-1 text-xs gap-1 bg-slate-100 text-slate-700"
                >
                  <Paperclip className="w-3 h-3" />
                  {attachmentName}
                  {isGeneratingPdf && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy to Clipboard
          </Button>
          <Button size="sm" onClick={handleSend} disabled={isSending || isGeneratingPdf}>
            {isSending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
            {isSending ? "Sending…" : isGeneratingPdf ? "Preparing PDF…" : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
