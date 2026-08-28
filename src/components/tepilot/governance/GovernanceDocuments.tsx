import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEED_DOCUMENTS, type GovernanceDocument } from "./personalizationLevels";

export function GovernanceDocuments() {
  const [docs, setDocs] = useState<GovernanceDocument[]>(SEED_DOCUMENTS);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const now = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const added: GovernanceDocument[] = Array.from(files).map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      type: "Uploaded",
      uploadedBy: "You",
      uploadedAt: now,
      status: "Under review",
      influences: "Pending policy extraction",
    }));
    setDocs((prev) => [...added, ...prev]);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-[13px] font-semibold text-slate-900">Documents & guidelines</h3>
      <p className="text-[11.5px] text-slate-500 mb-3">
        Compliance, brand, and regulatory documents Ventus reads to constrain generated copy and
        targeting.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-md border border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-blue-400 bg-blue-50/60" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50",
        )}
      >
        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
        <div className="text-[12.5px] text-slate-700 font-medium">
          Drop policy documents here, or click to browse
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          PDF, DOCX, or Markdown · applied after compliance review
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-[10.5px] uppercase tracking-wider text-slate-400">
              <th className="px-3 py-2 font-medium">Document</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Influences</th>
              <th className="px-3 py-2 font-medium">Uploaded</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-slate-200 align-top">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-800">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[220px]">{d.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-[12px] text-slate-600">{d.type}</td>
                <td className="px-3 py-2 text-[11.5px] text-slate-500">{d.influences}</td>
                <td className="px-3 py-2 text-[11.5px] text-slate-500">
                  {d.uploadedAt}
                  <div className="text-[11px] text-slate-400">{d.uploadedBy}</div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap",
                      d.status === "Applied"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    )}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    aria-label={`Remove ${d.name}`}
                    onClick={() => setDocs((prev) => prev.filter((x) => x.id !== d.id))}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
