
# Fix Life Event Planner Dialog Colors and Text

## Problem
The Life Event Planner dialog has a white background (`bg-white text-slate-900`), but internal components are using CSS variables that reference the dark theme, causing:
- Input fields to have dark/black backgrounds (unreadable)
- Labels to be barely visible (gray on white)
- Table headers to be invisible
- Cards to appear with semi-transparent dark styling

## Solution
Override the styling of elements inside the FinancialTimelineTool dialog to work with a white background by adding explicit light-theme classes.

## Implementation Plan

### Step 1: Fix Input Fields
Add `bg-white border-slate-300 text-slate-900` class overrides to all Input components in the dialog:
- Project Name input (line 912)
- Start Year input (line 936)
- Current Savings input (line 954)
- Monthly Contribution input (line 958)
- Cost table inputs (line 981-995)

### Step 2: Fix Select Component
Add light-theme styling to SelectTrigger:
- Project Type select (line 921)

### Step 3: Fix Labels
Add `text-slate-700` to all Label components to ensure visibility:
- Project Name, Project Type, Start Year, Duration, Inflation Rate, Current Savings, Monthly Contribution labels

### Step 4: Fix Card Components
Override Card styling inside the dialog with explicit light backgrounds:
- `bg-white border-slate-200` for cards instead of the dark glass-morphism style

### Step 5: Fix Table Headers and Rows
Add explicit text colors to table headers and cells:
- `text-slate-700` for headers
- `text-slate-600` for category labels

## Technical Details

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/tepilot/advisor-console/FinancialTimelineTool.tsx` | Add light-theme overrides to all form elements |

### Key Styling Changes
```text
+------------------+-----------------------------------+
| Element          | New Classes                       |
+------------------+-----------------------------------+
| Input            | bg-white border-slate-300         |
| SelectTrigger    | bg-white border-slate-300         |
| Label            | text-slate-700                    |
| Card             | bg-white border-slate-200         |
| Table headers    | text-slate-700                    |
| Table cells      | text-slate-600                    |
+------------------+-----------------------------------+
```

### Code Example
```tsx
// Input with light theme override
<Input 
  value={projectName} 
  onChange={e => setProjectName(e.target.value)} 
  placeholder="e.g., College Education"
  className="bg-white border-slate-300 text-slate-900"
/>

// Label with explicit color
<Label className="text-slate-700">Project Name</Label>

// Card with light background
<Card className="bg-white border-slate-200">
```

## Benefits
- All text will be clearly readable on the white dialog background
- Input fields will have white backgrounds with visible borders
- Consistent professional appearance matching other fixed dialogs
- No changes to global components - fixes are scoped to this dialog
