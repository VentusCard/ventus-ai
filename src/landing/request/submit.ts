import { z } from "zod";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { landingCopy } from "@/landing/copy";

export const RequestAccessSchema = z.object({
  name: z.string().trim().min(1, landingCopy.request.errors.name).max(120),
  workEmail: z.string().trim().email(landingCopy.request.errors.workEmail).max(200),
  institution: z.string().trim().min(1, landingCopy.request.errors.institution).max(200),
  role: z.string().trim().min(1, landingCopy.request.errors.role).max(160),
  decision: z.string().trim().max(1200).optional(),
  website: z.string().max(200).optional(),
});

export type RequestAccessInput = z.infer<typeof RequestAccessSchema>;

export async function submitAccessRequest(input: RequestAccessInput) {
  const parsed = RequestAccessSchema.parse(input);
  if (!isSupabaseConfigured) throw new Error("Request service unavailable");

  const { data, error } = await supabase.functions.invoke("request-access", {
    body: {
      ...parsed,
      source: typeof window === "undefined" ? "/" : window.location.pathname,
    },
  });

  if (error || (data && typeof data === "object" && "error" in data)) {
    throw new Error(error?.message ?? "Request failed");
  }

  return data;
}
