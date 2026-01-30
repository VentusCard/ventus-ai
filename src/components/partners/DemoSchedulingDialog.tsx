import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ExternalLink, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoSchedulingDialogProps {
  children: React.ReactNode;
}

const DemoSchedulingDialog = ({ children }: DemoSchedulingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleScheduleDemo = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to schedule a demo.",
        variant: "destructive",
      });
      return;
    }

    // Create the Google Calendar link with pre-filled details
    const calendarUrl = new URL("https://calendar.google.com/calendar/render");
    calendarUrl.searchParams.set("action", "TEMPLATE");
    calendarUrl.searchParams.set("text", "Ventus Partnership Demo");
    calendarUrl.searchParams.set("details", `Demo requested by: ${email}\n\nDiscuss Ventus partnership opportunities and advanced targeting tools.`);
    calendarUrl.searchParams.set("location", "Virtual Meeting (Link to be shared)");
    
    // Set to next business day at 2 PM EST
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    tomorrow.setHours(14, 0, 0, 0); // 2 PM
    
    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0); // 3 PM
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    calendarUrl.searchParams.set("dates", `${formatDate(tomorrow)}/${formatDate(endTime)}`);

    // Open the calendar link
    window.open(calendarUrl.toString(), '_blank');

    toast({
      title: "Demo Scheduled!",
      description: "Please save the calendar event and we'll send you meeting details soon.",
    });

    setIsOpen(false);
    setEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule a Demo
          </DialogTitle>
          <DialogDescription>
            Book a personalized demo to see how Ventus can help grow your business with our advanced targeting tools.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600" />
            <div className="text-sm text-blue-800">
              <div className="font-medium">30-minute consultation</div>
              <div>Next available: Tomorrow 2:00 PM EST</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Email Address
            </label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
            <p className="font-medium mb-1">What we'll cover:</p>
            <ul className="space-y-1 text-xs">
              <li>• Goal-based targeting capabilities</li>
              <li>• Advanced customer segmentation</li>
              <li>• ROI projections for your business</li>
              <li>• Partnership integration process</li>
            </ul>
          </div>

          <Button
            onClick={handleScheduleDemo}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Calendar to Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoSchedulingDialog;