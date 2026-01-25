import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { sampleMeetingTranscripts } from "./sampleData";

interface TranscriptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitTranscript: (message: string) => void;
}

const TRANSCRIPT_ANALYSIS_PROMPT = `You are an expert wealth management psychoanalyst and opportunity detector.

Analyze this meeting transcript to extract:

1. OPPORTUNITIES (Business Development):
   - Upsell/cross-sell opportunities
   - Product recommendations
   - Risk mitigation needs
   - Investment opportunities
   - Life insurance or estate planning triggers

2. PSYCHOLOGICAL INSIGHTS:
   - Client emotional state (confident, anxious, uncertain, optimistic)
   - Risk tolerance indicators
   - Decision-making style
   - Trust level with advisor
   - Financial sophistication level

3. ACTION ITEMS:
   - Commitments made by advisor
   - Client requests
   - Follow-up items with deadlines

4. LIFE EVENT SIGNALS:
   - Job changes, retirement, marriage, divorce
   - Home purchase/sale
   - Children education planning
   - Health concerns
   - Business ownership changes

Provide a comprehensive analysis with specific quotes and recommendations.`;

export function TranscriptUploadDialog({ open, onOpenChange, onSubmitTranscript }: TranscriptUploadDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const { toast } = useToast();

  const loadSampleTranscript = (transcriptId: string) => {
    const sample = sampleMeetingTranscripts.find(t => t.id === transcriptId);
    if (sample) {
      setMeetingDate(sample.date);
      setTranscriptText(sample.transcript);
      toast({
        title: "Sample Loaded",
        description: `Loaded: ${sample.title}`,
      });
    }
  };

  const handleSubmit = () => {
    if (!transcriptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter transcript text",
        variant: "destructive"
      });
      return;
    }

    // Format the message for the chat
    const analysisMessage = `${TRANSCRIPT_ANALYSIS_PROMPT}

DATE: ${meetingDate || 'Not specified'}

TRANSCRIPT:
${transcriptText}

Please provide structured analysis with opportunities, psychological insights, action items, and life events.`;

    // Send to chat
    onSubmitTranscript(analysisMessage);
    
    toast({
      title: "✓ Transcript Submitted",
      description: "Analysis in progress - check the chat"
    });
    
    // Close dialog and reset form
    onOpenChange(false);
    setMeetingDate('');
    setTranscriptText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Upload Meeting Transcript
            </DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Load Sample
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[400px]">
                {sampleMeetingTranscripts.map((transcript) => (
                  <DropdownMenuItem
                    key={transcript.id}
                    onClick={() => loadSampleTranscript(transcript.id)}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="font-medium">{transcript.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {transcript.context} • {transcript.duration}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Meeting Info */}
          <div>
            <Label>Meeting Date (Optional)</Label>
            <Input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
          </div>
          
          {/* Transcript Input */}
          <div>
            <Label>Transcript Text</Label>
            <Textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste meeting transcript here...

Example:
Advisor: How have you been feeling about your retirement plans?
Client: I'm a bit anxious about whether I've saved enough..."
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              {transcriptText.split(/\s+/).length} words
            </p>
          </div>
          
          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!transcriptText.trim()}
            className="w-full"
          >
            Analyze Transcript
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
