export function timelineRevealState(active: boolean, step: number) {
  return { animateMarkers: active && step === 0, showActivations: active && step === 1 };
}

export function timelineMonthDelay(month: number) {
  return 300 + month * 180;
}