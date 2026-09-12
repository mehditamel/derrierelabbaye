import { ReservationAccess } from "@/components/ReservationAccess";
import type { Metadata } from "next";
import { MobileReserver } from "@/components/mobile/MobileReserver";

export const metadata: Metadata = {
  title: { absolute: "Réserver — Derrière l'Abbaye" },
  description: "Réservez votre table chez Derrière l'Abbaye par téléphone au 06 44 76 91 74.",
  alternates: { canonical: "/app/reserver" },
};

export default function AppReserverPage() {
  return (
    <ReservationAccess mobile>
      <MobileReserver />
    </ReservationAccess>
  );
}
