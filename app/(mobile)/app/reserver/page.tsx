import type { Metadata } from "next";
import { MobileReserver } from "@/components/mobile/MobileReserver";

export const metadata: Metadata = {
  title: { absolute: "Réserver — Derrière l'Abbaye" },
  description:
    "Réservez votre table chez Derrière l'Abbaye : date, couverts et heure en quelques gestes.",
  alternates: { canonical: "/app/reserver" },
};

export default function AppReserverPage() {
  return <MobileReserver />;
}
