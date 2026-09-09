import finovateAsset from "@/assets/partners/finovate.png.asset.json";
import fintechSandboxAsset from "@/assets/partners/fintech-sandbox.png.asset.json";
import onevalleyAsset from "@/assets/partners/onevalley.png.asset.json";
import plugAndPlayAsset from "@/assets/partners/plug-and-play.png.asset.json";

const partners = [
  { name: "Finovate", src: finovateAsset.url },
  { name: "Fintech Sandbox", src: fintechSandboxAsset.url },
  { name: "OneValley", src: onevalleyAsset.url },
  { name: "Plug and Play", src: plugAndPlayAsset.url },
];

const PartnersSection = () => {
  return (
    <section className="bg-white py-10 md:py-12">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="mb-6 md:mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Partners &amp; accelerators
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Backed by the networks shaping financial innovation
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-12 md:gap-x-16 gap-y-8">
          {partners.map((partner) => (
            <img
              key={partner.name}
              src={partner.src}
              alt={`${partner.name} logo`}
              style={{ height: partner.height, maxWidth: 380 }}
              className="w-auto object-contain opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
