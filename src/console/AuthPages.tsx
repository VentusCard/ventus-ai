// Growth Console authentication is Cognito-only. Institution membership and
// tenant scope are resolved server-side after the authorization-code flow.

import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  beginSignIn,
  completeSignIn,
  isConsoleAuthConfigured,
} from "@/console/authClient";
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  if (!loading && user) return <Navigate to="/app" replace />;

  const submit = async () => {
    if (!isConsoleAuthConfigured) {
      setError("Console authentication is not configured in this environment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await beginSignIn();
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
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="mt-8 space-y-3">
        {error && (
          <p className="text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="console-btn w-full" disabled={submitting || !isConsoleAuthConfigured} style={{ backgroundColor: "var(--v2-ink)" }}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue with work account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <p className="mt-6 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>
        Access is provisioned by your institution. Password recovery and MFA continue in the secure Cognito sign-in flow.
      </p>
      <p className="v2-mono mt-10 text-[10px] leading-4" style={{ color: "var(--v2-ink-faint)" }}>
        Pilot access is restricted to approved work domains. Enterprise SSO is
        configured with each institution.
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/app" replace />;
  return (
    <AuthShell>
      <Link to="/v2" className="mb-10 inline-flex lg:hidden" aria-label="Return to Ventus AI">
        <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto" />
      </Link>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Institution access.</h2>
      <p className="v2-body mt-5 text-[15px]">Accounts are provisioned by your institution or Ventus pilot administrator.</p>
      <CognitoSignInButton label="Continue to sign in" />
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  return (
    <AuthShell>
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Recover access.</h2>
      <p className="v2-body mt-5 text-[15px]">Password recovery and MFA are managed in your institution's secure Cognito sign-in flow.</p>
      <CognitoSignInButton label="Continue to secure sign in" />
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  return <Navigate to="/app/forgot-password" replace />;
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
