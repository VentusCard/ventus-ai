import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'

async function bootstrap() {
  const isLanding = window.location.pathname === "/";

  if (!isLanding) await import("./index.css");

  const { default: Entry } = isLanding
    ? await import("./landing/LandingApp.tsx")
    : await import("./App.tsx");

  if (!isLanding) {
    const legacyEditorScript = document.createElement("script");
    legacyEditorScript.src = "https://cdn.gpteng.co/gptengineer.js";
    legacyEditorScript.type = "module";
    document.body.appendChild(legacyEditorScript);
  }

  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <Entry />
    </HelmetProvider>
  );
}

void bootstrap();
