import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ColumnMapperProps {
  detectedColumns: string[];
  suggestedMapping: Record<string, string | null>;
  onConfirm: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

export function ColumnMapper({
  detectedColumns,
  suggestedMapping,
  onConfirm,
  onCancel
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(suggestedMapping).filter(([_, v]) => v !== null) as [string, string][]
    )
  );

  const requiredFields = ["merchant_name", "date", "amount"];
  const optionalFields = ["description", "mcc", "transaction_id"];

  const handleMappingChange = (standardField: string, selectedColumn: string) => {
    if (selectedColumn === "none") {
      const newMapping = { ...mapping };
      delete newMapping[standardField];
      setMapping(newMapping);
    } else {
      setMapping({ ...mapping, [standardField]: selectedColumn });
    }
  };

  const getMappedColumns = () => Object.values(mapping);
  const getUnmappedColumns = () => detectedColumns.filter(col => !getMappedColumns().includes(col));

  const isValid = requiredFields.every(field => mapping[field]);

  const getFieldStatus = (field: string) => {
    if (mapping[field]) return "mapped";
    if (requiredFields.includes(field)) return "required";
    return "optional";
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          )}
          Map Your Columns
        </CardTitle>
        <CardDescription className="text-slate-600">
          We detected {detectedColumns.length} columns. Map them to the required fields below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
            Required Fields
            <Badge variant="destructive" className="text-xs">Must have</Badge>
          </h3>
          {requiredFields.map((field) => (
            <div key={field} className="flex items-center gap-3">
              <div className="w-32 text-sm font-medium capitalize text-slate-900">
                {field.replace(/_/g, " ")}
              </div>
              <Select
                value={mapping[field] || "none"}
                onValueChange={(val) => handleMappingChange(field, val)}
              >
                <SelectTrigger className={`flex-1 bg-white border-slate-300 text-slate-900 ${!mapping[field] ? "border-red-400" : ""}`}>
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="none">-- None --</SelectItem>
                  {detectedColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldStatus(field) === "mapped" && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Optional Fields */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
            Optional Fields
            <Badge variant="secondary" className="text-xs">Recommended</Badge>
          </h3>
          {optionalFields.map((field) => (
            <div key={field} className="flex items-center gap-3">
              <div className="w-32 text-sm font-medium capitalize text-slate-900">
                {field.replace(/_/g, " ")}
              </div>
              <Select
                value={mapping[field] || "none"}
                onValueChange={(val) => handleMappingChange(field, val)}
              >
                <SelectTrigger className="flex-1 bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="none">-- None --</SelectItem>
                  {detectedColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldStatus(field) === "mapped" && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Unmapped Columns Warning */}
        {getUnmappedColumns().length > 0 && (
          <div className="bg-slate-100 p-3 rounded-md">
            <p className="text-xs text-slate-500 mb-2">
              These columns will be ignored:
            </p>
            <div className="flex flex-wrap gap-1">
              {getUnmappedColumns().map((col) => (
                <Badge key={col} variant="outline" className="text-xs border-slate-300 text-slate-600">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => onConfirm(mapping)}
            disabled={!isValid}
            className="flex-1"
          >
            {isValid ? "Confirm Mapping" : "Map Required Fields"}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
