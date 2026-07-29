import { Mail, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EmailResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailResultDialog({ open, onOpenChange }: EmailResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Mail className="w-4 h-4 text-blue-600" /> Email this result
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Send the AI takeaway, top rows, and a CSV attachment to a teammate or yourself.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] text-amber-900">
          <div className="font-medium mb-0.5">Email delivery isn't set up yet</div>
          <div className="text-amber-800/90 leading-relaxed">
            Configure a verified sender domain in <span className="font-medium">Cloud → Emails</span> to enable outbound sends. Once a domain is active, this dialog will collect recipients and send.
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="https://docs.lovable.dev/features/cloud"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Email setup guide <ExternalLink className="w-3 h-3" />
          </a>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
