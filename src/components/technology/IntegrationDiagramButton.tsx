import { useState } from "react";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import IntegrationArchitectureDialog from "./IntegrationArchitectureDialog";

type Variant = "enrichment" | "rewards" | "wealth";

interface Props {
  variant: Variant;
}

const IntegrationDiagramButton = ({ variant }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="text-foreground/50 hover:text-foreground hover:bg-white/10"
            >
              <Network className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Integration Architecture</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <IntegrationArchitectureDialog open={open} onOpenChange={setOpen} activeVariant={variant} />
    </>
  );
};

export default IntegrationDiagramButton;
