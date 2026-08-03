import { DashboardClient, EventPreparationData } from "@/types/dashboardClient";
import { AdvisorConversationThread } from "./AdvisorConversationThread";

interface AdvisorNotificationsViewProps {
  clients: DashboardClient[];
  onOpenClient: (clientId: string) => void;
  onPrepareWithVentus: (data: EventPreparationData) => void;
}

export function AdvisorNotificationsView({ clients }: AdvisorNotificationsViewProps) {
  return <AdvisorConversationThread clients={clients} density="full" />;
}
