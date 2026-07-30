import { lazy, Suspense } from "react";
import { ArrowRight, Check, Clock3, Loader2, LogOut } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/console/state";
import { entryPathForAccess } from "@/console/access";
import type { LeadershipPath } from "@/lib/leadership";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";
import "@/styles/console.css";

const EnterpriseGrowthDemoPage = lazy(() => import("@/pages/EnterpriseGrowthDemoPage"));

function AccessLoading() {
  return (
    <div className="v2 flex min-h-svh items-center justify-center" style={{ backgroundColor: "var(--v2-paper)" }}>
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--v2-ink-faint)" }} />
    </div>
  );
}

export function AppEntryPage() {
  const { user, loading, access, accessLoading, accessError } = useAuth();
  if (loading || accessLoading) return <AccessLoading />;
  if (!user) return <Navigate to="/app/login" replace />;
  if (accessError || !access || access.status !== "active") {
    return <Navigate to="/app/access-pending" replace />;
  }
  return <Navigate to={entryPathForAccess(access)} replace />;
}

export function ProtectedDemoPage() {
  const { user, session, loading, access, accessLoading } = useAuth();
  if (loading || accessLoading) return <AccessLoading />;
  if (!user) return <Navigate to="/app/login" replace />;
  if (!access || access.status !== "active") return <Navigate to="/app/access-pending" replace />;

  const allowedPaths: LeadershipPath[] = [];
  if (access.entitlements.includes("consumer_demo")) allowedPaths.push("deposit-retention");
  if (access.entitlements.includes("wealth_demo")) allowedPaths.push("wealth-growth");
  if (allowedPaths.length === 0) return <Navigate to="/app/access-pending" replace />;

  return (
    <Suspense fallback={<AccessLoading />}>
      <EnterpriseGrowthDemoPage
        audience="leadership"
        allowedPaths={allowedPaths}
        authenticated
        accessToken={session?.access_token}
        sessionScope={user.id}
      />
    </Suspense>
  );
}

export function AccessPendingPage() {
  const { user, access, accessError, accessLoading, refreshAccess, signOut } = useAuth();
  if (!user) return <Navigate to="/app/login" replace />;
  if (access?.status === "active") return <Navigate to="/app" replace />;

  return (
    <div className="v2 flex min-h-svh items-center justify-center px-6 py-12" style={{ backgroundColor: "var(--v2-paper)" }}>
      <div className="w-full max-w-lg">
        <img src={ventusLogo} alt="Ventus AI" className="h-5 w-auto" />
        <div className="mt-10 border-y py-10" style={{ borderColor: "var(--v2-rule)" }}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: "var(--v2-amber-wash)", color: "var(--v2-amber)" }}>
            <Clock3 className="h-5 w-5" />
          </span>
          <p className="v2-mono mt-6 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--v2-ink-faint)" }}>
            Identity verified
          </p>
          <h1 className="v2-display mt-3 text-4xl">Workspace access is pending.</h1>
          <p className="v2-body mt-4 max-w-md text-[15px]">
            {user.email} is signed in. A Ventus administrator still needs to assign an institution, role, and permitted product paths.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => void refreshAccess()} disabled={accessLoading} className="console-btn">
              {accessLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Check access
            </button>
            <button type="button" onClick={() => void signOut()} className="console-btn-ghost">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
          {accessError && (
            <p className="mt-4 text-[12px] font-semibold" style={{ color: "var(--v2-amber)" }}>
              {accessError}
            </p>
          )}
        </div>
        <p className="v2-mono mt-6 text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>
          Authentication confirms identity · authorization determines access
        </p>
        <Link to="/v2" className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--v2-blue)" }}>
          Return to ventusai.com <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
