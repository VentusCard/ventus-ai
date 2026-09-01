import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { landingCopy } from "@/landing/copy";
import { RequestAccessSchema, submitAccessRequest } from "@/landing/request/submit";

interface RequestAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialForm = { name: "", workEmail: "", institution: "", role: "", decision: "", website: "" };

export function RequestAccessModal({ open, onOpenChange }: RequestAccessModalProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "failure">("idle");

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setErrors({});
    }
  }, [open]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = RequestAccessSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] = issue.message;
      setErrors(nextErrors);
      return;
    }

    setStatus("submitting");
    try {
      await submitAccessRequest(parsed.data);
      setStatus("success");
      setForm(initialForm);
    } catch {
      setStatus("failure");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="request-modal" data-glass-region="request-access-modal">
        {status === "success" ? (
          <div className="request-modal__result" role="status">
            <CheckCircle2 aria-hidden="true" />
            <DialogHeader>
              <DialogTitle>{landingCopy.request.resultTitle}</DialogTitle>
              <DialogDescription>{landingCopy.request.success}</DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader className="request-modal__header">
              <p className="landing-eyebrow">{landingCopy.request.kicker}</p>
              <DialogTitle>{landingCopy.request.title}</DialogTitle>
              <DialogDescription>{landingCopy.request.description}</DialogDescription>
            </DialogHeader>

            <div className="request-modal__grid">
              {(["name", "workEmail", "institution", "role"] as const).map((field) => {
                const labels = landingCopy.request.fields;
                return (
                  <div key={field} className="request-modal__field">
                    <Label htmlFor={`request-${field}`}>{labels[field]}</Label>
                    <Input
                      id={`request-${field}`}
                      type={field === "workEmail" ? "email" : "text"}
                      autoComplete={field === "workEmail" ? "email" : field === "institution" ? "organization" : field === "role" ? "organization-title" : "name"}
                      value={form[field]}
                      onChange={(event) => update(field, event.target.value)}
                      aria-invalid={Boolean(errors[field])}
                      aria-describedby={errors[field] ? `request-${field}-error` : undefined}
                    />
                    {errors[field] ? <p id={`request-${field}-error`} className="request-modal__error">{errors[field]}</p> : null}
                  </div>
                );
              })}
            </div>

            <div className="request-modal__field">
              <Label htmlFor="request-decision">{landingCopy.request.fields.decision} <span>{landingCopy.request.fields.optional}</span></Label>
              <Textarea id="request-decision" value={form.decision} onChange={(event) => update("decision", event.target.value)} maxLength={1200} />
            </div>

            <div className="request-modal__honeypot" aria-hidden="true">
              <Label htmlFor="request-website">{landingCopy.request.fields.website}</Label>
              <Input id="request-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} />
            </div>

            {status === "failure" ? <p className="request-modal__failure" role="alert">{landingCopy.request.failure}</p> : null}

            <Button type="submit" className="landing-button request-modal__submit" disabled={status === "submitting"}>
              {status === "submitting" ? landingCopy.request.submitting : landingCopy.request.submit}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
