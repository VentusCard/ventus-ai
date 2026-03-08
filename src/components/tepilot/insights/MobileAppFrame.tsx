import { ReactNode } from "react";

interface MobileAppFrameProps {
  children: ReactNode;
}

export function MobileAppFrame({ children }: MobileAppFrameProps) {
  return (
    <div className="flex items-start justify-center">
      <div className="relative w-[375px] h-[780px] rounded-[2.5rem] border-[6px] border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-slate-800 rounded-b-2xl z-10" />

        {/* Status bar */}
        <div className="h-12 bg-slate-900 flex items-end justify-between px-8 pb-1 text-white text-[10px] font-medium shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 border border-white rounded-sm relative">
              <div className="absolute inset-[1px] right-[2px] bg-green-400 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* App header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shrink-0">
          <p className="text-[11px] opacity-70">Welcome back, Sarah</p>
          <p className="text-sm font-semibold">Your Lifestyle Dashboard</p>
        </div>

        {/* Scrollable content — scale down desktop components to fit phone width */}
        <div className="flex-1 overflow-hidden relative shrink-0">
          <div
            className="overflow-y-auto absolute inset-0"
            style={{
              /* Render at 600px wide then scale to ~363px (phone inner width) → 0.605 scale */
              width: "600px",
              transform: "scale(0.605)",
              transformOrigin: "top left",
              /* Increase logical height to compensate for scale so scrolling works */
              height: `${780 / 0.605}px`,
            }}
          >
            <div className="px-3 py-3">
              {children}
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="h-6 bg-white flex items-center justify-center shrink-0">
          <div className="w-[100px] h-[4px] bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
