
# Fix Bright Text Colors in TePilot Flow

## Overview

After analyzing the TePilot components, I found that the current styling uses a **light theme** (white backgrounds with slate text colors) throughout the TePilot flow. The issue is that some text colors are too faint/bright against the light backgrounds, reducing legibility.

## Current State Analysis

The TePilot flow uses:
- **Light backgrounds**: `bg-white`, `bg-slate-50`
- **Text hierarchy**: `text-slate-900` (headings), `text-slate-600`/`text-slate-500` (body), `text-slate-400` (muted)

### Problem Areas Identified

| Component | Issue | Current Color | Fix |
|-----------|-------|---------------|-----|
| TePilot.tsx cover page | Release notes text too faint | `text-slate-500` | `text-slate-600` |
| TePilot.tsx cover page | Section descriptions faint | `text-slate-500` | `text-slate-600` |
| TePilot.tsx cover page | Feature card descriptions | `text-slate-600` | Already good |
| ResultsTable.tsx | Status message text | `text-slate-500` | `text-slate-600` |
| ResultsTable.tsx | Merchant subtext too light | `text-slate-500` | `text-slate-600` |
| OverviewMetrics.tsx | Metric labels/subtitles | `text-slate-500` | `text-slate-600` |
| PillarExplorer.tsx | Transaction details | `text-slate-500` | `text-slate-600` |
| PreviewTable.tsx | Description column text | `text-slate-500` | `text-slate-600` |
| TopPillarsAnalysis.tsx | Collapsed preview text | `text-slate-500` | `text-slate-600` |
| TravelTimeline.tsx | Trip metadata | `text-slate-500` | `text-slate-600` |
| BankwideView.tsx | Intro description | `text-slate-500` | `text-slate-600` |
| BankwideMetrics.tsx | Subtitles | `text-slate-500` | `text-slate-600` |

## Solution

Systematically update secondary/muted text from `text-slate-500` to `text-slate-600` across all TePilot components. This provides better contrast against white/light backgrounds while maintaining the visual hierarchy.

### Color Reference
- `text-slate-900`: Primary text (headings) - **keep**
- `text-slate-700`: Strong secondary - **use for important labels**
- `text-slate-600`: Body text - **use for descriptions** (darker than 500)
- `text-slate-500`: Currently used for muted - **too light, upgrade to 600**
- `text-slate-400`: Placeholder/disabled - **keep for truly muted content**

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/TePilot.tsx` | Update ~15 instances of `text-slate-500` to `text-slate-600` |
| `src/components/tepilot/ResultsTable.tsx` | Update 3 instances |
| `src/components/tepilot/PreviewTable.tsx` | Update 4 instances |
| `src/components/tepilot/insights/OverviewMetrics.tsx` | Update 2 instances |
| `src/components/tepilot/insights/PillarExplorer.tsx` | Update 4 instances |
| `src/components/tepilot/insights/TopPillarsAnalysis.tsx` | Update 5 instances |
| `src/components/tepilot/insights/TravelTimeline.tsx` | Update 5 instances |
| `src/components/tepilot/insights/BankwideView.tsx` | Update 1 instance |
| `src/components/tepilot/insights/BankwideMetrics.tsx` | Update 2 instances |
| `src/components/tepilot/insights/CardProductMatrix.tsx` | Update 2 instances |
| `src/components/tepilot/PersonaCard.tsx` | Update 1 instance |

## Implementation Approach

1. Replace `text-slate-500` with `text-slate-600` for all descriptive/body text
2. Keep `text-slate-500` only where text should be truly muted (e.g., timestamps, tertiary info)
3. Preserve `text-slate-900` for all headings and primary content
4. Keep `text-slate-400` for placeholder text and disabled states

## Result

Text throughout the TePilot flow will have improved contrast and legibility against light backgrounds, while maintaining the clean light-theme aesthetic and proper visual hierarchy.
