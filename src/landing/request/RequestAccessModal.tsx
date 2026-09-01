import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="request-modal__overlay" />
        <Dialog.Content className="request-modal" data-glass-region="request-access-modal">
          <Dialog.Close className="request-modal__close" aria-label={landingCopy.accessibility.closeRequestModal}>
            <X aria-hidden="true" />
          </Dialog.Close>
          {status === "success" ? (
            <div className="request-modal__result" role="status">
              <CheckCircle2 aria-hidden="true" />
              <div>
                <Dialog.Title>{landingCopy.request.resultTitle}</Dialog.Title>
                <Dialog.Description>{landingCopy.request.success}</Dialog.Description>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="request-modal__header">
                <p className="landing-eyebrow">{landingCopy.request.kicker}</p>
                <Dialog.Title>{landingCopy.request.title}</Dialog.Title>
                <Dialog.Description>{landingCopy.request.description}</Dialog.Description>
              </div>

              <div className="request-modal__grid">
                {(["name", "workEmail", "institution", "role"] as const).map((field) => {
                  const labels = landingCopy.request.fields;
                  return (
                    <div key={field} className="request-modal__field">
                      <label htmlFor={`request-${field}`}>{labels[field]}</label>
                      <input
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
                <label htmlFor="request-decision">{landingCopy.request.fields.decision} <span>{landingCopy.request.fields.optional}</span></label>
                <textarea id="request-decision" value={form.decision} onChange={(event) => update("decision", event.target.value)} maxLength={1200} />
              </div>

              <div className="request-modal__honeypot" aria-hidden="true">
                <label htmlFor="request-website">{landingCopy.request.fields.website}</label>
                <input id="request-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} />
              </div>

              {status === "failure" ? <p className="request-modal__failure" role="alert">{landingCopy.request.failure}</p> : null}

              <button type="submit" className="landing-button request-modal__submit" disabled={status === "submitting"}>
                {status === "submitting" ? landingCopy.request.submitting : landingCopy.request.submit}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
