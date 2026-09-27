import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import { DeckmoDeck, DeckmoDesktopGuard } from "@/components/deckmo/DeckmoDeck";
import { DECKMO } from "@/lib/deckmoScript";
import { InstitutionProvider } from "@/lib/institutionMode";

export default function DemoPage() {
  return (
    <DeckmoDesktopGuard>
      <InstitutionProvider>
        <SimplePasswordGate
          minimal
          title={DECKMO.chrome.gateTitle}
          subtitle={DECKMO.chrome.gateSubtitle}
          allowDemoBypass
          showSettings={false}
          showInstitutionSettings
        >
          <DeckmoDeck />
        </SimplePasswordGate>
      </InstitutionProvider>
    </DeckmoDesktopGuard>
  );
}
