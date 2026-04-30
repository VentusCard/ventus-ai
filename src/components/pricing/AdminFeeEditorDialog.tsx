import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PricingModule, PilotConfig } from "@/lib/pricingCatalog";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "ventus2026";
const ADMIN_SESSION_KEY = "pricing_admin_access";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: PricingModule[];
  updateModule: (id: string, patch: Partial<PricingModule>) => void;
  resetToDefaults: () => void;
  pilot: PilotConfig;
  updatePilot: (patch: Partial<PilotConfig>) => void;
}

export default function AdminFeeEditorDialog({
  open,
  onOpenChange,
  catalog,
  updateModule,
  resetToDefaults,
  pilot,
  updatePilot,
}: Props) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) {
      setPw("");
      setError(false);
    }
  }, [open]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white">
        {!unlocked ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <Lock className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 w-4 h-4" /> Admin access
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Enter the admin password to edit module pricing.
              </p>
            </DialogHeader>
            <form onSubmit={handleUnlock} className="space-y-3 py-2">
              <Input
                type="password"
                autoFocus
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError(false);
                }}
                placeholder="Admin password"
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-10"
              />
              {error && <p className="text-xs text-red-500">Incorrect password</p>}
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-9 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
                >
                  Unlock
                </button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-slate-900">Edit module pricing</DialogTitle>
              <p className="text-xs text-slate-500">
                Changes are saved locally to this browser. Use "Reset" to restore defaults.
              </p>
            </DialogHeader>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 mb-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Pilot package
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Customers</label>
                  <Input
                    type="number"
                    min={0}
                    value={pilot.customers}
                    onChange={(e) =>
                      updatePilot({ customers: Number(e.target.value) || 0 })
                    }
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Flat fee / yr ($)</label>
                  <Input
                    type="number"
                    min={0}
                    value={pilot.flatFee}
                    onChange={(e) =>
                      updatePilot({ flatFee: Number(e.target.value) || 0 })
                    }
                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-slate-400">
                  <tr className="text-left">
                    <th className="py-2 font-semibold">Module</th>
                    <th className="py-2 font-semibold w-32">Fixed / yr ($)</th>
                    <th className="py-2 font-semibold w-32">Per user / yr ($)</th>
                    <th className="py-2 font-semibold w-20 text-center">Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((m) => (
                    <tr key={m.id} className="border-t border-slate-100">
                      <td className="py-2 pr-2">
                        <Input
                          value={m.name}
                          onChange={(e) => updateModule(m.id, { name: e.target.value })}
                          className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-8 text-sm"
                        />
                        <Input
                          value={m.description}
                          onChange={(e) => updateModule(m.id, { description: e.target.value })}
                          className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-7 mt-1 text-xs text-slate-500"
                        />
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <Input
                          type="number"
                          value={m.fixedFee}
                          onChange={(e) =>
                            updateModule(m.id, { fixedFee: Number(e.target.value) || 0 })
                          }
                          className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-8 text-sm"
                        />
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <Input
                          type="number"
                          step="0.01"
                          value={m.perUserFee}
                          onChange={(e) =>
                            updateModule(m.id, { perUserFee: Number(e.target.value) || 0 })
                          }
                          className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-8 text-sm"
                        />
                      </td>
                      <td className="py-2 text-center align-top">
                        <Switch
                          checked={m.enabled}
                          onCheckedChange={(v) => updateModule(m.id, { enabled: v })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <button
                onClick={resetToDefaults}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Reset to defaults
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
              >
                Done
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
