import { useState } from "react";
import { Sparkles, CornerDownLeft } from "lucide-react";
import { GOAL_SUGGESTIONS, matchGoal, type GoalMatch } from "@/lib/campaignGoalMatcher";

interface Props {
  onMatch: (match: GoalMatch, goal: string) => void;
  lastExplanation?: string | null;
}

export function GoalIntentBar({ onMatch, lastExplanation }: Props) {
  const [value, setValue] = useState("");
  const [noMatch, setNoMatch] = useState(false);

  const run = (goal: string) => {
    const match = matchGoal(goal);
    if (!match) {
      setNoMatch(true);
      return;
    }
    setNoMatch(false);
    onMatch(match, goal);
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
        <p className="text-xs font-semibold text-slate-900">Describe the outcome you want</p>
        <span className="text-[10px] text-slate-500">Ventus sets up the campaign — you edit every block</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setNoMatch(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") run(value);
            }}
            placeholder="e.g. grow deposits from customers who just received a windfall"
            className="w-full h-9 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <CornerDownLeft className="w-3.5 h-3.5 text-slate-300 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="button"
          onClick={() => run(value)}
          disabled={value.trim().length < 4}
          className="h-9 px-3.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          Set up campaign
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {GOAL_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setValue(s);
              run(s);
            }}
            className="px-2 py-1 rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {noMatch && (
        <p className="mt-2 text-[11px] text-amber-700">
          Couldn't map that to a product or signal. Try naming a product, a life event, or a spending behavior.
        </p>
      )}
      {!noMatch && lastExplanation && (
        <p className="mt-2 text-[11px] text-blue-800 bg-blue-50 border border-blue-100 rounded-md px-2 py-1.5">
          {lastExplanation}
        </p>
      )}
    </div>
  );
}
