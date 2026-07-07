import { useState, useEffect, type ReactNode } from "react";
import { Settings, X, ChevronDown } from "lucide-react";
import ventusLogo from "@/assets/ventus-ai-wordmark.png";
import { getDemoBankConfig, setDemoBankConfig, type DemoBankConfig } from "@/lib/demoBankConfig";
import { cn } from "@/lib/utils";

const CORRECT_PASSWORD = "ventus2026";
const SESSION_KEY = "demo_password_access";

interface Props {
  children: ReactNode;
  bullets?: string[];
  tagline?: string;
}

export default function SimplePasswordGate({ children, bullets, tagline }: Props) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Settings dialog state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [settingsPwd, setSettingsPwd] = useState("");
  const [settingsErr, setSettingsErr] = useState(false);
  const [cfg, setCfg] = useState<DemoBankConfig>({ mode: "generic" });
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setCfg(getDemoBankConfig());
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("from") === "demo") {
        sessionStorage.setItem(SESSION_KEY, "true");
        setAuthed(true);
        params.delete("from");
        const qs = params.toString();
        window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
      }
    } catch {}
  }, []);

  const activeCfg = getDemoBankConfig();

  if (authed) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthed(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-white px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Gear in top-right */}
      <button
        onClick={() => { setSettingsOpen(true); setSettingsUnlocked(false); setSettingsPwd(""); setSettingsErr(false); }}
        className="absolute top-5 right-5 w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 flex items-center justify-center transition-colors"
        aria-label="Customization settings"
        title="Customization settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
        <div className="flex flex-col items-center gap-4">
          <img src={ventusLogo} alt="Ventus AI" className="h-16 md:h-20 w-auto" />
          {tagline && (
            <p className="text-[22px] md:text-[26px] font-semibold text-slate-600 tracking-tight text-center">
              {tagline}
            </p>
          )}
        </div>
        {bullets && bullets.length === 3 && (
          <div className="grid grid-cols-3 items-center gap-x-6 whitespace-nowrap w-full">
            <div className="flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[13px] md:text-[14px] font-medium text-slate-600 tracking-tight">{bullets[0]}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[13px] md:text-[14px] font-medium text-slate-600 tracking-tight">{bullets[1]}</span>
            </div>
            <div className="flex items-center gap-2 justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[13px] md:text-[14px] font-medium text-slate-600 tracking-tight">{bullets[2]}</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {[
              {
                title: "Problem",
                text: "Every banking experience feels generic because banks never really see the whole customer. What data they do have arrives as cryptic, messy transaction strings, so there's no real understanding of the person behind the account, and no way to personalize anything. The cost is everywhere: card spend stays low, offers go unredeemed, share of wallet shrinks, and customers drift to the next bank who offers incentives.",
              },
              {
                title: "Team",
                text: "Four builders with backgrounds from Visa, McKinsey, AWS, and Credit Suisse, advised by the former CEO of Citibank N.A. We've sat on both sides of the table: payments, strategy, cloud engineering, and banking.",
              },
              {
                title: "Vision",
                text: "Banking is personal. Behind every transaction is a life: a growing family, a first home, a hard month. We envision a banking system that sees the person, not just the account, and empowers every institution to deliver the right resources, at the right moment, with the right message.",
              },
            ].map((section) => {
              const isExpanded = expandedSection === section.title;
              return (
                <div
                  key={section.title}
                  onClick={() => setExpandedSection(isExpanded ? null : section.title)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setExpandedSection(isExpanded ? null : section.title);
                    }
                  }}
                  className={cn(
                    "border rounded-xl bg-white h-11 flex items-center justify-center px-4 cursor-pointer select-none transition-colors duration-300",
                    isExpanded ? "border-blue-400" : "border-slate-200"
                  )}
                >
                  <span className="text-sm font-semibold text-slate-800 tracking-tight">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-transform duration-300 ml-2",
                      isExpanded ? "rotate-180" : "hidden"
                    )}
                  />
                </div>
              );
            })}
          </div>

          <div
            className={cn(
              "border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-500 ease-in-out px-4",
              expandedSection ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0"
            )}
          >
            <p className="text-sm text-slate-600 leading-relaxed">
              {[
                {
                  title: "Problem",
                  text: "Every banking experience feels generic because banks never really see the whole customer. What data they do have arrives as cryptic, messy transaction strings, so there's no real understanding of the person behind the account, and no way to personalize anything. The cost is everywhere: card spend stays low, offers go unredeemed, share of wallet shrinks, and customers drift to the next bank who offers incentives.",
                },
                {
                  title: "Team",
                  text: "Four builders with backgrounds from Visa, McKinsey, AWS, and Credit Suisse, advised by the former CEO of Citibank N.A. We've sat on both sides of the table: payments, strategy, cloud engineering, and banking.",
                },
                {
                  title: "Vision",
                  text: "Banking is personal. Behind every transaction is a life: a growing family, a first home, a hard month. We envision a banking system that sees the person, not just the account, and empowers every institution to deliver the right resources, at the right moment, with the right message.",
                },
              ].find((s) => s.title === expandedSection)?.text}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-72">
          <input
            type="password"
            autoFocus
            placeholder="Enter password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
          {error && <p className="text-xs text-red-500 -mt-2">Incorrect password</p>}
          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Enter Demo
          </button>
        </form>
      </div>

      <SettingsLauncher
        open={settingsOpen}
        setOpen={setSettingsOpen}
        unlocked={settingsUnlocked}
        setUnlocked={setSettingsUnlocked}
        pwd={settingsPwd}
        setPwd={setSettingsPwd}
        err={settingsErr}
        setErr={setSettingsErr}
        cfg={cfg}
        setCfg={setCfg}
        savedFlash={savedFlash}
        setSavedFlash={setSavedFlash}
      />
    </div>
  );
}

