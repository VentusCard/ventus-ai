const CARDS = [
  {
    title: "It arrives before anyone asks.",
    body: "Every morning each colleague gets the households in their book that moved, ranked strongest first, one row each.",
  },
  {
    title: "It shows the arithmetic.",
    body: "Every dollar figure is net of the annual fee and net of what the customer already earns elsewhere. Where a number can't be calculated honestly, it says so.",
  },
  {
    title: "It answers in plain English.",
    body: "Reply and ask it to screen the whole book against a product, show the evidence behind a row, or prepare you for a meeting.",
  },
  {
    title: "It drafts, never sends.",
    body: "Outreach comes back in two halves: the note the customer would read, and the rationale you need to defend it. A person approves everything that leaves.",
  },
];

const ROWS = [
  {
    household: "Whitfield household",
    signal: "Has a child heading to college",
    product: "529 College Savings Plan",
    benefit: "$1,240 / yr",
    window: "Next 14 days",
  },
  {
    household: "Ramirez household",
    signal: "Big home renovation underway",
    product: "Home Equity Line",
    benefit: "$2,310 / yr",
    window: "Next 7 days",
  },
  {
    household: "Okafor household",
    signal: "Well-off frequent international traveler",
    product: "Premium Travel Card",
    benefit: "$460 / yr",
    window: "Next 30 days",
  },
];

const CoworkerSection = () => (
  <section id="coworker" className="scroll-mt-24 bg-white py-24 md:py-28">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">AI Coworker</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
        The intelligence arrives as an email. Reply to it and it works.
      </h2>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-500">
        Most customer intelligence dies in a dashboard nobody opens. The Ventus Coworker delivers it
        where your teams already are, then behaves like a colleague.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-violet-200/70 bg-violet-50/40 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-gray-600">{c.body}</p>
          </div>
        ))}
      </div>

      {/* Email mockup */}
      <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              V
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                Ventus Coworker{" "}
                <span className="font-normal text-gray-400">&lt;coworker@ventusai.com&gt;</span>
              </p>
              <p className="truncate text-sm text-gray-600">
                3 households in your book moved overnight
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
            Daily Digest
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 font-semibold">Household</th>
                <th className="px-5 py-3 font-semibold">Signal</th>
                <th className="px-5 py-3 font-semibold">Best-fit product</th>
                <th className="px-5 py-3 font-semibold">Annual benefit</th>
                <th className="px-5 py-3 font-semibold">Outreach window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map((r) => (
                <tr key={r.household}>
                  <td className="px-5 py-4 font-medium text-gray-900">{r.household}</td>
                  <td className="px-5 py-4 text-gray-600">{r.signal}</td>
                  <td className="px-5 py-4 text-gray-600">{r.product}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{r.benefit}</td>
                  <td className="px-5 py-4 text-gray-600">{r.window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
);

export default CoworkerSection;
