const CARDS = [
  {
    title: "Arrives daily",
    body: "Each colleague gets the households in their book that changed, ranked strongest first, one row each.",
  },
  {
    title: "Takes instructions by reply",
    body: "Ask it to screen the book against a product, show the evidence behind a row, or prepare you for a meeting. It answers in the same thread.",
  },
  {
    title: "Drafting documents",
    body: "It writes the client note, the internal rationale, and the meeting prep brief so the relationship manager has something concrete to start from.",
  },
  {
    title: "Creating tasks in CRMs",
    body: "Follow-ups are logged as tasks with the household, the signal, and the recommended next step, so nothing sits in an inbox.",
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
  <section id="coworker" className="scroll-mt-[96px] bg-white py-20 md:py-24">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <p className="text-[12px] font-bold uppercase tracking-widest text-violet-600">AI Coworker</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-gray-900 md:text-[40px]">
        Actionable intelligence directly in your inbox
      </h2>
      <p className="mt-5 max-w-3xl text-base leading-[1.65] text-gray-700">
        Relationship managers and advisors work out of email and meetings, not analytics tools. The
        AI Coworker delivers the same intelligence there, and behaves like a colleague when you
        reply to it.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {CARDS.map((c) => (
          <div
            key={c.title}
            className="rounded-[20px] border border-gray-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.12)]"
          >
            <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
            <p className="mt-2.5 text-base leading-[1.65] text-gray-700">{c.body}</p>
          </div>
        ))}
      </div>

      {/* Email mockup */}
      <div className="mt-10 w-full overflow-hidden rounded-[20px] border border-gray-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.16)]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              V
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-gray-900">
                Ventus Coworker{" "}
                <span className="font-normal text-gray-600">&lt;coworker@ventusai.com&gt;</span>
              </p>
              <p className="truncate text-base text-gray-700">
                3 households in your book moved overnight
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider text-violet-700">
            Daily Digest
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-base">
            <thead>
              <tr className="border-b border-gray-200 text-[12px] uppercase tracking-wider text-gray-600">
                <th className="px-6 py-3.5 font-bold">Household</th>
                <th className="px-6 py-3.5 font-bold">Signal</th>
                <th className="px-6 py-3.5 font-bold">Best-fit product</th>
                <th className="px-6 py-3.5 font-bold">Annual benefit</th>
                <th className="px-6 py-3.5 font-bold">Outreach window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ROWS.map((r) => (
                <tr key={r.household}>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.household}</td>
                  <td className="px-6 py-4 text-gray-700">{r.signal}</td>
                  <td className="px-6 py-4 text-gray-700">{r.product}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{r.benefit}</td>
                  <td className="px-6 py-4 text-gray-700">{r.window}</td>
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
