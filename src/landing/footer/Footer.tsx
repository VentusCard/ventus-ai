import ventusWordmark from "@/assets/ventus-logo-transparent.png";
import { landingCopy } from "@/landing/copy";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-shell">
        <img src={ventusWordmark} alt={landingCopy.brandName} />
        <p>{landingCopy.footer.copyright}</p>
        <span>{landingCopy.footer.email}</span>
      </div>
    </footer>
  );
}
