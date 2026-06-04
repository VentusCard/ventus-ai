import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Schema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  position: z.string().trim().min(1, "Required").max(160),
  contact: z.string().trim().min(3, "Required").max(200),
  message: z.string().trim().min(5, "Please add a bit more detail").max(5000),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName(""); setPosition(""); setContact(""); setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse({ name, position, contact, message });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast.error(first ?? "Please complete all fields");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-feedback", {
        body: { ...parsed.data, source: typeof window !== "undefined" ? window.location.pathname : undefined },
      });
      if (error || (data && (data as any).error)) {
        throw new Error(error?.message ?? "Failed to send");
      }
      toast.success("Thanks — your feedback is on its way.");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message || "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!submitting) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Feedback & Ideas</DialogTitle>
          <DialogDescription>Tell us what would make Ventus better.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fb-name">Name</Label>
              <Input id="fb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fb-position">Position</Label>
              <Input id="fb-position" value={position} onChange={(e) => setPosition(e.target.value)} maxLength={160} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-contact">Contact (email or phone)</Label>
            <Input id="fb-contact" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fb-message">Feedback</Label>
            <Textarea id="fb-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={5000} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send feedback"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
