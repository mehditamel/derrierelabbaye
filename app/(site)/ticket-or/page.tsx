import type { Metadata } from "next";
import { TicketExperience } from "@/components/ticket-or/TicketExperience";

export const metadata: Metadata = {
  title: "Le Ticket d’Or de l’Abbaye",
  description: "Découvrez le Ticket d’Or de Derrière l’Abbaye, à Saint-Victor, Marseille.",
  robots: { index: false, follow: true },
};

export default function TicketOrPage() {
  return <TicketExperience />;
}
