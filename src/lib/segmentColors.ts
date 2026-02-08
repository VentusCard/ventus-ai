/**
 * Shared segment color definitions for client segments (Preferred, Private, Premium).
 * This provides a single source of truth for consistent badge styling across the Advisor Console.
 */

export const SEGMENT_COLORS: Record<string, string> = {
  Preferred: 'bg-blue-100 text-blue-800 border-blue-200',
  Private: 'bg-purple-100 text-purple-800 border-purple-200',
  Premium: 'bg-amber-100 text-amber-800 border-amber-200',
};

/**
 * Get the Tailwind CSS classes for a given client segment.
 * Falls back to neutral slate colors if segment is not recognized.
 */
export function getSegmentColorClasses(segment: string): string {
  return SEGMENT_COLORS[segment] || 'bg-slate-100 text-slate-800 border-slate-200';
}
