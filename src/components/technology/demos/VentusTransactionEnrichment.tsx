import { useEffect, useRef, useCallback, useState } from "react";

const FEED = [
  { raw: "DELTA AIR LINES 00624188912", amount: "$450.00", mcc: "4511", merchant: "Delta Air Lines", cat: "Travel & Transportation", sub: "Airlines" },
  { raw: "PAYPAL *AIRBNB HMQ4T8", amount: "$320.00", mcc: "7011", merchant: "Airbnb", cat: "Travel & Transportation", sub: "Hotels & Lodging" },
  { raw: "UBER *TRIP O'HARE", amount: "$45.00", mcc: "4121", merchant: "Uber", cat: "Travel & Transportation", sub: "Ride Share" },
  { raw: "APPLPAY STARBUCKS #1472", amount: "$6.50", mcc: "5814", merchant: "Starbucks", cat: "Food & Dining", sub: "Cafes" },
  { raw: "SQ *BLUE BOTTLE COFFEE", amount: "$8.25", mcc: "5499", merchant: "Blue Bottle", cat: "Food & Dining", sub: "Cafes" },
  { raw: "APPLPAY WHOLEFDS MKT 10256", amount: "$67.80", mcc: "5411", merchant: "Whole Foods", cat: "Food & Dining", sub: "Grocery" },
  { raw: "TRADER JOE'S #113", amount: "$42.15", mcc: "5331", merchant: "Trader Joe's", cat: "Food & Dining", sub: "Grocery" },
  { raw: "UBER *TRIP CHICAGO", amount: "$28.50", mcc: "4121", merchant: "Uber", cat: "Travel & Transportation", sub: "Ride Share" },
  { raw: "REI #045 CHICAGO", amount: "$124.99", mcc: "5941", merchant: "REI", cat: "Sports & Fitness", sub: "Hiking" },
  { raw: "PAYPAL *TITLEIST 58.00", amount: "$58.00", mcc: "5655", merchant: "Titleist", cat: "Sports & Fitness", sub: "Golf" },
  { raw: "TST* SWEETGREEN #028", amount: "$14.25", mcc: "5812", merchant: "Sweetgreen", cat: "Food & Dining", sub: "Quick Service" },
  { raw: "AMZN Mktp US*2H7K31Q", amount: "$89.99", mcc: "5942", merchant: "Amazon", cat: "Shopping", sub: "General Retail" },
  { raw: "HERTZ RENT A CAR", amount: "$210.00", mcc: "7512", merchant: "Hertz", cat: "Travel & Transportation", sub: "Car Rental" },
  { raw: "MARRIOTT HOTELS 4829", amount: "$285.00", mcc: "3501", merchant: "Marriott", cat: "Travel & Transportation", sub: "Hotels & Lodging" },
  { raw: "SQ *FLOUR BAKERY+CAFE", amount: "$18.50", mcc: "5462", merchant: "Flour Bakery", cat: "Food & Dining", sub: "Cafes" },
  { raw: "THE CAPITAL GRILLE #012", amount: "$142.00", mcc: "5813", merchant: "Capital Grille", cat: "Food & Dining", sub: "Fine Dining" },
  { raw: "APPLPAY MCDONALD'S F3421", amount: "$9.75", mcc: "5814", merchant: "McDonald's", cat: "Food & Dining", sub: "Quick Service" },
  { raw: "PAYPAL *LA FITNESS", amount: "$45.00", mcc: "7997", merchant: "LA Fitness", cat: "Sports & Fitness", sub: "Gym" },
  { raw: "AMC THEATRES #4201", amount: "$28.50", mcc: "7832", merchant: "AMC Theatres", cat: "Entertainment", sub: "Movies" },
  { raw: "SQ *THE BEEHIVE BAR", amount: "$52.00", mcc: "5813", merchant: "The Beehive", cat: "Food & Dining", sub: "Bars & Nightlife" },
  { raw: "BEST BUY #00428", amount: "$149.99", mcc: "5732", merchant: "Best Buy", cat: "Shopping", sub: "Electronics" },
  { raw: "SPOTIFY USA", amount: "$10.99", mcc: "5968", merchant: "Spotify", cat: "Entertainment", sub: "Streaming" },
];

const MAX_VISIBLE = 5;
const INTERVAL = 3000;

function parseAmount(str: string): number {
  return parseFloat(str.replace("$", "").replace(",", ""));
}

function formatAmount(num: number): string {
  return "$" + num.toFixed(2);
}

