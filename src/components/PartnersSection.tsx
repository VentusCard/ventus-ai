const partners = [
  { name: "Finovate", slug: "Finovate" },
  { name: "Fintech Sandbox", slug: "Fintech Sandbox" },
  { name: "OneValley", slug: "OneValley" },
  { name: "Plug and Play", slug: "Plug and Play" },
];

const PartnersSection = () => {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase mb-3">
            Partners & accelerators
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Backed by the networks shaping financial innovation
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center h-24 md:h-28 rounded-2xl border border-slate-200 bg-white px-6 transition-all duration-200 hover:border-blue-300 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.18)]"
            >
              <span className="text-lg md:text-xl font-bold text-gray-800 tracking-tight text-center leading-tight">
                {partner.slug}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
