import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TalkingPointsSectionProps {
  talkingPoints: string[];
}

export function TalkingPointsSection({ talkingPoints }: TalkingPointsSectionProps) {
  const { toast } = useToast();

  const handleCopyPoint = (point: string) => {
    navigator.clipboard.writeText(point);
    toast({
      title: "Copied to clipboard",
      description: "Talking point copied successfully",
      duration: 2000
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Conversation Starters</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {talkingPoints.map((point, idx) => (
          <div key={idx} className="bg-slate-50 p-2 rounded-lg group hover:bg-slate-100 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-900 flex-1">{point}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopyPoint(point)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
