const SIGNALS = [
  "Well-off frequent international traveler",
  "Just got a pet",
  "Big home renovation underway",
  "Shopping for a car",
  "Has a child heading to college",
  "Helping pay for an aging parent",
  "Came into a large sum",
  "Long-time homeowner",
  "Saving for a down payment",
  "Switched to an electric car",
  "Paying wedding vendors",
  "Travels for work often",
  "Loyal to one airline or hotel",
  "Changed or left a job",
  "New baby in the household",
  "More money left over each month",
  "Private club and luxury memberships",
  "Spends time in a vacation area",
  "Investing at another firm",
  "Bringing retirement accounts together",
  "Debt building up",
  "Books premium travel",
  "Working with an estate attorney",
  "Paid off a car loan elsewhere",
];

const HUES = [
  "border-sky-400/40 bg-sky-400/10 text-sky-100",
  "border-amber-400/40 bg-amber-400/10 text-amber-100",
  "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  "border-violet-400/40 bg-violet-400/10 text-violet-100",
  "border-rose-400/40 bg-rose-400/10 text-rose-100",
];

const STATS = [
  { value: "5", label: "signal families" },
  { value: "12", label: "lifestyle pillars" },
  { value: "9", label: "life-event categories" },
  { value: "14", label: "risk categories" },
];

const SignalWallSection = () => (
  <section
    id="platform"
    className="relative scroll-mt-24 overflow-hidden border-y border-blue-500/20 bg-[#0A1628] py-24 md:py-28"
  >
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.18), transparent 70%)",
      }}
    />
    <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">The signals</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
        230 signals, written the way a banker would say them.
      </h2>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
        Not category codes or model outputs. Plain descriptions of what a customer is doing, so
        anyone on your team can read a profile and act on it.
      </p>

      <div className="mt-12 flex flex-wrap gap-2.5">
        {SIGNALS.map((s, i) => (
          <span
            key={s}
            className={`inline-flex rounded-full border px-3.5 py-2 text-sm font-medium ${HUES[i % HUES.length]}`}
            style={{ marginLeft: i % 5 === 2 ? 18 : i % 7 === 4 ? 30 : 0 }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-sm text-white/55">{s.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-white/40">
        Every signal carries the activity it was inferred from, so your teams can see why before
        they act.
      </p>
    </div>
  </section>
);

export default SignalWallSection;
