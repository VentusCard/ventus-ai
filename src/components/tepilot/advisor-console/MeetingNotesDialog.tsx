import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { NextStepsActionItem, MeetingNotesResult, SENTIMENT_PSYCHOLOGY_MAP, LIFE_EVENT_KEYWORDS } from "./sampleData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MeetingNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitNotes: (result: MeetingNotesResult) => void;
}

const MEETING_TYPES = [
  "Quarterly Review",
  "Annual Review",
  "Ad-hoc",
  "New Client Onboarding",
  "Life Event Follow-up",
];

const SENTIMENT_OPTIONS = [
  { value: "very_positive", label: "Very Positive" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "concerned", label: "Concerned" },
  { value: "anxious", label: "Anxious" },
];

const PRODUCTS = [
  "Checking",
  "Savings",
  "Mortgage",
  "Investment Portfolio",
  "Insurance",
  "529 Plan",
  "IRA",
  "Credit Card",
];

const initialState = {
  meetingType: "",
  attendees: "",
  sentiment: "",
  discussionPoints: "",
  clientRequests: "",
  decisionsMade: "",
  productsDiscussed: [] as string[],
  followUpActions: [""],
  nextMeetingDate: undefined as Date | undefined,
  nextMeetingTopic: "",
};

export function MeetingNotesDialog({ open, onOpenChange, onSubmitNotes }: MeetingNotesDialogProps) {
  const [form, setForm] = useState(initialState);

  const toggleProduct = (product: string) => {
    setForm(prev => ({
      ...prev,
      productsDiscussed: prev.productsDiscussed.includes(product)
        ? prev.productsDiscussed.filter(p => p !== product)
        : [...prev.productsDiscussed, product],
    }));
  };

  const updateFollowUp = (index: number, value: string) => {
    setForm(prev => {
      const updated = [...prev.followUpActions];
      updated[index] = value;
      return { ...prev, followUpActions: updated };
    });
  };

  const addFollowUp = () => setForm(prev => ({ ...prev, followUpActions: [...prev.followUpActions, ""] }));

  const removeFollowUp = (index: number) => {
    setForm(prev => ({
      ...prev,
      followUpActions: prev.followUpActions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    const items: NextStepsActionItem[] = [];
    const now = new Date();

    // Follow-up actions
    form.followUpActions
      .map(a => a.trim())
      .filter(a => a.length > 0)
      .forEach((text, idx) => {
        items.push({
          id: `notes-action-${Date.now()}-${idx}`,
          text: text.length > 60 ? text.slice(0, 57) + "..." : text,
          completed: false,
          source: "notes",
          timestamp: now,
        });
      });

    // Client requests
    form.clientRequests
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .forEach((line, idx) => {
        const text = `Client request: ${line}`;
        items.push({
          id: `notes-req-${Date.now()}-${idx}`,
          text: text.length > 60 ? text.slice(0, 57) + "..." : text,
          completed: false,
          source: "notes",
          timestamp: now,
        });
      });

    // Decisions made
    form.decisionsMade
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .forEach((line, idx) => {
        const text = `Decision: ${line}`;
        items.push({
          id: `notes-dec-${Date.now()}-${idx}`,
          text: text.length > 60 ? text.slice(0, 57) + "..." : text,
          completed: false,
          source: "notes",
          timestamp: now,
        });
      });

    // Next meeting as action item
    if (form.nextMeetingDate) {
      const dateStr = format(form.nextMeetingDate, "MMM d");
      const topic = form.nextMeetingTopic ? `: ${form.nextMeetingTopic}` : "";
      const text = `Schedule meeting ${dateStr}${topic}`;
      items.push({
        id: `notes-mtg-${Date.now()}`,
        text: text.length > 60 ? text.slice(0, 57) + "..." : text,
        completed: false,
        source: "notes",
        timestamp: now,
      });
    }

    // Build chat summary
    const summaryParts: string[] = [];
    if (form.meetingType) summaryParts.push(`Type: ${form.meetingType}`);
    if (form.sentiment) {
      const sentimentLabel = SENTIMENT_OPTIONS.find(s => s.value === form.sentiment)?.label || form.sentiment;
      summaryParts.push(`Sentiment: ${sentimentLabel}`);
    }
    if (form.discussionPoints.trim()) summaryParts.push(`Discussion: ${form.discussionPoints.trim()}`);
    if (form.productsDiscussed.length > 0) summaryParts.push(`Products discussed: ${form.productsDiscussed.join(", ")}`);
    if (form.clientRequests.trim()) summaryParts.push(`Client requests: ${form.clientRequests.trim()}`);
    if (form.decisionsMade.trim()) summaryParts.push(`Decisions: ${form.decisionsMade.trim()}`);

    const chatSummary = `Meeting notes summary — ${summaryParts.join(". ")}. Please analyze this meeting and suggest any additional action items or opportunities I may have missed.`;

    const result: MeetingNotesResult = {
      actionItems: items,
      sentiment: form.sentiment || undefined,
      productsDiscussed: form.productsDiscussed,
      meetingType: form.meetingType,
      nextMeetingDate: form.nextMeetingDate,
      nextMeetingTopic: form.nextMeetingTopic,
      chatSummary,
    };

    onSubmitNotes(result);
    setForm(initialState);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 tepilot-popup bg-white text-slate-900">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Meeting Notes</DialogTitle>
        </DialogHeader>

        <ScrollArea className="px-6 pb-2 max-h-[calc(90vh-140px)]">
          <div className="space-y-5 py-2">
            {/* Meeting Context & Attendees */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Meeting Type</Label>
                <Select value={form.meetingType} onValueChange={v => setForm(p => ({ ...p, meetingType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Attendees</Label>
                <Input
                  placeholder="e.g. John Smith, Sarah Lee"
                  value={form.attendees}
                  onChange={e => setForm(p => ({ ...p, attendees: e.target.value }))}
                />
              </div>
            </div>

            {/* Client Sentiment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client Sentiment</Label>
              <RadioGroup
                value={form.sentiment}
                onValueChange={v => setForm(p => ({ ...p, sentiment: v }))}
                className="flex flex-wrap gap-3"
              >
                {SENTIMENT_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center gap-1.5">
                    <RadioGroupItem value={opt.value} id={`sentiment-${opt.value}`} />
                    <Label htmlFor={`sentiment-${opt.value}`} className="text-xs cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Discussion Points */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Key Discussion Points</Label>
              <Textarea
                rows={3}
                placeholder="Main topics covered during the meeting..."
                value={form.discussionPoints}
                onChange={e => setForm(p => ({ ...p, discussionPoints: e.target.value }))}
              />
            </div>

            {/* Client Requests */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Client Requests</Label>
              <Textarea
                rows={2}
                placeholder="One request per line..."
                value={form.clientRequests}
                onChange={e => setForm(p => ({ ...p, clientRequests: e.target.value }))}
              />
            </div>

            {/* Decisions Made */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Decisions Made</Label>
              <Textarea
                rows={2}
                placeholder="One decision per line..."
                value={form.decisionsMade}
                onChange={e => setForm(p => ({ ...p, decisionsMade: e.target.value }))}
              />
            </div>

            {/* Products Discussed */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Products Discussed</Label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {PRODUCTS.map(product => (
                  <div key={product} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`product-${product}`}
                      checked={form.productsDiscussed.includes(product)}
                      onCheckedChange={() => toggleProduct(product)}
                    />
                    <Label htmlFor={`product-${product}`} className="text-xs cursor-pointer">{product}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Actions */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Follow-up Actions</Label>
              <div className="space-y-2">
                {form.followUpActions.map((action, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder={`Action item ${idx + 1}`}
                      value={action}
                      onChange={e => updateFollowUp(idx, e.target.value)}
                      className="flex-1"
                    />
                    {form.followUpActions.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeFollowUp(idx)} className="shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFollowUp} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Action
                </Button>
              </div>
            </div>

            {/* Next Meeting */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Next Meeting Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-xs", !form.nextMeetingDate && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                      {form.nextMeetingDate ? format(form.nextMeetingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.nextMeetingDate}
                      onSelect={d => setForm(p => ({ ...p, nextMeetingDate: d }))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Meeting Topic</Label>
                <Input
                  placeholder="e.g. Review portfolio rebalancing"
                  value={form.nextMeetingTopic}
                  onChange={e => setForm(p => ({ ...p, nextMeetingTopic: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex gap-2 w-full justify-end">
            <Button className="bg-white text-slate-800 border border-slate-300 hover:bg-slate-50" variant="outline" onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Save Notes
            </Button>
            <Button variant="outline" className="bg-white text-slate-800 border-slate-300 hover:bg-slate-50" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
