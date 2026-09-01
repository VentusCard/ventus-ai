import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const landingFonts = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600&display=swap";
const legacyFonts = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800;900&display=swap";

export function RouteFonts() {
  const location = useLocation();
  const href = location.pathname === "/" ? landingFonts : legacyFonts;

  return (
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={href} />
    </Helmet>
  );
}

