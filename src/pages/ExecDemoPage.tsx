import { useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import ExecDemoLeftPanel from "@/components/exec-demo/ExecDemoLeftPanel";
import ExecDemoIntelPanel from "@/components/exec-demo/ExecDemoIntelPanel";
import ExecDemoPhoneView from "@/components/exec-demo/ExecDemoPhoneView";
import { getIntelligenceForCustomer, type SignalEntry } from "@/components/exec-demo/execDemoData";
import { DEMO_CUSTOMERS } from "@/lib/demoData";
import ContactFormDialog from "@/components/ContactFormDialog";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";

type TabKey = "analytics" | "rewards" | "relationship";
type Phase = "idle" | "scroll" | "cardScan" | "cardCycle" | "hold";

const TAB_ORDER: TabKey[] = ["analytics", "rewards", "relationship"];

const TIMINGS = {
  scroll: 6000,
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
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
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
    },
    [clearTimeouts]
  );

  const handleRunAnalysis = useCallback(() => {
    if (isRunning) return;
    clearTimeouts();
    setPhase("scroll");
    setProcessedSignals([]);
    setRevealedTabs([]);
    setActiveTab(null);
    setCollectedIndices([]);

    const execProfile = getIntelligenceForCustomer(selectedIdx);
    const txCount = execProfile.transactions.length;
    const signalInterval = TIMINGS.scroll / (txCount + 1);

    // During scroll phase, append signals one by one as transactions process
    for (let i = 0; i < txCount; i++) {
      const signal = execProfile.persona.signalMap[i];
      if (signal) {
        schedule(() => {
          setProcessedSignals((prev) => [...prev, signal]);
        }, (i + 1) * signalInterval);
      }
    }

    let elapsed = TIMINGS.scroll;

    TAB_ORDER.forEach((tabKey) => {
      const card = execProfile.intelligence[tabKey];
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
  }, [isRunning, clearTimeouts, schedule, selectedIdx]);

  const handleTabClick = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  const execProfile = getIntelligenceForCustomer(selectedIdx);
  const demoCustomer = DEMO_CUSTOMERS[selectedIdx];

  return (
    <SimplePasswordGate>
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Manrope,sans-serif]">
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
            isRunning={isRunning}
            phase={phase}
            collectedIndices={collectedIndices}
            currentCardColor={currentCardColor}
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
