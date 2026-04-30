import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PricingModule } from "@/lib/pricingCatalog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: PricingModule[];
  updateModule: (id: string, patch: Partial<PricingModule>) => void;
  resetToDefaults: () => void;
}

export default function AdminFeeEditorDialog({
  open,
  onOpenChange,
  catalog,
  updateModule,
  resetToDefaults,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit module pricing</DialogTitle>
          <p className="text-xs text-slate-500">
            Changes are saved locally to this browser. Use "Reset" to restore defaults.
          </p>
        </DialogHeader>

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
                      className="h-8 text-sm"
                    />
                    <Input
                      value={m.description}
                      onChange={(e) => updateModule(m.id, { description: e.target.value })}
                      className="h-7 mt-1 text-xs text-slate-500"
                    />
                  </td>
                  <td className="py-2 pr-2 align-top">
                    <Input
                      type="number"
                      value={m.fixedFee}
                      onChange={(e) => updateModule(m.id, { fixedFee: Number(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 pr-2 align-top">
                    <Input
                      type="number"
                      step="0.01"
                      value={m.perUserFee}
                      onChange={(e) => updateModule(m.id, { perUserFee: Number(e.target.value) || 0 })}
                      className="h-8 text-sm"
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
            className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
