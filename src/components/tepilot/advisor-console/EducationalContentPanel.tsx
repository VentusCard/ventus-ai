import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, ChevronDown, ChevronUp, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EducationalContentPanelProps {
  education: string[];
  eventName: string;
}

export function EducationalContentPanel({ education, eventName }: EducationalContentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    const content = education.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Educational content copied successfully",
      duration: 2000
    });
  };

  const handleShare = () => {
    toast({
      title: "Email draft created",
      description: "Educational content prepared for client email",
      duration: 2000
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Educational Content: {eventName}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full mb-3">
            <div className="flex items-center justify-between text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <span>{education.length} key insights for client discussion</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="space-y-2 mb-4">
              {education.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-500 flex gap-2">
                  <span className="text-primary font-semibold shrink-0">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm" className="flex-1">
                <Share2 className="w-3 h-3 mr-1" />
                Share with Client
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
