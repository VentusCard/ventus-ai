// The Growth Console shell: ink rail, tenant lockup, workspace. White-label
// means the institution's mark and accent own the chrome — Ventus recedes to
// a single line at the foot of the rail.

import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Activity, Layers, LineChart, Loader2, LogOut, Settings } from "lucide-react";
import { AuthProvider, ConsoleProvider, useAuth, useConsole } from "@/console/state";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "@/styles/v2-theme.css";
import "@/styles/console.css";

const NAV = [
  { to: "/app", label: "Moments", icon: Activity, end: true },
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
    <div className="console v2 flex min-h-svh pb-16 md:pb-0" style={{ ["--c-accent" as string]: tenant.accent, ["--c-accent-wash" as string]: tenant.accentWash }}>
      <aside className="console-rail hidden w-60 flex-none flex-col justify-between p-4 md:flex">
        <div>
          <div className="flex items-center gap-3 px-2 pb-6 pt-2">
            <TenantMark />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-white">{tenant.name}</p>
              <p className="v2-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-console-faint)" }}>
                {tenant.product}
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="console-rail-link" data-active={end ? location.pathname === to : location.pathname.startsWith(to)}>
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
        <div className="space-y-4 px-2">
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
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="md:hidden"><TenantMark size={28} /></span>
            <h1 className="truncate text-[15px] font-bold" style={{ color: "var(--v2-ink)" }}>{title}</h1>
          </div>
          <span className="v2-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--v2-ink-faint)" }}>
            <span className="hidden sm:inline">Pilot environment · </span>sandbox only
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="ml-3 text-slate-500 md:hidden"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t bg-white/95 px-2 backdrop-blur md:hidden"
        style={{ borderColor: "var(--v2-rule)" }}
        aria-label="Console navigation"
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold"
            style={({ isActive }) => ({ color: isActive ? tenant.accent : "var(--v2-ink-faint)" })}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
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
  if (loading) {
    return (
      <div className="v2 flex min-h-svh items-center justify-center" style={{ backgroundColor: "var(--v2-paper)" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--v2-ink-faint)" }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/app/login" replace />;
  return (
    <ConsoleProvider>
      <Shell />
    </ConsoleProvider>
  );
}
