import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ExecDemoLeftPanel from "@/components/exec-demo/ExecDemoLeftPanel";
import ExecDemoIntelPanel, { type PersonaSynthesis, type PillarRollup, getColor } from "@/components/exec-demo/ExecDemoIntelPanel";
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
  scroll: 9000,
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
  const [activeRollup, setActiveRollup] = useState<PillarRollup | null>(null);
  const [profile, setProfile] = useState<{ persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const profileRef = useRef<{ persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] } | null>(null);
  const [customCsv, setCustomCsv] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const classifiedRef = useRef<EnrichedTransaction[] | null>(null);
  const classifyAbortRef = useRef<AbortController | null>(null);
  const [personaSynthesis, setPersonaSynthesis] = useState<PersonaSynthesis | null>(null);
  
  const personaSynthesisRef = useRef<PersonaSynthesis | null>(null);
  const firePersonaSynthesisRef = useRef<(txs: EnrichedTransaction[]) => void>(() => {});

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /** Fire classify-transactions SSE in background, then synthesize persona */
  const fireClassification = useCallback((csv: string) => {
    classifyAbortRef.current?.abort();
    classifiedRef.current = null;
    personaSynthesisRef.current = null;
    setPersonaSynthesis(null);

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
                firePersonaSynthesisRef.current(classifiedRef.current!);
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

  /** Synthesize persona headline + insights from classified transactions */
  const firePersonaSynthesis = useCallback(async (enrichedTxs: EnrichedTransaction[]) => {
    // Group by pillar::category and collect merchants, tiers, subcategories
    const grouped = new Map<string, {
      pillar: string; label: string; count: number; totalSpend: number;
      frequency?: string; txIndices: number[];
      topMerchants: string[]; spendingTier: string; subcategories: string[];
    }>();
    for (const [txIdx, tx] of enrichedTxs.entries()) {
      const key = `${tx.pillar}::${tx.category}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalSpend += tx.amount;
        existing.txIndices.push(txIdx);
        if (tx.merchant_name && !existing.topMerchants.includes(tx.merchant_name))
          existing.topMerchants.push(tx.merchant_name);
        if (tx.subcategories) tx.subcategories.forEach(sc => {
          if (!existing.subcategories.includes(sc)) existing.subcategories.push(sc);
        });
        // Keep highest tier
        const tierRank: Record<string, number> = { "Budget": 0, "Standard": 1, "Premium": 2 };
        if ((tierRank[tx.spending_tier] ?? 1) > (tierRank[existing.spendingTier] ?? 1)) {
          existing.spendingTier = tx.spending_tier;
        }
      } else {
        grouped.set(key, {
          pillar: tx.pillar, label: tx.category, count: 1, totalSpend: tx.amount,
          frequency: tx.purchase_frequency, txIndices: [txIdx],
          topMerchants: tx.merchant_name ? [tx.merchant_name] : [],
          spendingTier: tx.spending_tier || "Standard",
          subcategories: tx.subcategories ? [...tx.subcategories] : [],
        });
      }
    }
    const pillars = Array.from(grouped.values()).sort((a, b) => b.totalSpend - a.totalSpend);
    // pillars[i].txIndices = the transaction indices for row i sent to AI

    try {
      const { data, error } = await supabase.functions.invoke("synthesize-persona", {
        body: { pillars },
      });
      if (error) throw error;
      const synthesis: PersonaSynthesis = {
        headline: data.headline || "Dynamic Persona",
        insights: data.insights || [],
        pillarRollups: (data.pillar_rollups || []).map((r: any) => {
          const catIndices: number[] = r.category_indices || [];
          // Resolve contributing groups via index + fallback category name matching
          const matchedGroupIndices = new Set<number>();
          for (const ci of catIndices) {
            if (ci >= 0 && ci < pillars.length) matchedGroupIndices.add(ci);
          }
          // Fallback: match by pillar + category name for any listed categories not yet matched
          if (r.categories) {
            for (const catName of r.categories) {
              const idx = pillars.findIndex(
                (p, i) => !matchedGroupIndices.has(i) && p.pillar === r.pillar && p.label.toLowerCase() === catName.toLowerCase()
              );
              if (idx >= 0) matchedGroupIndices.add(idx);
            }
          }
          // Deduplicate transaction indices
          const txIndicesSet = new Set<number>();
          for (const gi of matchedGroupIndices) {
            for (const ti of pillars[gi].txIndices) txIndicesSet.add(ti);
          }
          const txIndices = Array.from(txIndicesSet);
          const totalCount = txIndices.length;
          const totalSpend = Array.from(matchedGroupIndices).reduce((s, gi) => s + pillars[gi].totalSpend, 0);

          // Collect the resolved category labels for coherence validation
          const resolvedCategories = Array.from(matchedGroupIndices).map(gi => pillars[gi].label.toLowerCase());

          return {
            pillar: r.pillar,
            label: r.label,
            categories: r.categories || [],
            categoryIndices: Array.from(matchedGroupIndices),
            txIndices,
            totalCount,
            totalSpend,
            _resolvedCategories: resolvedCategories,
          };
        })
        .filter((r: any) => r.totalCount > 0)
        .filter((r: any) => {
          // Client-side coherence validation: reject nonsensical rollups
          const label = (r.label as string).toLowerCase();
          const cats = r._resolvedCategories as string[];

          // Rule 1: Reject rollups with only 1 matched category (not a real grouping)
          if (r.categoryIndices.length < 2) {
            console.log(`[ROLLUP-REJECT] "${r.label}" — only 1 category, not a real grouping`);
            return false;
          }

          // Rule 2: Reject life-stage labels without enough corroborating evidence
          const lifeStageKeywords = ["nursery", "nesting", "new parent", "baby", "suburban", "family setup", "expecting"];
          const isLifeStageLabel = lifeStageKeywords.some(kw => label.includes(kw));
          if (isLifeStageLabel) {
            const familyKeywords = ["baby", "kids", "child", "nursery", "pediatr", "daycare", "maternity", "infant", "toddler"];
            const familyCatCount = cats.filter(c => familyKeywords.some(fk => c.includes(fk))).length;
            if (familyCatCount < 2) {
              console.log(`[ROLLUP-REJECT] "${r.label}" — life-stage label with only ${familyCatCount} family categories`);
              return false;
            }
          }

          // Rule 3: Reject rollups that mix incompatible themes
          const incompatiblePairs: [string[], string[]][] = [
            [["gas", "fuel", "commut", "auto", "car wash"], ["nursery", "baby", "kids", "child", "toy"]],
            [["gas", "fuel", "commut", "auto"], ["streaming", "subscription", "netflix", "hulu", "spotify"]],
            [["grocery", "supermarket", "food"], ["streaming", "subscription", "software"]],
          ];
          for (const [groupA, groupB] of incompatiblePairs) {
            const hasA = cats.some(c => groupA.some(kw => c.includes(kw)));
            const hasB = cats.some(c => groupB.some(kw => c.includes(kw)));
            if (hasA && hasB) {
              console.log(`[ROLLUP-REJECT] "${r.label}" — incompatible themes detected`);
              return false;
            }
          }

          return true;
        })
        .map(({ _resolvedCategories, ...rest }: any) => rest),
      };
      personaSynthesisRef.current = synthesis;
      setPersonaSynthesis(synthesis);
      console.log("[PRELOAD] Persona synthesis ready:", synthesis.headline);
    } catch (err) {
      console.error("[PRELOAD] Persona synthesis failed:", err);
    }
  }, []);
  firePersonaSynthesisRef.current = firePersonaSynthesis;

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  // Fire classification for initial customer on mount
  useEffect(() => {
    fireClassification(getCsvForCustomer(0));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      setActivePillFilter(null);
      setActiveRollup(null);
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
    setActivePillFilter(null);
    setActiveRollup(null);
    setProfile(buildLocalProfile(csv, 0, name));
    // Preload classification for custom CSV
    fireClassification(csv);
  }, [clearTimeouts, fireClassification]);

  const revealStep = useCallback((idx: number, p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }, skipHighlight = false) => {
    const tabKey = TAB_ORDER[idx];
    const card = p.intelligence[tabKey];
    setActiveTab(tabKey);
    setCurrentCardColor(card.accent);
    if (!skipHighlight) {
      setCollectedIndices(card.txIndices);
    }
    setRevealedTabs(TAB_ORDER.slice(0, idx + 1));
    setStepIndex(idx);
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "hold") return;
      const p = profileRef.current;
      if (!p) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setStepIndex((prev) => {
          const next = Math.min(prev + 1, TAB_ORDER.length - 1);
          revealStep(next, p);
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStepIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          revealStep(next, p);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, revealStep]);

  const runAnimationWithProfile = useCallback((p: { persona: ExecPersona; intelligence: ExecIntelligence; transactions: Transaction[] }) => {
    setPhase("scroll");
    setProcessedSignals([]);
    setRevealedTabs([]);
    setActiveTab(null);
    setCollectedIndices([]);
    profileRef.current = p;

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

    const elapsed = TIMINGS.scroll + TIMINGS.personaPause;

    schedule(() => {
      setPhase("hold");
      revealStep(0, p, true);
    }, elapsed);
  }, [schedule, revealStep]);

  const handleRunAnalysis = useCallback(async () => {
    if (isRunning) return;
    clearTimeouts();

    const csv = customCsv || getCsvForCustomer(selectedIdx);

    // 1. Build local profile — use AI-classified signals if preloaded, else MCC fallback
    const localProfile = buildLocalProfile(csv, selectedIdx, customName || undefined);

    if (classifiedRef.current && classifiedRef.current.length > 0) {
      // Override MCC signal map with AI-classified pillars
      const classifiedSignalMap = buildSignalMapFromClassified(classifiedRef.current);
      localProfile.persona.signalMap = classifiedSignalMap;
      console.log("[PROCESS] Using preloaded AI classification for signals");
    } else {
      console.log("[PROCESS] AI classification not ready, using MCC fallback");
    }

    setProfile(localProfile);

    // 2. Start animation immediately
    runAnimationWithProfile(localProfile);

    // 3. Fire AI in background for richer pills, descriptions, intelligence
    try {
      const { data, error } = await supabase.functions.invoke("generate-exec-profile", {
        body: { csv },
      });

      if (error) throw error;

      // Merge AI results into the profile (keeps signalMap, upgrades everything else)
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
    setActiveRollup(null);
    setActivePillFilter((prev) =>
      prev && prev.pillar === pillar && prev.label === label ? null : { pillar, label }
    );
  }, []);

  const handleRollupClick = useCallback((rollup: PillarRollup) => {
    setActivePillFilter(null);
    setActiveRollup((prev) =>
      prev && prev.pillar === rollup.pillar && prev.label === rollup.label ? null : rollup
    );
  }, []);

  const execProfile = profile || getIntelligenceForCustomer(selectedIdx);
  const demoCustomer = DEMO_CUSTOMERS[selectedIdx];

  // Derive filtered transaction indices from the active pill/rollup filter
  const filteredIndices = useMemo(() => {
    const sm = execProfile.persona.signalMap;
    if (activeRollup) {
      // Use txIndices if available, otherwise fall back to pillar-level matching
      if (activeRollup.txIndices && activeRollup.txIndices.length > 0) {
        return activeRollup.txIndices;
      }
      return Object.entries(sm)
        .filter(([, s]) => s.pillar === activeRollup.pillar)
        .map(([idx]) => Number(idx));
    }
    if (activePillFilter) {
      return Object.entries(sm)
        .filter(([, s]) => s.pillar === activePillFilter.pillar && s.label === activePillFilter.label)
        .map(([idx]) => Number(idx));
    }
    return null;
  }, [activePillFilter, activeRollup, execProfile.persona.signalMap]);

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
      <div className="flex-1 min-h-0 grid grid-cols-[400px_1fr_360px]">
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
            signalMap={execProfile.persona.signalMap}
            activePillLabel={activeRollup?.label || activePillFilter?.label || null}
            activePillColor={
              activeRollup
                ? getColor(activeRollup.pillar).dot
                : activePillFilter
                  ? getColor(activePillFilter.pillar).dot
                  : "#10b981"
            }
            onClearFilter={() => { setActivePillFilter(null); setActiveRollup(null); }}
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
            activePillarFilter={activeRollup?.pillar || null}
            activeRollup={activeRollup}
            onRollupClick={handleRollupClick}
            personaSynthesis={personaSynthesis}
          />
        </div>

        {/* Col 3 — iPhone with /deckmo views */}
        <div className="bg-slate-50 overflow-hidden">
          <ExecDemoPhoneView
            customer={demoCustomer}
            activeTab={activeTab}
            phase={phase}
            showContent={false}
          />
        </div>
      </div>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
    </SimplePasswordGate>
  );
}
