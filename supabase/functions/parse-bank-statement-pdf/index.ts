import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import PDFParser from "npm:pdf-parse@1.1.1";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://ventuscard.com",
  "https://ventusai.com",
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^http:\/\/localhost:\d+$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((allowed) => (typeof allowed === "string" ? allowed === origin : allowed.test(origin)));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();

    // Input validation
    if (!fileData || typeof fileData !== "string") {
      return new Response(JSON.stringify({ error: "Invalid file data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check file size (base64 string length, rough estimate: 5MB = ~6.7M chars)
    if (fileData.length > 7000000) {
      return new Response(JSON.stringify({ error: "File too large (max 5MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing PDF: ${fileName}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract text from PDF
    console.log("Extracting text from PDF...");
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, "");
    const pdfBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const pdfData = await PDFParser(pdfBuffer);
    const extractedText = pdfData.text;

    console.log(`Extracted ${extractedText.length} characters from PDF`);

    // Validate that we got meaningful text
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error(
        "Could not extract text from PDF. The file may be password-protected, corrupted, or an image-based scan. Please try a text-based PDF.",
      );
    }

    // Call Lovable AI with the extracted text
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a bank statement parser. Extract transactions from bank statements. IGNORE payment transactions (like 'PAYMENT - THANK YOU', autopay to credit card). Include purchases (positive amounts) and refunds/credits (negative amounts).",
          },
          {
            role: "user",
            content: `Extract transactions from this bank statement:\n\n${extractedText}\n\nFor each transaction:\n- SKIP payment transactions to the credit card account\n- Purchases/debits: positive amounts\n- Refunds/credits: negative amounts\n- Identify: merchant name, transaction date, amount, description, and MCC code if visible.\n\nReturn the data in the exact format specified by the tool.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_transactions",
              description: "Extract transaction data from a bank statement",
              parameters: {
                type: "object",
                properties: {
                  transactions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        merchant_name: {
                          type: "string",
                          description: "The merchant or payee name",
                        },
                        date: {
                          type: "string",
                          description: "Transaction date in ISO format (YYYY-MM-DD)",
                        },
                        amount: {
                          type: "number",
                          description:
                            "Transaction amount: positive for purchases/debits, negative for refunds/credits",
                        },
                        description: {
                          type: "string",
                          description: "Optional transaction description or memo",
                        },
                        mcc: {
                          type: "string",
                          description: "Optional MCC (Merchant Category Code) if visible",
                        },
                      },
                      required: ["merchant_name", "date", "amount"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["transactions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_transactions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    // Extract transactions from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const transactions = JSON.parse(toolCall.function.arguments).transactions;

    // Filter out payment transactions but keep refunds/credits
    const filteredTransactions = transactions.filter((txn: any) => {
      const merchantLower = txn.merchant_name.toLowerCase();
      const descLower = (txn.description || "").toLowerCase();

      // Remove only payment transactions (not refunds/credits)
      const isPayment =
        (merchantLower.includes("payment") && merchantLower.includes("thank you")) || merchantLower.includes("autopay");

      return !isPayment;
    });

    console.log(
      `Extracted ${filteredTransactions.length} transactions from PDF (filtered ${transactions.length - filteredTransactions.length} payments)`,
    );

    // Add transaction IDs and ensure correct signs
    const enrichedTransactions = filteredTransactions.map((txn: any, index: number) => ({
      transaction_id: `pdf_${Date.now()}_${index}`,
      merchant_name: txn.merchant_name,
      description: txn.description || undefined,
      mcc: txn.mcc || undefined,
      amount: txn.amount > 0 ? txn.amount : txn.amount, // Keep positive for purchases, negative for refunds
      date: txn.date,
      zip_code: undefined,
      home_zip: undefined,
    }));

    return new Response(JSON.stringify({ transactions: enrichedTransactions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to parse PDF",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
