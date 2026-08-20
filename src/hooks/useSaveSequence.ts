import { useCallback, useEffect, useRef, useState } from "react";

export type SaveSequenceStatus = "idle" | "running" | "done";

/** Stage presets — keep wording consistent across the workspace. */
export const SIGNAL_STAGES = [
  "Applying signal…",
  "Recomputing audience…",
  "Syncing to activation destinations…",
];

export const PLAYBOOK_STAGES = [
  "Validating guardrails…",
  "Updating coworker playbook…",
  "Syncing to every team…",
];

export const CONTENT_STAGES = [
  "Applying edit…",
  "Regenerating preview…",
  "Syncing to activation destinations…",
];

const STAGE_MS = 700;
const DONE_HOLD_MS = 900;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface Options {
  /** Stage lines shown while the save "processes". */
  stages?: string[];
  /** Label shown once the sequence settles. */
  doneLabel?: string;
}

/**
 * Plays a short AI-style processing sequence when an edit is saved.
 * The commit callback fires immediately so state stays correct; the
 * animation is purely presentational on top of it.
 */
export function useSaveSequence(options: Options = {}) {
  const { stages = CONTENT_STAGES, doneLabel = "Synced" } = options;
  const [status, setStatus] = useState<SaveSequenceStatus>("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const run = useCallback(
    (commit?: () => void) => {
      clearTimers();
      commit?.();

      if (prefersReducedMotion()) {
        setStatus("done");
        setStageIndex(stages.length - 1);
        timers.current.push(window.setTimeout(() => setStatus("idle"), DONE_HOLD_MS));
        return;
      }

      setStatus("running");
      setStageIndex(0);

      stages.forEach((_, i) => {
        if (i === 0) return;
        timers.current.push(window.setTimeout(() => setStageIndex(i), i * STAGE_MS));
      });

      const total = stages.length * STAGE_MS;
      timers.current.push(window.setTimeout(() => setStatus("done"), total));
      timers.current.push(window.setTimeout(() => setStatus("idle"), total + DONE_HOLD_MS));
    },
    [clearTimers, stages],
  );

  const elapsedLabel = `${((stages.length * STAGE_MS) / 1000).toFixed(1)}s`;

  return {
    status,
    isRunning: status === "running",
    isBusy: status !== "idle",
    stageLabel: status === "done" ? `${doneLabel} · ${elapsedLabel}` : stages[stageIndex],
    run,
  };
}
