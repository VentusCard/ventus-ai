// Session-scoped pre-warm cache for Ventus AI answers.
// The Intelligence Database quietly asks its own priority questions in the
// background so clicking a priority renders an answer instantly.

import { supabase } from "@/integrations/supabase/client";

type Entry = { status: "pending" | "ready" | "failed"; answer?: string };

const cache = new Map<string, Entry>();
let running = false;
const queue: Array<{ prompt: string; context: unknown }> = [];

export function getPrewarmedAnswer(prompt: string): string | undefined {
  const entry = cache.get(prompt.trim());
  return entry?.status === "ready" ? entry.answer : undefined;
}

async function drain() {
  if (running) return;
  running = true;
  try {
    while (queue.length) {
      const job = queue.shift()!;
      try {
        const { data, error } = await supabase.functions.invoke("bankwide-chat", {
          body: { message: job.prompt, conversationHistory: [], context: job.context },
        });
        if (error || !data?.message) {
          cache.set(job.prompt, { status: "failed" });
        } else {
          cache.set(job.prompt, { status: "ready", answer: data.message as string });
        }
      } catch {
        // Pre-warm is best-effort — the live request path still works.
        cache.set(job.prompt, { status: "failed" });
      }
    }
  } finally {
    running = false;
  }
}

/**
 * Fire background requests for the given prompts, one at a time.
 * Prompts already cached (or in flight, or previously failed) are skipped.
 */
export function prewarmPrompts(prompts: string[], context: unknown) {
  prompts
    .map((p) => p.trim())
    .filter((p) => p && !cache.has(p))
    .forEach((prompt) => {
      cache.set(prompt, { status: "pending" });
      queue.push({ prompt, context });
    });
  void drain();
}
