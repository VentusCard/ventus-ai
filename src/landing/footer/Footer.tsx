import { LANDING_COPY } from "../copy";
import ventusLogo from "@/assets/ventus-logo-transparent.png";
import "./footer.css";

/**
 * Minimal closing strip on the dark ground: wordmark, copyright, contact
 * email, privacy link. Nothing else — no nav, no social, no signup.
 */
export function Footer() {
  const { footer } = LANDING_COPY;

  return (
    <footer className="landing-footer">
      <div className="landing-shell landing-footer-row">
        <img className="landing-footer-logo" src={ventusLogo} alt="Ventus AI" width={852} height={156} />
        <div className="landing-footer-meta">
          <span>{footer.copyright}</span>
          <a href={`mailto:${footer.email}`}>{footer.email}</a>
          <a href={footer.privacyHref}>{footer.privacyLabel}</a>
        </div>
      </div>
    </footer>
  );
}
