import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mail, Paperclip, X, Copy, Send, ExternalLink } from "lucide-react";
import { NextStepsData } from "./sampleData";
import { SavedFinancialProjection } from "@/types/lifestyle-signals";
import { ClientProfileData } from "@/types/clientProfile";
import { DetectedLifeEvent } from "@/types/dashboardClient";
import { toast } from "sonner";

interface FollowUpEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextStepsData: NextStepsData;
  clientName: string;
  clientEmail: string;
  advisorName: string;
  savedProjection?: SavedFinancialProjection | null;
  clientProfile?: ClientProfileData | null;
  lifeEvents?: DetectedLifeEvent[] | null;
}

const PRODUCT_LINK_MAP: Record<string, string> = {
  "Checking": "Premium Checking Account",
  "Savings": "High-Yield Savings",
  "Mortgage": "Mortgage Solutions",
  "Investment Portfolio": "Investment Management",
  "Insurance": "Insurance Solutions",
  "529 Plan": "529 Education Savings",
  "IRA": "IRA Retirement Accounts",
  "Credit Card": "Rewards Credit Card",
};

const PRODUCT_URL = "https://www.ventusai.com/technology";

const LIFE_EVENT_LABELS: Record<string, string> = {
  retirement: "retirement planning",
  education: "education funding",
  home_purchase: "upcoming home purchase",
  wealth_transfer: "wealth transfer strategy",
  business_liquidity: "business liquidity event",
  family_formation: "growing family",
  elder_care: "elder care planning",
};

function buildEmailBody(
  clientName: string,
  advisorName: string,
  nextStepsData: NextStepsData,
  products: string[],
  clientProfile?: ClientProfileData | null,
  lifeEvents?: DetectedLifeEvent[] | null
): string {
  const firstName = clientName.split(" ")[0];
  const incompleteItems = nextStepsData.actionItems.filter(i => !i.completed);

  let body = `Dear ${firstName},\n\n`;

  // Context-aware opening
  const occupation = clientProfile?.demographics?.occupation;
  const familyStatus = clientProfile?.demographics?.familyStatus;

  if (occupation && familyStatus) {
    body += `It was wonderful connecting with you today. With your background as a ${occupation} and the priorities that come with a ${familyStatus.toLowerCase()} household, I want to make sure we're building a plan that truly fits your life. Here's a recap of what we covered.\n\n`;
  } else if (occupation) {
    body += `It was wonderful connecting with you today. Given the demands of your career as a ${occupation}, I appreciate you making the time — here's a recap of what we discussed.\n\n`;
  } else {
    body += `It was wonderful connecting with you today. I appreciate you making the time, and I wanted to send along a recap of our conversation while it's still fresh.\n\n`;
  }

  // Life events — conversational tone
  if (lifeEvents && lifeEvents.length > 0) {
    const eventDescriptions = lifeEvents.map(
      e => LIFE_EVENT_LABELS[e.eventType] || e.eventName
    );
    if (eventDescriptions.length === 1) {
      body += `We spent some time talking about your ${eventDescriptions[0]}, and I think there are some great opportunities to get ahead of it. I'll be pulling together a few options and will share those with you shortly.\n\n`;
    } else {
      const last = eventDescriptions.pop();
      body += `We covered a lot of ground today — from your ${eventDescriptions.join(", ")} to your ${last}. These are exciting chapters ahead, and I want to make sure your financial plan is working hard for each of them.\n\n`;
    }
  }

  // Spending insights — natural language
  const spending = clientProfile?.spendingOverview;
  if (spending && spending.length > 0) {
    const overBudget = spending.filter(s => s.monthlySpend > s.monthlyBudget);
    if (overBudget.length > 0) {
      const top = overBudget.sort((a, b) => (b.monthlySpend / b.monthlyBudget) - (a.monthlySpend / a.monthlyBudget))[0];
      const pctOver = Math.round(((top.monthlySpend / top.monthlyBudget) - 1) * 100);
      body += `One thing I noticed while reviewing your accounts — your ${top.category.toLowerCase()} spending is running about ${pctOver}% above where we'd like it. Nothing alarming, but worth a quick conversation to see if we should adjust your allocations.\n\n`;
    }
  }

  // Action items — clean list
  const grouped: Record<string, string[]> = {};
  for (const item of incompleteItems) {
    const src = item.source || "General";
    if (!grouped[src]) grouped[src] = [];
    grouped[src].push(item.text);
  }

  if (Object.keys(grouped).length > 0) {
    body += `Here are the next steps we agreed on:\n\n`;
    for (const [, items] of Object.entries(grouped)) {
      for (const text of items) {
        body += `  • ${text}\n`;
      }
    }
    body += `\n`;
  }

  // Products discussed
  if (products.length > 0) {
    body += `I've also included links to the solutions we discussed, so you can explore them at your convenience:\n\n`;
    for (const product of products) {
      const linkText = PRODUCT_LINK_MAP[product] || product;
      body += `  • ${linkText} — ${PRODUCT_URL}\n`;
    }
    body += `\n`;
  }

  body += `As always, I'm here whenever you need me. Don't hesitate to reach out with any questions — even the small ones.\n\n`;
  body += `Warm regards,\n${advisorName}\nVentus AI Wealth Advisor`;

  return body;
}

