import finovateAsset from "@/assets/partners/finovate.png.asset.json";
import fintechSandboxAsset from "@/assets/partners/fintech-sandbox.png.asset.json";
import onevalleyAsset from "@/assets/partners/onevalley.png.asset.json";
import plugAndPlayAsset from "@/assets/partners/plug-and-play.png.asset.json";

// Heights are optically normalised, not mathematically equal:
// wordmarks with descenders / wide lockups render slightly shorter.
const partners = [
  { name: "Finovate", src: finovateAsset.url, height: 92 },
  { name: "Fintech Sandbox", src: fintechSandboxAsset.url, height: 86 },
  { name: "OneValley", src: onevalleyAsset.url, height: 78 },
  { name: "Plug and Play", src: plugAndPlayAsset.url, height: 96 },
];

const PartnersSection = () => {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-10 md:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Partners &amp; accelerators
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Backed by the networks shaping financial innovation
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-16 gap-y-10">
          {partners.map((partner) => (
            <img
              key={partner.name}
              src={partner.src}
              alt={`${partner.name} logo`}
              style={{ height: partner.height }}
              className="w-auto object-contain opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
