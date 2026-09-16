import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import { DeckmoDeck, DeckmoDesktopGuard } from "@/components/deckmo/DeckmoDeck";
import { DECKMO } from "@/lib/deckmoScript";

export default function DemoPage() {
  return (
    <DeckmoDesktopGuard>
      <SimplePasswordGate tagline={DECKMO.chrome.gateTagline} bullets={[...DECKMO.chrome.gateBullets]} allowDemoBypass showSettings={false}>
        <DeckmoDeck />
      </SimplePasswordGate>
    </DeckmoDesktopGuard>
  );
}
