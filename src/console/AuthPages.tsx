// Sign-in and sign-up for the Growth Console. Split composition: the brand
// panel states what the product is in one breath; the form asks for exactly
// two things. Tenant resolution happens on the email domain — a BofA operator
// signs up and lands in a console that is already theirs.

import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveTenant } from "@/lib/tenant";
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
      <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto brightness-0 invert" style={{ alignSelf: "flex-start" }} />
      <div>
        <h1 className="v2-display max-w-md text-4xl text-white xl:text-5xl">
          Every decision leaves a receipt.
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-6" style={{ color: "var(--v2-console-soft)" }}>
          Qualified moments, governed actions, measured lift — recorded in an
          append-only ledger your risk team can verify.
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

export function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate("/app", { replace: true });
  };

  return (
    <AuthShell>
      <img src={ventusLogo} alt="Ventus AI" className="mb-10 h-5 w-auto lg:hidden" />
      <p className="v2-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
        Growth Console
      </p>
      <h2 className="v2-display mt-3 text-4xl">Sign in.</h2>
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
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && (
          <p className="text-[12px] font-semibold" style={{ color: "#b3261e" }} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="console-btn w-full" disabled={submitting} style={{ backgroundColor: "var(--v2-ink)" }}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <p className="mt-6 text-[13px]" style={{ color: "var(--v2-ink-soft)" }}>
        New operator?{" "}
        <Link to="/app/signup" className="font-semibold" style={{ color: "var(--v2-blue)" }}>
          Create an account
        </Link>
      </p>
      <p className="v2-mono mt-10 text-[10px] leading-4" style={{ color: "var(--v2-ink-faint)" }}>
        Institution access is resolved from your work email domain. SSO arrives
        with your institution's integration.
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
  const tenant = useMemo(() => resolveTenant(email.includes("@") ? email : null), [email]);

  if (!loading && user) return <Navigate to="/app" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.session) {
      navigate("/app", { replace: true });
    } else {
      // Email confirmation is enabled on the project — be explicit about it.
      setPendingConfirm(true);
    }
  };

  if (pendingConfirm) {
    return (
      <AuthShell>
        <h2 className="v2-display text-3xl">Confirm your email.</h2>
        <p className="v2-body mt-4 text-[15px]">
          We sent a confirmation link to <span className="font-semibold" style={{ color: "var(--v2-ink)" }}>{email}</span>.
          Open it, then sign in.
        </p>
        <Link to="/app/login" className="console-btn mt-8 w-full" style={{ backgroundColor: "var(--v2-ink)" }}>
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <img src={ventusLogo} alt="Ventus AI" className="mb-10 h-5 w-auto lg:hidden" />
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
