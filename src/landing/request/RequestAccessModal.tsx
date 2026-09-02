import { FormEvent, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { LANDING_COPY } from "../copy";
import { useRequestAccess } from "./context";
import { submitAccessRequest } from "./submit";
import "./modal.css";

type Status = "idle" | "submitting" | "success" | "failure";

interface FormState {
  name: string;
  email: string;
  institution: string;
  role: string;
  decision: string;
  // Honeypot: a real visitor never sees or fills this in. Any value here at
  // submit time means the request is silently treated as a no-op bot fill.
  companyWebsite: string;
}

type RequiredField = "name" | "email" | "institution" | "role";

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  institution: "",
  role: "",
  decision: "",
  companyWebsite: "",
};

const REQUIRED_FIELDS: RequiredField[] = ["name", "email", "institution", "role"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const REQUIRED_MESSAGE = "This field is required.";
const EMAIL_MESSAGE = "Enter a valid email.";

const modalCopy = LANDING_COPY.modal;

export function RequestAccessModal() {
  const { isOpen, close } = useRequestAccess();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<RequiredField, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = "request-access-title";

  // Reset transient form/status state each time the modal is freshly opened,
  // capture what had focus so it can be restored on close, and move focus
  // into the panel.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    setStatus("idle");

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.tabIndex !== -1,
      );
      (focusable[0] ?? panel).focus();
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Focus trap + Escape-to-close, scoped to the panel while open.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, close]);

  // Restore focus to whatever opened the modal once it closes.
  useEffect(() => {
    if (isOpen) return;
    previouslyFocusedRef.current?.focus?.();
  }, [isOpen]);

  if (!isOpen) return null;

  function validate(values: FormState): Partial<Record<RequiredField, string>> {
    const next: Partial<Record<RequiredField, string>> = {};
    for (const field of REQUIRED_FIELDS) {
      const value = values[field].trim();
      if (!value) {
        next[field] = REQUIRED_MESSAGE;
      } else if (field === "email" && !EMAIL_RE.test(value)) {
        next[field] = EMAIL_MESSAGE;
      }
    }
    return next;
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur(field: RequiredField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, institution: true, role: true });

    if (Object.keys(nextErrors).length > 0) return;

    // Honeypot tripped: pretend success and never touch the real backend.
    if (form.companyWebsite.trim() !== "") {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    try {
      await submitAccessRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        institution: form.institution.trim(),
        role: form.role.trim(),
        decision: form.decision.trim() || undefined,
      });
      setStatus("success");
    } catch (error) {
      console.error("submitAccessRequest failed", error);
      setStatus("failure");
    }
  }

  function handleOverlayMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) close();
  }

  const isSubmitting = status === "submitting";

  return (
    <div className="landing landing-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        ref={panelRef}
        className="landing-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button type="button" className="landing-modal-close" aria-label={modalCopy.close} onClick={close}>
          <X aria-hidden="true" />
        </button>

        <h2 id={titleId} className="landing-modal-title">
          {modalCopy.title}
        </h2>

        {status === "success" ? (
          <div className="landing-modal-success" role="status">
            {modalCopy.success}
          </div>
        ) : (
          <>
            <p className="landing-modal-intro">{modalCopy.intro}</p>

            {status === "failure" && (
              <div className="landing-modal-banner" role="alert">
                {modalCopy.failure}
              </div>
            )}

            <form className="landing-modal-form" onSubmit={handleSubmit} noValidate>
              <div className="landing-modal-field">
                <label htmlFor="ra-name">{modalCopy.fields.name}</label>
                <input
                  id="ra-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  aria-invalid={Boolean(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? "ra-name-error" : undefined}
                  required
                />
                {touched.name && errors.name && (
                  <span id="ra-name-error" className="landing-modal-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="landing-modal-field">
                <label htmlFor="ra-email">{modalCopy.fields.email}</label>
                <input
                  id="ra-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? "ra-email-error" : undefined}
                  required
                />
                {touched.email && errors.email && (
                  <span id="ra-email-error" className="landing-modal-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="landing-modal-field">
                <label htmlFor="ra-institution">{modalCopy.fields.institution}</label>
                <input
                  id="ra-institution"
                  type="text"
                  value={form.institution}
                  onChange={(e) => handleChange("institution", e.target.value)}
                  onBlur={() => handleBlur("institution")}
                  aria-invalid={Boolean(touched.institution && errors.institution)}
                  aria-describedby={touched.institution && errors.institution ? "ra-institution-error" : undefined}
                  required
                />
                {touched.institution && errors.institution && (
                  <span id="ra-institution-error" className="landing-modal-error">
                    {errors.institution}
                  </span>
                )}
              </div>

              <div className="landing-modal-field">
                <label htmlFor="ra-role">{modalCopy.fields.role}</label>
                <input
                  id="ra-role"
                  type="text"
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  onBlur={() => handleBlur("role")}
                  aria-invalid={Boolean(touched.role && errors.role)}
                  aria-describedby={touched.role && errors.role ? "ra-role-error" : undefined}
                  required
                />
                {touched.role && errors.role && (
                  <span id="ra-role-error" className="landing-modal-error">
                    {errors.role}
                  </span>
                )}
              </div>

              <div className="landing-modal-field">
                <label htmlFor="ra-decision">{modalCopy.fields.decision}</label>
                <textarea
                  id="ra-decision"
                  rows={3}
                  placeholder={modalCopy.fields.decisionPlaceholder}
                  value={form.decision}
                  onChange={(e) => handleChange("decision", e.target.value)}
                  aria-describedby="ra-decision-hint"
                />
                <span id="ra-decision-hint" className="landing-modal-hint">
                  {modalCopy.fields.decisionHint}
                </span>
              </div>

              {/* Honeypot — invisible and unreachable to real visitors, left
                  empty by them; a filled value marks a bot fill. */}
              <div className="landing-modal-honeypot" aria-hidden="true">
                <label htmlFor="ra-company-website">Company website</label>
                <input
                  id="ra-company-website"
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.companyWebsite}
                  onChange={(e) => handleChange("companyWebsite", e.target.value)}
                />
              </div>

              <div className="landing-modal-actions">
                <button type="submit" className="landing-cta" disabled={isSubmitting}>
                  {isSubmitting ? modalCopy.submitting : modalCopy.submit}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
