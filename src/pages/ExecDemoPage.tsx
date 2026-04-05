import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ExecDemoLeftPanel from "@/components/exec-demo/ExecDemoLeftPanel";
import ExecDemoIntelPanel from "@/components/exec-demo/ExecDemoIntelPanel";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { getIntelligenceForCustomer, getCsvForCustomer, buildLocalProfile, mergeAiResults, csvToClassifyPayload, buildSignalMapFromClassified, type SignalEntry, type ExecPersona, type ExecIntelligence, type Transaction, type EnrichedTransaction } from "@/components/exec-demo/execDemoData";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import ContactFormDialog from "@/components/ContactFormDialog";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import { supabase } from "@/integrations/supabase/client";

type TabKey = "analytics" | "rewards" | "relationship";
type Phase = "idle" | "scroll" | "cardScan" | "cardCycle" | "hold";

const TAB_ORDER: TabKey[] = ["analytics", "rewards", "relationship"];

const TIMINGS = {
  scroll: 6000,
  personaPause: 1500,
  cardScan: 1320,
  collectInterval: 320,
  collectBuffer: 640,
  cardReveal: 1000,
  hold: 999999,
};

export default function ExecDemoPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [processedSignals, setProcessedSignals] = useState<SignalEntry[]>([]);
  const [revealedTabs, setRevealedTabs] = useState<TabKey[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [collectedIndices, setCollectedIndices] = useState<number[]>([]);
  const [currentCardColor, setCurrentCardColor] = useState("#60a5fa");
  const [contactOpen, setContactOpen] = useState(false);
  const [activePillFilter, setActivePillFilter] = useState<{ pillar: string; label: string } | null>(null);
  const [profile, setProfile] = useState<{ persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } | null>(null);
  const [customCsv, setCustomCsv] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const classifiedRef = useRef<EnrichedTransaction[] | null>(null);
  const classifyAbortRef = useRef<AbortController | null>(null);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /** Fire classify-transactions SSE in background, cache results */
  const fireClassification = useCallback((csv: string) => {
    // Abort any in-flight classification
    classifyAbortRef.current?.abort();
    classifiedRef.current = null;

    const abort = new AbortController();
    classifyAbortRef.current = abort;

    const payload = csvToClassifyPayload(csv);
    if (payload.length === 0) return;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/classify-transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      body: JSON.stringify({ transactions: payload }),
      signal: abort.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const block of events) {
            const eventMatch = block.match(/^event:\s*(.+)$/m);
            const dataMatch = block.match(/^data:\s*(.+)$/m);
            if (!eventMatch || !dataMatch) continue;

            if (eventMatch[1] === "done") {
              try {
                const parsed = JSON.parse(dataMatch[1]);
                classifiedRef.current = parsed.enriched_transactions || [];
                console.log(`[PRELOAD] Classification ready: ${classifiedRef.current?.length} transactions`);
              } catch (e) {
                console.error("[PRELOAD] Failed to parse done event", e);
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[PRELOAD] Classification failed:", err);
        }
      });
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const isRunning = phase !== "idle" && phase !== "hold";

  const handleSelectCustomer = useCallback(
    (idx: number) => {
      clearTimeouts();
      setSelectedIdx(idx);
      setPhase("idle");
      setProcessedSignals([]);
      setRevealedTabs([]);
      setActiveTab(null);
      setCollectedIndices([]);
      setProfile(null);
      setCustomCsv(null);
      setCustomName(null);
      // Preload classification in background
      fireClassification(getCsvForCustomer(idx));
    },
    [clearTimeouts, fireClassification]
  );

  const handleLoadCustomCsv = useCallback((csv: string, name: string) => {
    clearTimeouts();
    setCustomCsv(csv);
    setCustomName(name);
    setPhase("idle");
    setProcessedSignals([]);
    setRevealedTabs([]);
    setActiveTab(null);
    setCollectedIndices([]);
    setProfile(buildLocalProfile(csv, 0, name));
  }, [clearTimeouts]);

  const runAnimationWithProfile = useCallback((p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }) => {
    setPhase("scroll");
    setProcessedSignals([]);
    setRevealedTabs([]);
    setActiveTab(null);
    setCollectedIndices([]);

    const txCount = p.transactions.length;
    const signalInterval = TIMINGS.scroll / (txCount + 1);

    for (let i = 0; i < txCount; i++) {
      const signal = p.persona.signalMap[i];
      if (signal) {
        schedule(() => {
          setProcessedSignals((prev) => [...prev, signal]);
        }, (i + 1) * signalInterval);
      }
    }

    let elapsed = TIMINGS.scroll + TIMINGS.personaPause;

    TAB_ORDER.forEach((tabKey) => {
      const card = p.intelligence[tabKey];
      const cardElapsed = elapsed;
      const cardCollectDuration =
        card.txIndices.length * TIMINGS.collectInterval + TIMINGS.collectBuffer;

      schedule(() => {
        setPhase("cardScan");
        setCollectedIndices([]);
        setCurrentCardColor(card.accent);
        setActiveTab(tabKey);
      }, cardElapsed);

      const collectStart = cardElapsed + TIMINGS.cardScan;
      schedule(() => {
        setPhase("cardCycle");
      }, collectStart);

      card.txIndices.forEach((txIdx, j) => {
        schedule(() => {
          setCollectedIndices((prev) => [...prev, txIdx]);
        }, collectStart + (j + 1) * TIMINGS.collectInterval);
      });

      schedule(() => {
        setRevealedTabs((prev) => [...prev, tabKey]);
      }, collectStart + cardCollectDuration);

      elapsed += TIMINGS.cardScan + cardCollectDuration + TIMINGS.cardReveal;
    });

    schedule(() => {
      setPhase("hold");
      setActiveTab("analytics");
    }, elapsed);
  }, [schedule]);

  const handleRunAnalysis = useCallback(async () => {
    if (isRunning) return;
    clearTimeouts();

    const csv = customCsv || getCsvForCustomer(selectedIdx);

    // 1. Build local profile instantly from MCC map
    const localProfile = buildLocalProfile(csv, selectedIdx, customName || undefined);
    setProfile(localProfile);

    // 2. Start animation immediately — no waiting for AI
    runAnimationWithProfile(localProfile);

    // 3. Fire AI in background for richer pills, descriptions, intelligence
    try {
      const { data, error } = await supabase.functions.invoke("generate-exec-profile", {
        body: { csv },
      });

      if (error) throw error;

      // Merge AI results into the profile (keeps local signalMap, upgrades everything else)
      const merged = mergeAiResults(localProfile, data);
      setProfile(merged);
    } catch (err) {
      console.error("AI enrichment failed (local profile still active):", err);
    }
  }, [isRunning, clearTimeouts, selectedIdx, customCsv, customName, runAnimationWithProfile]);

  const handleTabClick = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  const handlePillClick = useCallback((pillar: string, label: string) => {
    setActivePillFilter((prev) =>
      prev && prev.pillar === pillar && prev.label === label ? null : { pillar, label }
    );
  }, []);

  const execProfile = profile || getIntelligenceForCustomer(selectedIdx);
  const demoCustomer = DEMO_CUSTOMERS[selectedIdx];

  // Derive filtered transaction indices from the active pill filter
  const filteredIndices = useMemo(() => {
    if (!activePillFilter) return null;
    const sm = execProfile.persona.signalMap;
    return Object.entries(sm)
      .filter(([, s]) => s.pillar === activePillFilter.pillar && s.label === activePillFilter.label)
      .map(([idx]) => Number(idx));
  }, [activePillFilter, execProfile.persona.signalMap]);

  return (
    <SimplePasswordGate>
    <div className="h-screen bg-slate-50 flex flex-col font-[Manrope,sans-serif] overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-bold text-slate-800 tracking-tight">
            Ventus AI
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Executive Demo · Personalization Engine
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setContactOpen(true)}
            className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Next Step →
          </button>
          <Link
            to="/"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main content — 3 columns */}
      <div className="flex-1 grid grid-cols-[320px_1fr_360px] min-h-0">
        {/* Col 1 — Customer selection + transaction feed */}
        <div className="border-r border-slate-200 bg-white overflow-hidden">
          <ExecDemoLeftPanel
            selectedIdx={selectedIdx}
            onSelectCustomer={handleSelectCustomer}
            onRunAnalysis={handleRunAnalysis}
            onLoadCustomCsv={handleLoadCustomCsv}
            isRunning={isRunning}
            phase={phase}
            collectedIndices={collectedIndices}
            currentCardColor={currentCardColor}
            isCustomMode={!!customCsv}
            customName={customName || undefined}
            customTransactions={profile?.transactions}
            personaIcon={execProfile.persona.icon}
            personaTitle={execProfile.persona.title}
            filteredIndices={filteredIndices}
            activePillLabel={activePillFilter?.label || null}
            onClearFilter={() => setActivePillFilter(null)}
          />
        </div>

        {/* Col 2 — Intelligence panel */}
        <div className="border-r border-slate-200 bg-white overflow-hidden">
          <ExecDemoIntelPanel
            persona={execProfile.persona}
            intelligence={execProfile.intelligence}
            phase={phase}
            processedSignals={processedSignals}
            revealedTabs={revealedTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            activePillFilter={activePillFilter}
            onPillClick={handlePillClick}
          />
        </div>

        {/* Col 3 — iPhone with /deckmo views */}
        <div className="bg-slate-50 overflow-hidden">
          <ExecDemoPhoneView
            customer={demoCustomer}
            activeTab={activeTab}
            phase={phase}
          />
        </div>
      </div>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
    </SimplePasswordGate>
  );
}
