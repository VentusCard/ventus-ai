import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import { DeckmoDeck, DeckmoDesktopGuard } from "@/components/deckmo/DeckmoDeck";
import { DECKMO } from "@/lib/deckmoScript";

export default function DemoPage() {
  return (
    <DeckmoDesktopGuard>
      <SimplePasswordGate
        minimal
        title={DECKMO.chrome.gateTitle}
        subtitle={DECKMO.chrome.gateSubtitle}
        allowDemoBypass
        showSettings={false}
      >
        <DeckmoDeck />
      </SimplePasswordGate>
    </DeckmoDesktopGuard>
  );
}
