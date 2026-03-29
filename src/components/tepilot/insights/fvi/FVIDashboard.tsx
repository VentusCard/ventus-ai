import { useState } from "react";
import { FVICohortOverview } from "./FVICohortOverview";
import { FVICohortDetail } from "./FVICohortDetail";
import { FVISettings } from "./FVISettings";
import { FVISensitivityMatrix } from "./FVISensitivityMatrix";

type FVIView = 'overview' | 'matrix' | 'detail' | 'settings';

export function FVIDashboard() {
  const [view, setView] = useState<FVIView>('overview');
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  const handleViewCohort = (cohortId: string) => {
    setSelectedCohortId(cohortId);
    setView('detail');
  };

  const handleBackToOverview = () => {
    setView('overview');
    setSelectedCohortId(null);
  };

  return (
    <div>
      {/* Sub-nav for Overview / Matrix / Settings */}
      {view !== 'detail' && (
        <div className="flex items-center gap-1 mb-5 border-b border-slate-200 pb-2">
          {[
            { key: 'overview' as const, label: 'Cohort Overview' },
            { key: 'matrix' as const, label: 'Risk Matrix' },
            { key: 'settings' as const, label: 'Configuration' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === tab.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {view === 'overview' && <FVICohortOverview onViewCohort={handleViewCohort} />}
      {view === 'matrix' && <FVISensitivityMatrix />}
      {view === 'detail' && selectedCohortId && (
        <FVICohortDetail cohortId={selectedCohortId} onBack={handleBackToOverview} />
      )}
      {view === 'settings' && <FVISettings />}
    </div>
  );
}
