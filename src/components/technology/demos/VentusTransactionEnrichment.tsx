import { useEffect, useRef, useCallback } from "react";

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
      { label: "Raw Transaction", text: next.raw, raw: true, derived: false },
      { label: "Amount", text: next.amount, raw: false, derived: false },
      { label: "MCC", text: next.mcc, raw: false, derived: false },
      { label: "Merchant", text: next.merchant, raw: false, derived: true },
      { label: "Category", text: next.cat, raw: false, derived: true },
      { label: "Sub-Category", text: next.sub, raw: false, derived: true },
    ];

    cols.forEach(({ label, text, raw, derived }) => {
      const cell = document.createElement("div");
      cell.className = "vte-cell" + (derived ? " derived" : "");
      cell.setAttribute("data-label", label);
      const span = document.createElement("span");
      span.className = (raw ? "raw" : "one") + (derived ? " derived-text" : "");
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

  const resetDemo = useCallback(() => {
    cursorRef.current = 0;
    windowRowsRef.current = [];
    categoryDataRef.current = {};
    categorySpendingRef.current = {};
    activeCategoriesRef.current = [];

    if (bodyRef.current) bodyRef.current.innerHTML = "";
    if (personaSummaryRef.current) personaSummaryRef.current.innerHTML = "";
    if (categoriesContainerRef.current) categoriesContainerRef.current.innerHTML = "";
    if (signalsContainerRef.current) signalsContainerRef.current.style.display = "none";

    setTimeout(() => addTransaction(), 1000);
  }, [addTransaction]);

  useEffect(() => {
    addTransaction();
    const iv = setInterval(() => {
      if (cursorRef.current === FEED.length) {
        clearInterval(iv);
        setTimeout(() => resetDemo(), INTERVAL * 2);
      } else {
        addTransaction();
      }
    }, INTERVAL);

    return () => clearInterval(iv);
  }, [addTransaction, resetDemo]);

  return (
    <>
      <style>{`
        .vte-root {
          --ink: #ffffff;
          --muted: rgba(255,255,255,.55);
          --hair: rgba(255,255,255,.15);
          --wash: rgba(255,255,255,.04);
          --radius: 18px;
          --sigBg: rgba(255,255,255,.06);
          --sigBd: rgba(255,255,255,.20);
          --sigInk: rgba(255,255,255,.92);
          --hlBg: rgba(255,255,255,.04);
          --hlBd: rgba(255,255,255,.15);

          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: var(--ink);
          max-width: 1120px;
          margin: 0 auto;
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
          background: transparent;
        }
        .vte-head {
          padding: 16px 18px;
          border-bottom: 1px solid var(--hair);
          background: rgba(255,255,255,.04);
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .vte-title {
          margin: 0;
          font-size: 15px;
          font-weight: 820;
          letter-spacing: -0.01em;
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
          background: var(--wash);
          font-size: 12px;
          font-weight: 780;
          letter-spacing: -0.01em;
        }
        .vte-cell {
          padding: 12px 16px;
          border-bottom: 1px solid var(--hair);
          border-right: 1px solid var(--hair);
          font-size: 13px;
          display: flex;
          align-items: center;
          min-height: 50px;
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
        .raw {
          white-space: normal;
          word-break: break-word;
          line-height: 1.25;
        }
        .one { white-space: nowrap; line-height: 1.2; }
        .derived-text { color: rgba(255,255,255,.70); font-weight: 650; }
        .vte-spacer { height: 12px; }
        .vte-disclaimer {
          margin-top: 16px;
          text-align: center;
        }
        .vte-disclaimer p {
          margin: 0;
          font-size: 11px;
          color: rgba(255,255,255,.35);
          font-weight: 620;
          letter-spacing: -0.005em;
          line-height: 1.4;
        }
        .vte-persona-wrap { padding: 16px 18px 18px; }
        .vte-persona-panel {
          border: 1px solid var(--hlBd);
          background: var(--hlBg);
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .vte-persona-summary {
          margin: 0;
          font-family: ui-serif, Georgia, "Times New Roman", Times, serif;
          font-size: 18px;
          font-weight: 820;
          letter-spacing: -0.012em;
          line-height: 1.2;
        }
        .vte-key { font-weight: 920; }
        .vte-signal-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,.12);
        }
        .vte-signal-label {
          font-size: 12px;
          font-weight: 820;
          color: rgba(255,255,255,.65);
          letter-spacing: -0.01em;
        }
        .vte-category-group {
          border-bottom: 1px solid rgba(255,255,255,.08);
          padding: 12px 0;
          display: grid;
          grid-template-columns: 200px 95px 1fr;
          gap: 24px;
          align-items: center;
        }
        .vte-category-group:first-child { padding-top: 0; }
        .vte-category-group:last-child { border-bottom: none; padding-bottom: 0; }
        .vte-category-name {
          font-size: 11px;
          font-weight: 820;
          color: rgba(255,255,255,.45);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .vte-category-spending {
          font-size: 13px;
          font-weight: 650;
          color: var(--ink);
          letter-spacing: -0.01em;
          text-align: right;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .vte-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-start;
          align-content: flex-start;
        }
        .vte-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid var(--sigBd);
          background: var(--sigBg);
          color: var(--sigInk);
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
        }
        .vte-chip strong { font-weight: 880; letter-spacing: -0.01em; }
        .vte-chip-count { font-weight: 820; color: rgba(255,255,255,.55); }
        .vte-chip.is-off {
          opacity: .30;
          background: rgba(255,255,255,.02);
          border-color: rgba(255,255,255,.10);
        }
        .vte-chip.is-off .vte-chip-count { display: none; }

        @media (max-width: 980px) {
          .vte-row { grid-template-columns: 1fr; }
          .vte-row.head { display: none; }
          .vte-cell {
            border-right: none;
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
            align-items: start;
            min-height: auto;
          }
          .vte-cell::before {
            content: attr(data-label);
            color: var(--muted);
            font-weight: 650;
            font-size: 12px;
          }
          .vte-persona-summary { font-size: 17px; }
          .vte-category-group {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>

      <div className="vte-root">
        {/* Transaction table */}
        <div className="vte-card">
          <div className="vte-head">
            <h3 className="vte-title">Transaction Enrichment</h3>
          </div>
          <div className="vte-table">
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

        <div className="vte-spacer" />

        {/* Persona card */}
        <div className="vte-card">
          <div className="vte-head">
            <h3 className="vte-title">Customer Persona</h3>
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

        <div className="vte-disclaimer">
          <p>Example merchants and MCC codes shown for demonstration purposes. Actual merchant names and codes may differ.</p>
        </div>
      </div>
    </>
  );
}
