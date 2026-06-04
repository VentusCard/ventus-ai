import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Schema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  position: z.string().trim().min(1, "Required").max(160),
  contact: z.string().trim().min(3, "Required").max(200),
  message: z.string().trim().min(5, "Please add a bit more detail").max(5000),
});

export function FeedbackPage() {
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
    } catch (err) {
      toast.error((err as Error).message || "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Feedback & Ideas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tell us what would make Ventus better. We read every note.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
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
          <Textarea
            id="fb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            maxLength={5000}
            placeholder="What's working, what's not, what you'd love to see next…"
            required
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send feedback"}
          </Button>
        </div>
      </form>
    </div>
  );
}
