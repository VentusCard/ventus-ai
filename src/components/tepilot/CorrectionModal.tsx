import { useState } from "react";
import { EnrichedTransaction } from "@/types/transaction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LIFESTYLE_PILLARS } from "@/lib/sampleData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CorrectionModalProps {
  transaction: EnrichedTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: (correctedPillar: string, correctedSubcategory: string, reason: string) => void;
}

export function CorrectionModal({ transaction, isOpen, onClose, onSave }: CorrectionModalProps) {
  const [correctedPillar, setCorrectedPillar] = useState(transaction.pillar);
  const [correctedSubcategory, setCorrectedSubcategory] = useState(transaction.subcategory);
  const [reason, setReason] = useState("");

  const handleSave = () => {
    if (correctedPillar === transaction.pillar && correctedSubcategory === transaction.subcategory) {
      alert("Please make changes before saving");
      return;
    }

    onSave(correctedPillar, correctedSubcategory, reason);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Correct Classification</DialogTitle>
          <DialogDescription className="text-slate-500">
            Update the lifestyle pillar and subcategory for this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-slate-50 border-slate-200">
            <AlertCircle className="h-4 w-4 text-slate-600" />
            <AlertDescription className="text-slate-700">
              <strong>Current:</strong> {transaction.pillar} → {transaction.subcategory}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label className="text-slate-700">Merchant</Label>
            <p className="text-sm font-medium text-slate-900">{transaction.normalized_merchant}</p>
            <p className="text-xs text-slate-500">
              ${transaction.amount.toFixed(2)} on {transaction.date}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pillar" className="text-slate-700">Correct Pillar</Label>
            <Select value={correctedPillar} onValueChange={setCorrectedPillar}>
              <SelectTrigger id="pillar" className="bg-white border-slate-300 text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {LIFESTYLE_PILLARS.map((pillar) => (
                  <SelectItem key={pillar} value={pillar}>
                    {pillar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory" className="text-slate-700">Correct Subcategory</Label>
            <input
              id="subcategory"
              type="text"
              value={correctedSubcategory}
              onChange={(e) => setCorrectedSubcategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="e.g., Coffee Shop, Gym Membership"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-700">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this correction needed?"
              className="min-h-[80px] bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-300 text-slate-700 hover:bg-slate-100">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Correction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
