// The Growth Console shell: ink rail, tenant lockup, workspace. White-label
// means the institution's mark and accent own the chrome — Ventus recedes to
// a single line at the foot of the rail.

import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Activity, Layers, LineChart, ListChecks, Loader2, LogOut, Settings } from "lucide-react";
import { AuthProvider, ConsoleProvider, useAuth, useConsole } from "@/console/state";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";
import "@/styles/console.css";

const NAV = [
  { to: "/app", label: "Moments", icon: Activity, end: true },
  { to: "/app/plays", label: "Growth Plays", icon: ListChecks, end: false },
  { to: "/app/ledger", label: "Ledger", icon: Layers, end: false },
  { to: "/app/outcomes", label: "Outcomes", icon: LineChart, end: false },
  { to: "/app/settings", label: "Settings", icon: Settings, end: false },
];

function TenantMark({ size = 32 }: { size?: number }) {
  const { tenant } = useConsole();
  return (
    <span
      className="relative flex flex-none items-center justify-center overflow-hidden rounded-md font-black text-white"
      style={{ width: size, height: size, backgroundColor: tenant.mark.bg, fontSize: size * 0.44 }}
    >
      {tenant.mark.letter}
      {tenant.mark.flag && (
        <span
          className="absolute top-0 rotate-[24deg]"
          style={{ right: -1, width: size * 0.18, height: size, backgroundColor: "#E31837" }}
        />
      )}
    </span>
  );
}

function Shell() {
  const { user, signOut } = useAuth();
  const { tenant, connectorSession, ledger, moments } = useConsole();
  const location = useLocation();
  const live = connectorSession && connectorSession.expiresAt * 1000 > Date.now();
  const queued = moments.filter((moment) => moment.status === "queued").length;
  const title = NAV.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label ?? "Console";

  return (
    <div className="console v2 flex min-h-svh flex-col md:flex-row" style={{ ["--c-accent" as string]: tenant.accent, ["--c-accent-wash" as string]: tenant.accentWash }}>
      <aside className="console-rail flex w-full flex-none flex-col justify-between p-3 md:w-60 md:p-4">
        <div>
          <div className="flex items-center gap-3 px-2 pb-3 pt-1 md:pb-6 md:pt-2">
            <TenantMark />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-white">{tenant.name}</p>
              <p className="v2-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-console-faint)" }}>
                {tenant.product}
              </p>
            </div>
          </div>
          <nav className="console-mobile-nav flex gap-1 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="console-rail-link flex-none" data-active={end ? location.pathname === to : location.pathname.startsWith(to)}>
                <Icon className="h-4 w-4 flex-none" />
                <span className="flex-1">{label}</span>
                {label === "Moments" && queued > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: tenant.accent }}>
                    {queued}
                  </span>
                )}
                {label === "Ledger" && ledger.length > 0 && (
                  <span className="v2-mono text-[10px]" style={{ color: "var(--v2-console-faint)" }}>{ledger.length}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden space-y-4 px-2 md:block">
          <div className="flex items-center gap-2">
            <span className="console-dot" style={{ backgroundColor: live ? "#34D399" : "#545d6b" }} />
            <span className="v2-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-console-soft)" }}>
              {live ? "Sandbox connected" : "Sandbox staged"}
            </span>
          </div>
          <div className="border-t pt-4" style={{ borderColor: "var(--v2-console-line)" }}>
            <p className="truncate text-[11px] font-semibold text-white/80">{user?.email}</p>
            <button onClick={() => void signOut()} className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-white/50 transition hover:text-white">
              <LogOut className="h-3 w-3" /> Sign out
            </button>
            <p className="v2-mono mt-4 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-console-faint)" }}>
              powered by <img src={ventusLogo} alt="Ventus AI" className="h-2.5 w-auto brightness-0 invert opacity-60" />
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 flex-none items-center justify-between border-b bg-white/70 px-4 backdrop-blur md:px-6" style={{ borderColor: "var(--v2-rule)" }}>
          <h1 className="text-[15px] font-bold" style={{ color: "var(--v2-ink)" }}>{title}</h1>
          <span className="v2-mono hidden text-[9px] uppercase tracking-[0.14em] sm:block" style={{ color: "var(--v2-ink-faint)" }}>
            Pilot environment · sandbox data only
          </span>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// One AuthProvider wraps the whole /app subtree — sign-in pages included —
// so auth state survives navigation between public and protected console routes.
export function ConsoleAuthBoundary() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// Route element for the authenticated portion of /app.
export default function ConsoleLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const localPreview = import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "true";
  if (loading) {
    return (
      <div className="v2 flex min-h-svh items-center justify-center" style={{ backgroundColor: "var(--v2-paper)" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--v2-ink-faint)" }} />
      </div>
    );
  }
  if (!user && !localPreview) return <Navigate to="/app/login" replace />;
  return (
    <ConsoleProvider>
      <Shell />
    </ConsoleProvider>
  );
}
