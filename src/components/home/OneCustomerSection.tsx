const STEPS = [
  {
    num: "01",
    title: "Observed",
    body: "Recurring spend on test prep, college application fees, and an education consultant. Three months running, across card and checking.",
  },
  {
    num: "02",
    title: "Detected",
    body: "Has a child heading to college. Strong confidence, with the underlying activity attached as the reason. The signal carries its evidence, so anyone can check the work.",
  },
  {
    num: "03",
    title: "Acted on",
    body: "A 529 college savings plan matches on this signal. A student loan pre-approval queues. An advisor briefing is compiled and sent, naming the household and the reason.",
  },
];

const OneCustomerSection = () => (
  <section id="one-customer" className="scroll-mt-24 bg-white py-24 md:py-28">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">How it works</p>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
        One customer. One signal. Three actions.
      </h2>
      <p className="mt-4 text-lg text-gray-500">This is the whole product in one customer.</p>

      <div className="relative mt-14">
        <span
          className="absolute left-0 right-0 top-[18px] hidden h-px bg-slate-200 md:block"
          aria-hidden
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s) => (
            <div key={s.num} className="relative pl-10 md:pl-0">
              <span
                className="absolute left-[17px] top-2 h-full w-px bg-slate-200 md:hidden"
                aria-hidden
              />
              <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-white text-[11px] font-bold text-blue-600 md:relative md:mb-5 md:flex">
                {s.num}
              </span>
              <h3 className="text-xl font-bold text-gray-900 md:mt-0">{s.title}</h3>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-gray-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-16 max-w-3xl text-center text-xl font-medium leading-relaxed text-gray-900">
        Nobody filled out a form. Nobody told the bank anything. The data was already there.
      </p>
    </div>
  </section>
);

export default OneCustomerSection;
