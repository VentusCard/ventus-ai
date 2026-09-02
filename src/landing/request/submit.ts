// Real implementation for Workstream W5 — inserts into public.access_requests
// via the Supabase client (src/integrations/supabase/client.ts), against the
// table added in supabase/migrations/20260901000000_...access_requests.sql.
// Export shape below is the contract RequestAccessModal.tsx is written against.
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export interface AccessRequestPayload {
  name: string;
  email: string;
  institution: string;
  role: string;
  decision?: string;
}

// isSupabaseConfigured is checked explicitly because the app falls back to a
// placeholder Supabase client (pointed at a local, non-existent project) when
// env vars are absent — that client must never silently "succeed" a real
// user's access request.
export async function submitAccessRequest(payload: AccessRequestPayload): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured in this environment.");
  }

  const { error } = await supabase.from("access_requests").insert({
    name: payload.name,
    email: payload.email,
    institution: payload.institution,
    role: payload.role,
    decision_focus: payload.decision || null,
    source_path: typeof window !== "undefined" ? window.location.pathname : "/",
  });

  if (error) throw error;
}
