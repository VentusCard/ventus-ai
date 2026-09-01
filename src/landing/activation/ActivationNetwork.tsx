import { BriefcaseBusiness, Gift, Megaphone, MessageSquareText, Smartphone } from "lucide-react";
import { Node } from "@/landing/motif/Node";
import { Rail } from "@/landing/motif/Rail";
import { landingCopy } from "@/landing/copy";

const icons = [Smartphone, MessageSquareText, Megaphone, Gift, BriefcaseBusiness] as const;

export function ActivationNetwork() {
  return (
    <div className="activation-network" data-glass-region="activation-network" aria-label={landingCopy.accessibility.activationNetwork}>
      <div className="activation-network__source">
        <span>V</span>
        <div>
          <small>{landingCopy.activation.networkFrom}</small>
          <strong>{landingCopy.activation.networkTo}</strong>
        </div>
      </div>

      <div className="activation-network__map">
        <svg viewBox="0 0 760 220" aria-hidden="true">
          <Rail d="M80 110 C210 110 240 110 340 110" active />
          <Rail d="M340 110 C450 110 470 30 660 30" active />
          <Rail d="M340 110 C450 110 470 70 660 70" active />
          <Rail d="M340 110 C450 110 470 110 660 110" active />
          <Rail d="M340 110 C450 110 470 150 660 150" active />
          <Rail d="M340 110 C450 110 470 190 660 190" active />
          <Node cx={80} cy={110} active />
          <Node cx={340} cy={110} active />
          {[30, 70, 110, 150, 190].map((cy) => <Node key={cy} cx={660} cy={cy} />)}
        </svg>
      </div>

      <div className="activation-network__destinations">
        {landingCopy.activation.destinations.map((destination, index) => {
          const Icon = icons[index];
          return (
            <div key={destination}>
              <Icon aria-hidden="true" />
              <span>{destination}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
