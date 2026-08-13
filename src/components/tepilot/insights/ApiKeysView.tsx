import { useState } from "react";
import { KeyRound, Plus, RotateCcw, Ban, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_KEYS, API_SCOPES, type ApiKeyRecord } from "@/lib/apiUsageData";
import { useToast } from "@/hooks/use-toast";

export function ApiKeysView() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(API_KEYS);
  const { toast } = useToast();

  const revoke = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked", lastUsed: "Revoked just now" } : k)));
    toast({ title: "Key revoked", description: "Integrations using this key will receive 401 responses." });
  };

  const rotate = (label: string) => {
    toast({ title: "Rotation scheduled", description: `${label} will rotate with a 24-hour overlap window.` });
  };

  const create = () => {
    toast({ title: "New key request", description: "Key creation requires a workspace admin approval step." });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">API keys & access</h3>
            <p className="text-[11px] text-slate-500">Create, scope, rotate, and revoke keys for each integration.</p>
          </div>
        </div>
        <button
          onClick={create}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create API key
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wide">
                <th className="text-left font-semibold px-4 py-2">Key</th>
                <th className="text-left font-semibold px-4 py-2">Environment</th>
                <th className="text-left font-semibold px-4 py-2">Scopes</th>
                <th className="text-left font-semibold px-4 py-2">Assigned to</th>
                <th className="text-left font-semibold px-4 py-2">Last used</th>
                <th className="text-right font-semibold px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-900">{k.label}</div>
                    <div className="font-mono text-[11px] text-slate-500">{k.maskedKey}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                        k.environment === "Production"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-50 text-slate-600 border-slate-200",
                      )}
                    >
                      {k.environment}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span key={s} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{k.owner}</td>
                  <td className="px-4 py-2.5 text-slate-500">{k.lastUsed}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {k.status === "active" ? (
                        <>
                          <button
                            onClick={() => rotate(k.label)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                          >
                            <RotateCcw className="w-3 h-3" /> Rotate
                          </button>
                          <button
                            onClick={() => revoke(k.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50"
                          >
                            <Ban className="w-3 h-3" /> Revoke
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">Revoked</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Available scopes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {API_SCOPES.map((s) => (
            <div key={s.scope} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
              <span className="font-mono text-[11px] text-slate-800 shrink-0">{s.scope}</span>
              <span className="text-[11px] text-slate-500">{s.description}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Usage, latency, and rate-limit reporting for these keys lives in Intelligence Database → API.
        </p>
      </div>
    </div>
  );
}
