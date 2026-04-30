import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTo: string;
  defaultSubject: string;
  defaultBody: string;
}

export default function EmailDraftDialog({
  open,
  onOpenChange,
  defaultTo,
  defaultSubject,
  defaultBody,
}: Props) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTo(defaultTo);
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [open, defaultTo, defaultSubject, defaultBody]);

  const handleSend = async () => {
    if (!to || !to.includes("@")) {
      toast.error("Please enter a valid recipient email");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-follow-up-email", {
        body: { to, subject, body, advisorName: "Ventus AI Team" },
      });
      if (error) throw error;
      toast.success("Draft sent");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Email proposal draft</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To</label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 mt-1 min-h-[280px] font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-9 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 inline-flex items-center gap-2 disabled:opacity-60"
          >
            {sending ? <Loader2 className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 w-4 h-4 animate-spin" /> : <Send className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 w-4 h-4" />}
            Send draft
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
