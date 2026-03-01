import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Transaction } from "@/types/transaction";
import { detectColumns, applyColumnMapping } from "./columnDetection";

// Column mapping result type
export interface MappingResult {
  needsMapping: boolean;
  headers?: string[];
  rows?: any[];
  suggestedMapping?: Record<string, string | null>;
  transactions?: Transaction[];
}

// Multi-file parser with progress tracking
export async function parseMultipleFiles(
  files: File[], 
  homeZip?: string,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<MappingResult> {
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  // If single file, just use regular parser
  if (files.length === 1) {
    return parseFile(files[0], homeZip);
  }

  const allTransactions: Transaction[] = [];
  const errors: string[] = [];
  let needsMappingFile: { file: File; result: MappingResult } | null = null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      onProgress?.(i + 1, files.length, file.name);
      
      const result = await parseFile(file, homeZip);
      
      if (result.needsMapping) {
        // Store the first file that needs mapping
        if (!needsMappingFile) {
          needsMappingFile = { file, result };
        }
        continue;
      }

      if (result.transactions) {
        // Add source file metadata to transactions
        const transactionsWithSource = result.transactions.map((t, idx) => ({
          ...t,
          transaction_id: `${file.name}_${t.transaction_id || idx}`,
        }));
        allTransactions.push(...transactionsWithSource);
      }
    } catch (error: any) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }

  // If any file needs mapping, return the first one
  if (needsMappingFile) {
    return {
      ...needsMappingFile.result,
      // Add note about pending files
      headers: needsMappingFile.result.headers,
      rows: needsMappingFile.result.rows,
      suggestedMapping: needsMappingFile.result.suggestedMapping
    };
  }

  // Show errors if any
  if (errors.length > 0) {
    console.warn("Some files failed to parse:", errors);
  }

  if (allTransactions.length === 0) {
    throw new Error(`Failed to parse any transactions. Errors: ${errors.join("; ")}`);
  }

  return {
    needsMapping: false,
    transactions: allTransactions
  };
}

// Main parser dispatcher
export async function parseFile(file: File, homeZip?: string): Promise<MappingResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "csv":
      return parseCSV(file, homeZip);
    case "json":
      return parseJSON(file, homeZip);
    case "xlsx":
    case "xls":
      return parseXLSX(file, homeZip);
    case "pdf":
      return parsePDF(file, homeZip);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

// CSV Parser using Papa Parse
export async function parseCSV(file: File, homeZip?: string): Promise<MappingResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const result = mapColumns(results.meta.fields || [], results.data, homeZip);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