export default function VentusTransactionEnrichment() {
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cursorRef = useRef(0);
  const windowRowsRef = useRef<typeof FEED>([]);
  const categoryDataRef = useRef<Record<string, Record<string, number>>>({});
  const categorySpendingRef = useRef<Record<string, number>>({});
  const activeCategoriesRef = useRef<string[]>([]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const personaSummaryRef = useRef<HTMLParagraphElement>(null);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const signalsContainerRef = useRef<HTMLDivElement>(null);

  const renderSignals = useCallback(() => {
    const container = categoriesContainerRef.current;
    if (!container) return;
    container.innerHTML = "";

    activeCategoriesRef.current.forEach((category) => {
      const group = document.createElement("div");
      group.className = "vte-category-group";

      const nameEl = document.createElement("div");
      nameEl.className = "vte-category-name";
      nameEl.textContent = category;
      group.appendChild(nameEl);

      const spendEl = document.createElement("div");
      spendEl.className = "vte-category-spending";
      spendEl.textContent = formatAmount(categorySpendingRef.current[category]);
      group.appendChild(spendEl);

      const chipsEl = document.createElement("div");
      chipsEl.className = "vte-chips";

      const subcategories = categoryDataRef.current[category];
      const sorted = Object.keys(subcategories).sort((a, b) => {
        const diff = subcategories[b] - subcategories[a];
        return diff !== 0 ? diff : a.localeCompare(b);
      });

      sorted.forEach((sub) => {
        const count = subcategories[sub];
        const chip = document.createElement("div");
        chip.className = "vte-chip" + (count >= 2 ? "" : " is-off");
        chip.innerHTML =
          `<strong>${sub}</strong>` +
          (count >= 2 ? `<span class="vte-chip-count">${count}x</span>` : "");
        chipsEl.appendChild(chip);
      });

      group.appendChild(chipsEl);
      container.appendChild(group);
    });
  }, []);

  const updatePersonaSummary = useCallback(() => {
    const el = personaSummaryRef.current;
    if (!el) return;
    if (windowRowsRef.current.length === 0) { el.innerHTML = ""; return; }

    const cd = categoryDataRef.current;
    let travelCount = 0, coffeeCount = 0, diningCount = 0, ridesCount = 0, sportsCount = 0, entertainmentCount = 0;

    if (cd["Travel & Transportation"]) {
      Object.values(cd["Travel & Transportation"]).forEach((c) => (travelCount += c));
      if (cd["Travel & Transportation"]["Ride Share"]) ridesCount = cd["Travel & Transportation"]["Ride Share"];
    }
    if (cd["Food & Dining"]) {
      ["Quick Service", "Fine Dining", "Bars & Nightlife"].forEach((k) => {
        if (cd["Food & Dining"][k]) diningCount += cd["Food & Dining"][k];
      });
      if (cd["Food & Dining"]["Cafes"]) coffeeCount = cd["Food & Dining"]["Cafes"];
    }
    if (cd["Sports & Fitness"]) Object.values(cd["Sports & Fitness"]).forEach((c) => (sportsCount += c));
    if (cd["Entertainment"]) Object.values(cd["Entertainment"]).forEach((c) => (entertainmentCount += c));

    const extras: string[] = [];
    if (coffeeCount >= 2) extras.push("regular café stops");
    if (diningCount >= 2) extras.push("frequent dining");
    if (ridesCount >= 2) extras.push("high mobility");
    if (sportsCount >= 2) extras.push("active lifestyle");
    if (entertainmentCount >= 2) extras.push("entertainment enthusiast");

    const primary =
      travelCount >= 3
        ? "<span class='vte-key'>Frequent traveler</span>"
        : "<span class='vte-key'>Standard customer profile</span>";

    el.innerHTML = primary + (extras.length ? " with " + extras.join(", ") + "." : "");
  }, []);

  const updateSignalsForTransaction = useCallback(
    (r: typeof FEED[0]) => {
      const { cat, sub, amount } = r;
      const parsed = parseAmount(amount);

      if (!categoryDataRef.current[cat]) {
        categoryDataRef.current[cat] = {};
        categorySpendingRef.current[cat] = 0;
        activeCategoriesRef.current.push(cat);
      }
      if (!categoryDataRef.current[cat][sub]) categoryDataRef.current[cat][sub] = 0;

      categoryDataRef.current[cat][sub]++;
      categorySpendingRef.current[cat] += parsed;

      if (
        activeCategoriesRef.current.length === 1 &&
        Object.keys(categoryDataRef.current[cat]).length === 1
      ) {
        if (signalsContainerRef.current) signalsContainerRef.current.style.display = "block";
      }

      renderSignals();
    },
    [renderSignals]
  );

  const addTransaction = useCallback(() => {
    const next = FEED[cursorRef.current % FEED.length];
    cursorRef.current++;

    windowRowsRef.current.push(next);

    const row = document.createElement("div");
    row.className = "vte-row data-row";

    const cols = [
      { label: "Raw Transaction", text: next.raw, cls: "raw" },
      { label: "Amount", text: next.amount, cls: "one amount-text" },
      { label: "MCC", text: next.mcc, cls: "one mcc-badge" },
      { label: "Merchant", text: next.merchant, cls: "one merchant-text", derived: true },
      { label: "Category", text: next.cat, cls: "one derived-text", derived: true },
      { label: "Sub-Category", text: next.sub, cls: "one derived-text", derived: true },
    ];

    cols.forEach(({ label, text, cls, derived }) => {
      const cell = document.createElement("div");
      cell.className = "vte-cell" + (derived ? " derived" : "");
      cell.setAttribute("data-label", label);
      const span = document.createElement("span");
      span.className = cls;
      span.textContent = text;
      cell.appendChild(span);
      row.appendChild(cell);
    });

    if (bodyRef.current) bodyRef.current.appendChild(row);

    updateSignalsForTransaction(next);
    updatePersonaSummary();

    if (windowRowsRef.current.length > MAX_VISIBLE) {
      windowRowsRef.current.shift();
      const firstRow = bodyRef.current?.querySelector(".vte-row.data-row");
      if (firstRow) {
        firstRow.classList.add("removing");
        setTimeout(() => { if (firstRow.parentNode) firstRow.remove(); }, 300);
      }
    }
  }, [updateSignalsForTransaction, updatePersonaSummary]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      if (cursorRef.current === FEED.length) {
        stopInterval();
        setTimeout(() => {
          if (isPausedRef.current) return;
          // reset inline
          cursorRef.current = 0;
          windowRowsRef.current = [];
          categoryDataRef.current = {};
          categorySpendingRef.current = {};
          activeCategoriesRef.current = [];
          if (bodyRef.current) bodyRef.current.innerHTML = "";
          if (personaSummaryRef.current) personaSummaryRef.current.innerHTML = "";
          if (categoriesContainerRef.current) categoriesContainerRef.current.innerHTML = "";
          if (signalsContainerRef.current) signalsContainerRef.current.style.display = "none";
          setTimeout(() => { addTransaction(); startInterval(); }, 1000);
        }, INTERVAL * 2);
      } else {
        addTransaction();
      }
    }, INTERVAL);
  }, [addTransaction, stopInterval]);

  const resetDemo = useCallback(() => {
    stopInterval();
    isPausedRef.current = false;
    setIsPaused(false);
    cursorRef.current = 0;
    windowRowsRef.current = [];
    categoryDataRef.current = {};
    categorySpendingRef.current = {};
    activeCategoriesRef.current = [];
    if (bodyRef.current) bodyRef.current.innerHTML = "";
    if (personaSummaryRef.current) personaSummaryRef.current.innerHTML = "";
    if (categoriesContainerRef.current) categoriesContainerRef.current.innerHTML = "";
    if (signalsContainerRef.current) signalsContainerRef.current.style.display = "none";
    setTimeout(() => { addTransaction(); startInterval(); }, 1000);
  }, [addTransaction, startInterval, stopInterval]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      if (!next && !intervalRef.current) startInterval();
      return next;
    });
  }, [startInterval]);

  useEffect(() => {
    addTransaction();
    startInterval();
    return () => stopInterval();
  }, [addTransaction, startInterval, stopInterval]);

  return (
    <>
      <style>{`
        .vte-root {
          --ink: #0f172a;
          --muted: #64748b;
          --hair: #e2e8f0;
          --wash: #f8faff;
          --radius: 16px;
          --accent: #2563eb;
          --sigBg: rgba(37,99,235,.08);
          --sigBd: rgba(37,99,235,.20);
          --sigInk: #2563eb;

          font-family: "Manrope", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: var(--ink);
          width: 100%;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .vte-root *, .vte-root *::before, .vte-root *::after {
          box-sizing: border-box;
        }
        .vte-card {
          border: 1px solid var(--hair);
          border-radius: var(--radius);
          overflow: hidden;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
        }
        .vte-head {
          padding: 14px 20px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .vte-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0;
          text-transform: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vte-title-icon {
          width: 18px;
          height: 18px;
          opacity: 0.7;
          color: #2563eb;
        }
        .vte-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(16,185,129,0.08);
          color: #059669;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .vte-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: vte-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(16,185,129,0.6);
        }
        @media (max-width: 1023px) {
          .vte-live-dot { display: none; }
        }
        .vte-pulsing-dot {
          position: relative;
          width: 8px;
          height: 8px;
        }
        .vte-pulsing-dot::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #10b981;
          animation: vte-pulse 2s ease-in-out infinite;
        }
        .vte-pulsing-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #10b981;
          opacity: 0.75;
          animation: vte-ping 2s ease-in-out infinite;
        }
        @keyframes vte-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes vte-ping {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .vte-table { width: 100%; }
        .vte-row {
          display: grid;
          grid-template-columns:
            minmax(280px, 2.3fr)
            minmax(85px, .6fr)
            minmax(74px, .55fr)
            minmax(170px, 1.15fr)
            minmax(170px, 1.15fr)
            minmax(170px, 1.15fr);
        }
        .vte-row.head {
          background: #f8faff;
        }
        .vte-row.head .vte-cell {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 16px;
          min-height: auto;
        }
        .vte-cell {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          display: flex;
          align-items: center;
          min-height: 50px;
          transition: background 0.15s;
        }
        .vte-row.data-row:hover .vte-cell {
          background: #f8faff;
        }
        .vte-row .vte-cell:last-child { border-right: none; }
        .vte-cell.derived {
          opacity: 0;
          animation: vte-fadeIn 1.4s ease-in-out 1.2s forwards;
        }
        @keyframes vte-fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vte-row.data-row {
          animation: vte-slideIn 1.0s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes vte-slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vte-row.removing {
          animation: vte-slideOut 0.8s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes vte-slideOut {
          to { opacity: 0; transform: translateY(-20px); margin-bottom: -50px; }
        }
        /* Group header row */
        .vte-group-row {
          display: grid;
          grid-template-columns:
            minmax(280px, 2.3fr)
            minmax(85px, .6fr)
            minmax(74px, .55fr)
            minmax(170px, 1.15fr)
            minmax(170px, 1.15fr)
            minmax(170px, 1.15fr);
          background: #f8faff;
        }
        .vte-group-label {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .vte-group-raw {
          grid-column: 1 / 4;
          color: #94a3b8;
          border-bottom: 1px solid #e2e8f0;
        }
        .vte-group-enriched {
          grid-column: 4 / 7;
          color: #2563eb;
          border-bottom: 1px solid #e2e8f0;
          border-left: 2px solid #e2e8f0;
        }
        .vte-group-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #94a3b8;
          flex-shrink: 0;
        }
        .vte-group-icon {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }
        /* Vertical divider on header and data rows */
        .vte-row .vte-cell:nth-child(4) {
          border-left: 2px solid #e2e8f0;
        }
        .raw {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          white-space: normal;
          word-break: break-word;
          line-height: 1.25;
          color: #94a3b8;
          font-size: 12px;
        }
        .one { white-space: nowrap; line-height: 1.2; }
        .one.amount-text { font-weight: 600; color: #94a3b8; }
        .one.mcc-badge {
          display: inline-flex;
          padding: 2px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
        }
        .one.merchant-text { font-weight: 700; color: #0f172a; }
        .derived-text { color: #2563eb; font-weight: 600; }
        /* Connector between table and persona */
        .vte-connector {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
        }
        .vte-connector-arrow {
          color: #2563eb;
          font-size: 20px;
          line-height: 1;
          flex-shrink: 0;
        }
        .vte-connector-text {
          font-size: 12px;
          color: #94a3b8;
          text-align: left;
          white-space: nowrap;
          line-height: 1.4;
        }
        .vte-spacer { height: 20px; }
        .vte-disclaimer {
          margin-top: 16px;
          text-align: center;
        }
        .vte-disclaimer p {
          margin: 0;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 400;
          line-height: 1.4;
        }
        /* Persona card */
        .vte-persona-wrap { padding: 20px; }
        .vte-persona-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .vte-persona-summary {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.3;
          color: #0f172a;
        }
        .vte-key { font-weight: 800; }
        .vte-signal-top {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          margin-left: -20px;
          margin-right: -20px;
          padding-left: 20px;
          padding-right: 20px;
        }
        .vte-control-bar {
          display: flex;
          justify-content: center;
          gap: 4px;
          padding: 12px 0 4px;
          margin-top: 8px;
        }
        .vte-control-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #9ca3af;
          background: transparent;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .vte-control-btn:hover {
          color: #374151;
          background: #f9fafb;
        }
        .vte-signal-label {
          font-size: 10px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .vte-category-group {
          border-left: 3px solid #2563eb;
          padding: 10px 0 10px 14px;
          margin-bottom: 8px;
          display: grid;
          grid-template-columns: 200px 95px 1fr;
          gap: 16px;
          align-items: center;
        }
        .vte-category-group:last-child { margin-bottom: 0; }
        .vte-category-name {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .vte-category-spending {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          text-align: right;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .vte-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: flex-start;
          align-content: flex-start;
        }
        .vte-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          border: none;
          background: rgba(37,99,235,0.08);
          color: #2563eb;
          font-size: 11px;
          line-height: 1;
          white-space: nowrap;
        }
        .vte-chip strong { font-weight: 700; letter-spacing: -0.01em; }
        .vte-chip-count { font-weight: 600; opacity: 0.7; }
        .vte-chip.is-off {
          opacity: .30;
          background: #f1f5f9;
          color: #94a3b8;
        }
        .vte-chip.is-off .vte-chip-count { display: none; }

        .vte-scale-wrapper {
          transform-origin: top center;
        }
        @media (max-width: 1024px) {
          .vte-scale-wrapper {
            transform: scale(0.7);
            margin-bottom: -30%;
          }
        }
        @media (max-width: 767px) {
          .vte-scale-wrapper {
            transform: none;
            margin-bottom: 0;
          }
          .vte-row, .vte-group-row {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .vte-row.head { display: none; }
          .vte-group-row { display: none; }
          .vte-cell {
            padding: 4px 16px;
            min-height: auto;
            border-bottom: none;
            font-size: 12px;
            border-left: none !important;
            display: flex;
            align-items: baseline;
            gap: 6px;
          }
          .vte-cell::before {
            content: attr(data-label);
            display: inline;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: #94a3b8;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .vte-live-badge { white-space: nowrap; }
          .vte-head { flex-wrap: nowrap; }
          .vte-cell.derived { animation-delay: 0.6s; }
          .vte-row.data-row {
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 0;
          }
          .vte-category-group {
            grid-template-columns: 1fr auto;
            gap: 8px;
          }
          .vte-category-group .vte-chips {
            grid-column: 1 / -1;
          }
          .vte-connector-text { white-space: normal; }
        }
      `}</style>

      <div className="vte-scale-wrapper">
      <div className="vte-root">
        {/* Transaction table */}
        <div className="vte-card">
          <div className="vte-head">
            <h3 className="vte-title">
              Multi-rail Enrichment
            </h3>
            <span className="vte-live-badge">
              <span className="vte-live-dot" />
              Live Demo
            </span>
          </div>
          <div className="vte-table">
            <div className="vte-group-row">
              <div className="vte-group-label vte-group-raw">
                <span className="vte-group-dot" />
                Raw Input
              </div>
              <div className="vte-group-label vte-group-enriched">
                <svg className="vte-group-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Enriched by Ventus
              </div>
            </div>
            <div className="vte-row head">
              {["Raw Transaction", "Amount", "MCC", "Merchant", "Category", "Sub-Category"].map((h) => (
                <div key={h} className="vte-cell">
                  {h}
                </div>
              ))}
            </div>
            <div ref={bodyRef} />
          </div>
        </div>

        <div className="vte-connector">
          <span className="vte-connector-arrow">↓</span>
          <span className="vte-connector-text">Ventus aggregates enriched signals across all transactions to build a live customer profile</span>
        </div>

        {/* Persona card */}
        <div className="vte-card">
          <div className="vte-head">
            <h3 className="vte-title">
              <span className="vte-pulsing-dot" />
              Customer Persona
            </h3>
          </div>
          <div className="vte-persona-wrap">
            <div className="vte-persona-panel">
              <p className="vte-persona-summary" ref={personaSummaryRef} />
              <div ref={signalsContainerRef} className="vte-signal-top" style={{ display: "none" }}>
                <span className="vte-signal-label">Signals</span>
                <div ref={categoriesContainerRef} />
              </div>
            </div>
          </div>
        </div>

        <div className="vte-control-bar">
          <button onClick={togglePause} className="vte-control-btn">
            {isPaused ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            )}
            {isPaused ? "Play" : "Pause"}
          </button>
          <button onClick={resetDemo} className="vte-control-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Replay
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