function getAttachments(
  savedProjection: SavedFinancialProjection | null | undefined,
  products: string[]
): string[] {
  const attachments: string[] = [];

  if (savedProjection) {
    attachments.push(`Financial_Timeline_${savedProjection.projectName.replace(/\s+/g, "_")}.pdf`);
  }

  const hasProductsDiscussed = products.length > 0;
  if (hasProductsDiscussed) {
    attachments.push("Meeting_Notes_Summary.pdf");
    for (const product of products) {
      attachments.push(`${product.replace(/\s+/g, "_")}_Brochure.pdf`);
    }
  }

  return attachments;
}

export function FollowUpEmailDialog({
  open,
  onOpenChange,
  nextStepsData,
  clientName,
  clientEmail,
  advisorName,
  savedProjection,
  clientProfile,
  lifeEvents,
}: FollowUpEmailDialogProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    const stored = sessionStorage.getItem("tepilot_products_discussed");
    const prods: string[] = stored ? JSON.parse(stored) : [];
    setProducts(prods);

    setSubject(`Follow-Up: Our Recent Meeting - ${clientName}`);
    setBody(buildEmailBody(clientName, advisorName, nextStepsData, prods, clientProfile, lifeEvents));
    setAttachments(getAttachments(savedProjection, prods));
  }, [open, clientName, advisorName, nextStepsData, savedProjection, clientProfile, lifeEvents]);

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCopy = () => {
    const fullEmail = `To: ${clientEmail}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmail);
    toast.success("Email copied to clipboard");
  };

  const handleSend = () => {
    toast.success("Email sent successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tepilot-popup max-w-2xl max-h-[85vh] flex flex-col bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Mail className="w-5 h-5 text-primary" />
            Follow-Up Email Draft
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {/* To field */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-14 flex-shrink-0">To:</span>
            <div className="flex-1 bg-slate-50 border rounded-md px-3 py-1.5 text-sm text-slate-700">
              {clientEmail}
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-14 flex-shrink-0">Subject:</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Body */}
          <ScrollArea className="flex-1 min-h-[200px] max-h-[320px]">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[280px] text-sm font-mono leading-relaxed resize-none border-slate-200"
            />
          </ScrollArea>

          {/* Product Links */}
          {products.length > 0 && (
            <div className="border rounded-md p-3 bg-slate-50">
              <span className="text-xs font-semibold text-slate-700 mb-2 block">
                Product Links (included in email)
              </span>
              <div className="flex flex-wrap gap-2">
                {products.map((product) => {
                  const linkText = PRODUCT_LINK_MAP[product] || product;
                  return (
                    <a
                      key={product}
                      href={PRODUCT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {linkText}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-700 mb-1.5 block">Attachments</span>
              <div className="flex flex-wrap gap-1.5">
                {attachments.map((file, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 text-xs gap-1 bg-slate-100 text-slate-700"
                  >
                    <Paperclip className="w-3 h-3" />
                    {file}
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="ml-1 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${file}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy to Clipboard
          </Button>
          <Button size="sm" onClick={handleSend}>
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
