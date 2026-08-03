// Growth Console authentication. Cognito uses an institution-provisioned
// authorization-code flow; the legacy email form remains only for rollback.

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  beginSignIn,
  completeSignIn,
  consoleAuthProvider,
  isConsoleAuthConfigured,
  signInWithPassword,
} from "@/console/authClient";
import { resolveTenantFromEmail } from "@/lib/tenant";
import { useAuth } from "@/console/state";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";
import "@/styles/console.css";

const LEDGER_MOTIF = [
  ["#001", "SIGNAL", "Payroll split detected"],
  ["#002", "GATE", "Policy pack attached"],
  ["#003", "DECISION", "Growth Play qualified"],
  ["#004", "ACTIVATE", "Banker task created"],
  ["#005", "OUTCOME", "Lift measured vs holdout"],
];

function BrandPanel() {
  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
      style={{ backgroundColor: "var(--v2-console)" }}
    >
      <Link to="/v2" className="self-start" aria-label="Return to Ventus AI">
        <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto brightness-0 invert" />
      </Link>
      <div>
        <h1 className="v2-display max-w-md text-4xl text-white xl:text-5xl">
          Every decision leaves a receipt.
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-6" style={{ color: "var(--v2-console-soft)" }}>
          Qualified moments, governed actions, measured lift — with a receipt
          for every step in the operating loop.
        </p>
        <div className="mt-9 max-w-sm space-y-1.5">
          {LEDGER_MOTIF.map(([seq, kind, title]) => (
            <div
              key={seq}
              className="flex items-center gap-3 rounded-md border px-3 py-2"
              style={{ borderColor: "var(--v2-console-line)", backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <span className="v2-mono text-[10px]" style={{ color: "var(--v2-console-faint)" }}>{seq}</span>
              <span className="v2-mono w-16 text-[9px] font-bold tracking-wider" style={{ color: kind === "OUTCOME" ? "#34D399" : "#9FB6D4" }}>{kind}</span>
              <span className="truncate text-[12px] font-medium text-white/85">{title}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="v2-mono text-[10px]" style={{ color: "var(--v2-console-faint)" }}>
        governed growth plays · measured lift · decision ledger
      </p>
    </div>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2 console grid min-h-svh lg:grid-cols-[0.9fr_1.1fr]">
      <BrandPanel />
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

function CognitoSignInButton({ label }: { label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const start = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await beginSignIn();
    } catch (cause) {
      setSubmitting(false);
      setError(cause instanceof Error ? cause.message : "Secure sign in could not start.");
    }
  };

  return (
    <>
      {error && (
        <p className="mt-5 text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => void start()}
        className="console-btn mt-8 w-full"
        disabled={submitting || !isConsoleAuthConfigured}
        style={{ backgroundColor: "var(--v2-ink)" }}
      >
        {submitting
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <>{label} <ArrowRight className="h-4 w-4" /></>}
      </button>
    </>
  );
}

export function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const cognito = consoleAuthProvider === "cognito";

  if (!loading && user) return <Navigate to="/app" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isConsoleAuthConfigured) {
      setError("Console authentication is not configured in this environment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      if (!cognito) navigate("/app", { replace: true });
    } catch (authError) {
      setSubmitting(false);
      setError(authError instanceof Error ? authError.message : "Sign in failed.");
    }
  };

  return (
    <AuthShell>
      <Link to="/v2" className="mb-10 inline-flex lg:hidden" aria-label="Return to Ventus AI">
        <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto" />
      </Link>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Sign in.</h2>
      {!isConsoleAuthConfigured && (
        <p className="mt-4 text-[12px] font-semibold" style={{ color: "#b3261e" }} role="status">
          Console authentication is not configured in this environment.
        </p>
      )}
      {searchParams.get("confirmed") === "1" && (
        <p className="mt-4 text-[13px] font-semibold" style={{ color: "var(--v2-verified)" }}>
          Email confirmed. Your workspace is ready.
        </p>
      )}
      <form onSubmit={submit} className="mt-8 space-y-3">
        {!cognito && (
          <>
            <input
              className="console-field"
              type="email"
              autoComplete="email"
              placeholder="Work email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="console-field"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </>
        )}
        {error && (
          <p className="text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="console-btn w-full" disabled={submitting} style={{ backgroundColor: "var(--v2-ink)" }}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{cognito ? "Continue with work account" : "Continue"} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      {cognito ? (
        <p className="mt-6 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>
          Access is provisioned by your institution. Password recovery and MFA continue in the secure sign-in flow.
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>
          <p>
            New operator?{" "}
            <Link to="/app/signup" className="font-semibold" style={{ color: "var(--v2-blue)" }}>
              Create an account
            </Link>
          </p>
          <Link to="/app/forgot-password" className="font-semibold" style={{ color: "var(--v2-blue)" }}>
            Reset password
          </Link>
        </div>
      )}
      <p className="v2-mono mt-10 text-[10px] leading-4" style={{ color: "var(--v2-ink-faint)" }}>
        Pilot access is restricted to approved work domains. Enterprise SSO is
        configured with each institution.
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const tenant = useMemo(() => resolveTenantFromEmail(email.includes("@") ? email : null), [email]);

  if (!loading && user) return <Navigate to="/app" replace />;
  if (consoleAuthProvider === "cognito") {
    return (
      <AuthShell>
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
          Growth Console
        </p>
        <h2 className="v2-display mt-3 text-4xl">Institution access.</h2>
        <p className="v2-body mt-5 text-[15px]">
          Growth Console accounts are provisioned by your institution or Ventus pilot administrator.
        </p>
        <CognitoSignInButton label="Continue to sign in" />
      </AuthShell>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Console authentication is not configured in this environment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const emailRedirectTo = `${window.location.origin}/app/login?confirmed=1`;
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    setSubmitting(false);
    if (authError) {
      setError(readableAuthError(authError.message));
      return;
    }
    if (data.user && data.user.identities?.length === 0) {
      setError("This email already has an account. Sign in or reset your password.");
      return;
    }
    if (data.session) {
      navigate("/app", { replace: true });
    } else {
      // Email confirmation is enabled on the project — be explicit about it.
      setPendingConfirm(true);
    }
  };

  const resendConfirmation = async () => {
    if (!isSupabaseConfigured) {
      setResendStatus("Console authentication is not configured in this environment.");
      return;
    }
    setResending(true);
    setResendStatus(null);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/app/login?confirmed=1` },
    });
    setResending(false);
    setResendStatus(resendError ? readableAuthError(resendError.message) : "Confirmation email resent.");
  };

  if (pendingConfirm) {
    return (
      <AuthShell>
        <h2 className="v2-display text-3xl">Confirm your email.</h2>
        <p className="v2-body mt-4 text-[15px]">
          We sent a confirmation link to <span className="font-semibold" style={{ color: "var(--v2-ink)" }}>{email}</span>.
          Open it, then sign in.
        </p>
        <button
          type="button"
          onClick={() => void resendConfirmation()}
          disabled={resending}
          className="console-btn-ghost mt-6 w-full"
        >
          {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend confirmation"}
        </button>
        {resendStatus && (
          <p className="mt-3 text-[12px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
            {resendStatus}
          </p>
        )}
        <Link to="/app/login" className="console-btn mt-8 w-full" style={{ backgroundColor: "var(--v2-ink)" }}>
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Link to="/v2" className="mb-10 inline-flex lg:hidden" aria-label="Return to Ventus AI">
        <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto" />
      </Link>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Create your<br />account.</h2>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          className="console-field"
          type="email"
          autoComplete="email"
          placeholder="Work email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="console-field"
          type="password"
          autoComplete="new-password"
          placeholder="Password (8+ characters)"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {email.includes("@") && tenant.id !== "ventus" && (
          <div
            className="flex items-center gap-2.5 rounded-md border px-3 py-2.5"
            style={{ borderColor: tenant.accent + "33", backgroundColor: tenant.accentWash }}
          >
            <span
              className="relative flex h-6 w-6 flex-none items-center justify-center overflow-hidden rounded text-[11px] font-black text-white"
              style={{ backgroundColor: tenant.mark.bg }}
            >
              {tenant.mark.letter}
              {tenant.mark.flag && <span className="absolute -right-0.5 top-0 h-6 w-[5px] rotate-[24deg]" style={{ backgroundColor: "#E31837" }} />}
            </span>
            <p className="text-[12px] font-semibold" style={{ color: tenant.accent }}>
              This workspace is configured for {tenant.name}.
            </p>
          </div>
        )}
        {error && (
          <p className="text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="console-btn w-full" disabled={submitting} style={{ backgroundColor: "var(--v2-ink)" }}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <p className="mt-6 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>
        Already set up?{" "}
        <Link to="/app/login" className="font-semibold" style={{ color: "var(--v2-blue)" }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (consoleAuthProvider === "cognito") {
    return (
      <AuthShell>
        <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
          Growth Console
        </p>
        <h2 className="v2-display mt-3 text-4xl">Recover access.</h2>
        <p className="v2-body mt-5 text-[15px]">
          Password recovery and MFA are managed in your institution's secure sign-in flow.
        </p>
        <CognitoSignInButton label="Continue to secure sign in" />
      </AuthShell>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Console authentication is not configured in this environment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app/reset-password`,
    });
    setSubmitting(false);
    if (authError) {
      setError(readableAuthError(authError.message));
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Reset password.</h2>
      {sent ? (
        <>
          <p className="v2-body mt-5 text-[15px]">
            Check <span className="font-semibold" style={{ color: "var(--v2-ink)" }}>{email}</span> for a secure reset link.
          </p>
          <Link to="/app/login" className="console-btn mt-8 w-full" style={{ backgroundColor: "var(--v2-ink)" }}>
            Back to sign in
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input
            className="console-field"
            type="email"
            autoComplete="email"
            placeholder="Work email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {error && (
            <p className="text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="console-btn w-full" disabled={submitting} style={{ backgroundColor: "var(--v2-ink)" }}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
          </button>
          <Link to="/app/login" className="console-btn-ghost w-full">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (consoleAuthProvider === "cognito") return <Navigate to="/app/forgot-password" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Console authentication is not configured in this environment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (authError) {
      setError(readableAuthError(authError.message));
      return;
    }
    navigate("/app", { replace: true });
  };

  return (
    <AuthShell>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Choose a new password.</h2>
      {!loading && !user ? (
        <>
          <p className="v2-body mt-5 text-[15px]">Open the secure link from your reset email to continue.</p>
          <Link to="/app/forgot-password" className="console-btn mt-8 w-full" style={{ backgroundColor: "var(--v2-ink)" }}>
            Request another link
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <input
            className="console-field"
            type="password"
            autoComplete="new-password"
            placeholder="New password (8+ characters)"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && (
            <p className="text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="console-btn w-full" disabled={submitting || loading} style={{ backgroundColor: "var(--v2-ink)" }}>
            {submitting || loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Update password <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    completeSignIn()
      .then(() => {
        if (active) navigate("/app", { replace: true });
      })
      .catch(() => {
        if (active) setError("The secure sign-in session expired or could not be verified.");
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <AuthShell>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">{error ? "Sign in could not finish." : "Securing your workspace."}</h2>
      {error ? (
        <>
          <p className="mt-5 text-[13px] font-semibold" style={{ color: "#b3261e" }} role="alert">{error}</p>
          <Link to="/app/login" className="console-btn mt-8 w-full" style={{ backgroundColor: "var(--v2-ink)" }}>
            Return to sign in
          </Link>
        </>
      ) : (
        <div className="mt-8 flex items-center gap-3 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying identity and institution access
        </div>
      )}
    </AuthShell>
  );
}

function readableAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit")) {
    return "Email delivery is temporarily rate-limited. Wait a few minutes, then resend the confirmation.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "This email already has an account. Sign in instead.";
  }
  return message;
}