interface LauncherProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  unlocked: boolean;
  setUnlocked: (b: boolean) => void;
  pwd: string;
  setPwd: (s: string) => void;
  err: boolean;
  setErr: (b: boolean) => void;
  cfg: DemoBankConfig;
  setCfg: (c: DemoBankConfig) => void;
  savedFlash: boolean;
  setSavedFlash: (b: boolean) => void;
  floating?: boolean;
}

function SettingsLauncher({
  open, setOpen, unlocked, setUnlocked,
  pwd, setPwd, err, setErr, cfg, setCfg,
  savedFlash, setSavedFlash, floating,
}: LauncherProps) {
  const close = () => { setOpen(false); setUnlocked(false); setPwd(""); setErr(false); };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === CORRECT_PASSWORD) {
      setUnlocked(true);
      setErr(false);
    } else {
      setErr(true);
    }
  };

  const handleSave = () => {
    if (cfg.mode === "custom" && !(cfg.bankName || "").trim()) {
      setErr(true);
      return;
    }
    setDemoBankConfig(cfg);
    setSavedFlash(true);
    setTimeout(() => { setSavedFlash(false); close(); }, 700);
  };

  return (
    <>
      {floating && !open && (
        <button
          onClick={() => { setOpen(true); setUnlocked(false); setPwd(""); setErr(false); setCfg(getDemoBankConfig()); }}
          className="fixed bottom-4 left-4 z-[60] w-9 h-9 rounded-full border border-slate-200 bg-white/90 backdrop-blur text-slate-400 hover:text-slate-700 hover:border-slate-300 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Customization settings"
          title="Customization settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4"
          style={{ fontFamily: "Manrope, sans-serif" }}
          onClick={close}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Demo customization</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tailor generated copy to a specific bank. Persists across sessions.
            </p>

            {!unlocked ? (
              <form onSubmit={handleUnlock} className="mt-5 space-y-3">
                <label className="block text-xs font-medium text-slate-600">Enter passcode</label>
                <input
                  type="password"
                  autoFocus
                  value={pwd}
                  onChange={(e) => { setPwd(e.target.value); setErr(false); }}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  placeholder="Passcode"
                />
                {err && <p className="text-xs text-red-500">Incorrect passcode</p>}
                <button
                  type="submit"
                  className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Unlock
                </button>
              </form>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50/40">
                    <input
                      type="radio"
                      name="cfg-mode"
                      checked={cfg.mode === "generic"}
                      onChange={() => setCfg({ mode: "generic" })}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">Generic (no customization)</div>
                      <div className="text-xs text-slate-500">Default copy referencing "your bank".</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50/40">
                    <input
                      type="radio"
                      name="cfg-mode"
                      checked={cfg.mode === "custom"}
                      onChange={() => setCfg({ mode: "custom", bankName: cfg.bankName || "", bankShortName: cfg.bankShortName })}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">Custom bank</div>
                      <div className="text-xs text-slate-500">Reference a specific institution by name.</div>
                    </div>
                  </label>
                </div>

                {cfg.mode === "custom" && (
                  <div className="space-y-3 pl-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Bank name</label>
                      <input
                        type="text"
                        autoFocus
                        value={cfg.bankName || ""}
                        onChange={(e) => { setCfg({ ...cfg, bankName: e.target.value }); setErr(false); }}
                        placeholder="e.g. First National Bank"
                        maxLength={80}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Shorthand <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        value={cfg.bankShortName || ""}
                        onChange={(e) => setCfg({ ...cfg, bankShortName: e.target.value })}
                        placeholder="e.g. FNB"
                        maxLength={40}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Website <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input
                        type="url"
                        inputMode="url"
                        value={cfg.website || ""}
                        onChange={(e) => setCfg({ ...cfg, website: e.target.value })}
                        placeholder="e.g. firstnational.com"
                        maxLength={200}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                      />
                    </div>
                    {err && <p className="text-xs text-red-500">Bank name is required.</p>}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={close}
                    className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    {savedFlash ? "Saved ✓" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