// JSON Parser
export async function parseJSON(file: File, homeZip?: string): Promise<MappingResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
          reject(new Error("JSON must be an array of transactions"));
          return;
        }

        const headers = Object.keys(data[0] || {});
        const result = mapColumns(headers, data, homeZip);
        resolve(result);
      } catch (error) {
        reject(new Error(`JSON parsing failed: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// XLSX Parser using SheetJS
export async function parseXLSX(file: File, homeZip?: string): Promise<MappingResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          reject(new Error("XLSX file must have headers and at least one row"));
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });

        const result = mapColumns(headers, rows, homeZip);
        resolve(result);
      } catch (error) {
        reject(new Error(`XLSX parsing failed: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// PDF Parser using AI
export async function parsePDF(file: File, homeZip?: string): Promise<MappingResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        const dataUri = `data:application/pdf;base64,${base64}`;

        // Call the edge function to parse PDF
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const response = await fetch(
          `${supabaseUrl}/functions/v1/parse-bank-statement-pdf`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              fileData: dataUri,
              fileName: file.name,
              homeZip: homeZip
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to parse PDF');
        }

        const { transactions } = await response.json();
        
        if (!transactions || transactions.length === 0) {
          throw new Error("No transactions found in PDF");
        }

        console.log(`Successfully parsed ${transactions.length} transactions from PDF`);
        
        resolve({
          needsMapping: false,
          transactions
        });
      } catch (error) {
        reject(new Error(`PDF parsing failed: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// Parse markdown table format
function parseMarkdownTable(lines: string[], startLine: number, homeZip?: string): MappingResult {
  // Extract header row
  const headerLine = lines[startLine].trim();
  let headers = headerLine
    .split("|")
    .map(h => h.trim())
    .filter(h => h); // Remove empty strings from leading/trailing pipes
  
  // Find separator row (contains -- or ===)
  let dataStartLine = startLine + 1;
  while (dataStartLine < lines.length) {
    const line = lines[dataStartLine].trim();
    if (line.includes("--") || line.includes("===")) {
      dataStartLine++; // Skip separator row
      break;
    }
    dataStartLine++;
  }
  
  // Auto-detect and remove index column (# column or numeric-only first column)
  const firstColName = headers[0].toLowerCase();
  const shouldRemoveFirstCol = firstColName === "#" || 
                                 firstColName === "id" || 
                                 firstColName === "index" ||
                                 firstColName === "no" ||
                                 firstColName === "number";
  
  if (shouldRemoveFirstCol) {
    headers = headers.slice(1); // Remove first column from headers
  }
  
  // Parse data rows
  const rows = lines.slice(dataStartLine).map(line => {
    let values = line
      .trim()
      .split("|")
      .map(v => v.trim())
      .filter((v, i, arr) => {
        // Remove empty strings from leading/trailing pipes
        return !(i === 0 && v === "") && !(i === arr.length - 1 && v === "");
      });
    
    // Remove first column data if we detected an index column
    if (shouldRemoveFirstCol && values.length > headers.length) {
      values = values.slice(1);
    }
    
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });
    
    if (homeZip) {
      obj._homeZip = homeZip;
    }
    
    return obj;
  }).filter(row => {
    // Filter out empty rows or separator rows that might have been missed
    const hasData = Object.values(row).some(v => v && !String(v).includes("--"));
    return hasData;
  });
  
  return mapColumns(headers, rows, homeZip);
}

// Paste Text Parser
export function parsePastedText(text: string): MappingResult {
  const lines = text.trim().split("\n").filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error("Pasted text must have headers and at least one row");
  }

  // Extract home ZIP code from comment line if present
  let homeZip: string | undefined;
  let startLine = 0;
  
  if (lines[0].startsWith("#") || lines[0].startsWith("//")) {
    const zipMatch = lines[0].match(/(?:Home\s+)?ZIP\s*(?:Code)?:\s*(\d{5}|N\/A)/i);
    if (zipMatch) {
      // Only set homeZip if it's a valid 5-digit code, not "N/A"
      homeZip = zipMatch[1] !== "N/A" && /^\d{5}$/.test(zipMatch[1]) ? zipMatch[1] : undefined;
    }
    startLine = 1;
  }

  // DETECT FORMAT TYPE
  const firstDataLine = lines[startLine];
  
  // Check if it's a markdown table (contains pipes)
  if (firstDataLine.includes("|")) {
    return parseMarkdownTable(lines, startLine, homeZip);
  }
  
  // Otherwise use existing CSV/TSV logic
  const delimiter = firstDataLine.includes("\t") ? "\t" : ",";
  const headers = firstDataLine.split(delimiter).map(h => h.trim());
  
  const rows = lines.slice(startLine + 1).map(line => {
    const values = line.split(delimiter).map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });
    // Add home ZIP to each row for reference
    if (homeZip) {
      obj._homeZip = homeZip;
    }
    return obj;
  });

  return mapColumns(headers, rows, homeZip);
}

// Column mapping (handles flexible headers with smart detection)
export function mapColumns(headers: string[], rows: any[], homeZip?: string): MappingResult {
  const { mapping, confidence } = detectColumns(headers);
  
  // Check if we need user intervention
  const requiredFields = ["merchant_name", "date", "amount"];
  const missingRequired = requiredFields.filter(field => !mapping[field]);
  
  if (missingRequired.length > 0) {
    // Need user to map columns
    return {
      needsMapping: true,
      headers,
      rows,
      suggestedMapping: mapping
    };
  }
  
  // Auto-mapping succeeded - create reverse map (standardField -> originalColumn)
  const headerMap: Record<string, string> = {};
  Object.entries(mapping).forEach(([standardField, columnName]) => {
    if (columnName) {
      headerMap[columnName] = standardField;
    }
  });

  const transactions: Transaction[] = [];

  rows.forEach((row, index) => {
    const transaction = validateTransaction(row, headerMap, index, homeZip);
    if (transaction) {
      transactions.push(transaction);
    }
  });

  if (transactions.length === 0) {
    throw new Error("No valid transactions found in the data.");
  }

  return { needsMapping: false, transactions };
}

// Process with user-confirmed mapping
export function mapColumnsWithMapping(
  headers: string[], 
  rows: any[], 
  userMapping: Record<string, string>
): Transaction[] {
  // Create reverse map (originalColumn -> standardField)
  const headerMap: Record<string, string> = {};
  Object.entries(userMapping).forEach(([standardField, columnName]) => {
    headerMap[columnName] = standardField;
  });

  const transactions: Transaction[] = [];

  rows.forEach((row, index) => {
    const transaction = validateTransaction(row, headerMap, index);
    if (transaction) {
      transactions.push(transaction);
    }
  });

  if (transactions.length === 0) {
    throw new Error("No valid transactions found in the data.");
  }

  return transactions;
}

// Validation
function validateTransaction(row: any, headerMap: Record<string, string>, index: number, homeZip?: string): Transaction | null {
  try {
    // Extract fields using header map
    let merchant_name = "";
    let description = "";
    let mcc = "";
    let amount = 0;
    let date = "";
    let transaction_id = "";
    let zip_code = "";
    let source = "";

    Object.entries(headerMap).forEach(([originalHeader, standardField]) => {
      const value = row[originalHeader];
      
      switch (standardField) {
        case "merchant_name":
          merchant_name = String(value || "").trim();
          break;
        case "description":
          description = String(value || "").trim();
          break;
        case "mcc":
          mcc = String(value || "").trim();
          break;
        case "amount":
          amount = parseFloat(String(value || "0").replace(/[$,]/g, ""));
          break;
        case "date":
          date = String(value || "").trim();
          break;
        case "transaction_id":
          transaction_id = String(value || "").trim();
          break;
        case "zip_code":
          zip_code = String(value || "").trim();
          break;
        case "source":
          source = String(value || "").trim();
          break;
      }
    });

    // Required fields validation
    if (!merchant_name || !date) {
      console.warn(`Row ${index + 1}: Missing required fields (merchant_name or date)`);
      return null;
    }

    if (isNaN(amount)) {
      console.warn(`Row ${index + 1}: Invalid amount`);
      return null;
    }

    // Auto-generate transaction_id if missing
    if (!transaction_id) {
      transaction_id = `txn_${Date.now()}_${index}`;
    }

    // Parse and validate date
    const parsedDate = parseDate(date);
    if (!parsedDate) {
      console.warn(`Row ${index + 1}: Invalid date format`);
      return null;
    }

    // Use home ZIP from row metadata if not passed as parameter
    const finalHomeZip = homeZip || row._homeZip;

    return {
      transaction_id,
      merchant_name,
      description: description || undefined,
      mcc: mcc || undefined,
      amount,
      date: parsedDate,
      zip_code: zip_code || undefined,
      home_zip: finalHomeZip || undefined,
      source: source || undefined,
    };
  } catch (error) {
    console.warn(`Row ${index + 1}: Validation failed - ${error.message}`);
    return null;
  }
}

// Flexible date parser
function parseDate(dateStr: string): string | null {
  try {
    // Try various date formats
    const formats = [
      // ISO format
      /^\d{4}-\d{2}-\d{2}$/,
      // US format
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/,
      // European format
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/,
    ];

    if (formats[0].test(dateStr)) {
      // Already ISO format
      return dateStr;
    }

    // Try to parse and convert to ISO
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    return null;
  } catch {
    return null;
  }
}
