import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { EnrichedTransaction } from "@/types/transaction";
import Papa from "papaparse";

interface ExportControlsProps {
  transactions: EnrichedTransaction[];
}

export function ExportControls({ transactions }: ExportControlsProps) {
  const exportAsCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventus_enriched_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventus_enriched_transactions_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportAsCSV} disabled={transactions.length === 0} className="border-slate-300 text-slate-700 hover:bg-slate-100">
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportAsJSON} disabled={transactions.length === 0} className="border-slate-300 text-slate-700 hover:bg-slate-100">
        <FileJson className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
    </div>
  );
}
