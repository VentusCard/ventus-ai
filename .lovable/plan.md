

# Unified Integration Architecture Diagram -- 6 Horizontal Pillars

## What We're Building
A small button next to each capability page title that opens a dialog showing a single unified network diagram. The diagram has **6 horizontal pillars** arranged in 3 pairs -- each pair showing a bank's **existing tool** alongside the **new Ventus-powered capability** it unlocks.

## The 6 Pillars

```text
  EXISTING         NEW w/ VENTUS       EXISTING        NEW w/ VENTUS       EXISTING       NEW w/ VENTUS
  ANALYTICS        LIFESTYLE           REWARDS         REWARD              CRM            LIFE EVENT
  TOOLS            INDICATOR           PROGRAMS        PERSONALIZATION     TOOLS          INTELLIGENCE
                   ANALYTICS
```

Grouped as 3 pairs:
- **Pair 1**: Existing Analytics (BI dashboards, segment tools) + Ventus Lifestyle Indicator Analytics
- **Pair 2**: Existing Rewards (card programs, aggregators) + Ventus Reward Personalization
- **Pair 3**: Existing CRM (Salesforce, planning software) + Ventus Life Event Intelligence

## Diagram Flow (Top to Bottom)

```text
+-----------------------------------------------------------+
|              BANK PARTNER DATABASE                         |
+-----------------------------------------------------------+
                          |
                +-------------------+
                |    VENTUS AI      |
                | Intelligence Hub  |
                +-------------------+
          /       /          \        \       \         \
+--------+--------+--------+--------+---------+---------+
|Existing|Ventus  |Existing|Ventus  |Existing |Ventus   |
|Analyti-|Life-   |Rewards |Reward  |CRM      |Life     |
|cs Tools|style   |Programs|Person- |Tools    |Event    |
|        |Indicat-|        |aliz-   |         |Intelli- |
|BI Dash-|or      |Card    |ation   |Salesfor-|gence    |
|boards  |Analyt- |Programs|        |ce       |         |
|Segment |ics     |Aggreg- |Matched |Planning |Life     |
|Tools   |        |ators   |Offers  |Software |Event    |
|Data    |Persona |Partner |Real-   |Data Agg.|Dashboard|
|Warehou-|Dashboa-|Portals |Time    |(Plaid)  |CoPilot  |
|se      |rds     |        |Deals   |         |Suite    |
|        |Budge-  |        |        |         |Meeting  |
|        |ting    |        |        |         |Prep     |
+--------+--------+--------+--------+---------+---------+
                          |
          +----------------------------------+
          |          CUSTOMERS               |
          |   Personalized Banking           |
          +----------------------------------+
```

## Visual Design
- **Existing pillars**: Slate/gray background -- represents what the bank already has
- **New Ventus pillars**: Blue-tinted background with subtle glow -- what Ventus adds
- Each pair shares a subtle grouped bracket or top border color
- The pair relevant to the current page (based on `activeVariant`) gets a brighter highlight; other pairs remain visible but muted
- Footer tagline: "Ventus enhances your existing stack -- no rip-and-replace required"
- Connection lines from Ventus hub to each pillar with small arrow markers

## Pillar Content Details

| Existing Analytics | Ventus Lifestyle Indicator Analytics | Existing Rewards | Ventus Reward Personalization | Existing CRM | Ventus Life Event Intelligence |
|---|---|---|---|---|---|
| BI Dashboards | Lifestyle Persona Dashboards | Card Reward Programs | Lifestyle-Matched Offers | Salesforce / HubSpot | Life Event Dashboard |
| Segment Tools | Behavioral Segmentation | Reward Aggregators (CardLinx, Figg) | Real-Time Deal Matching | Planning Software (eMoney) | CoPilot Suite |
| Data Warehouse | Smart Budgeting Tools | Partner Portals | Personalized Rewards Experience | Data Aggregators (Plaid) | Automated Meeting Prep |
| | Targeted Campaigns | | | | Proactive Life Event Alerts |

## New Files

### 1. `src/components/technology/IntegrationArchitectureDialog.tsx`
- Dialog component accepting `activeVariant: 'enrichment' | 'rewards' | 'wealth'`
- Renders a wide SVG (~1000px) inside a scrollable dialog (max-w-5xl)
- **Top**: "Bank Partner Database" node spanning full width
- **Center**: "Ventus AI Intelligence Hub" -- blue with glow animation
- **6 pillars** below as rounded rectangles with stacked items (icon + label per tool)
- Dotted vertical lines between all pillars; subtle pair-grouping via shared bracket/border
- **Bottom**: "Customers -- Personalized Banking Experience" node
- Active pair highlighted, others slightly muted
- Horizontally scrollable on smaller screens

### 2. `src/components/technology/IntegrationDiagramButton.tsx`
- Small icon button using lucide `Network` icon
- Props: `variant: 'enrichment' | 'rewards' | 'wealth'`
- Tooltip: "View Integration Architecture"
- Opens `IntegrationArchitectureDialog` with matching `activeVariant`

## Modified Files

### 3. `src/pages/Enrichment.tsx` (line 98)
- Add `<IntegrationDiagramButton variant="enrichment" />` inside the flex div after the h1

### 4. `src/pages/SmartRewards.tsx` (line 98)
- Add `<IntegrationDiagramButton variant="rewards" />` after the h1

### 5. `src/pages/Wealth.tsx` (line 98)
- Add `<IntegrationDiagramButton variant="wealth" />` after the h1

