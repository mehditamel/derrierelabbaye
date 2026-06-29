import type { Metadata } from "next";
import { MobileCarte } from "@/components/mobile/MobileCarte";

export const metadata: Metadata = {
  title: { absolute: "La carte — Derrière l'Abbaye" },
  description: "Tapas à partager, planches et cocktails de Derrière l'Abbaye — la carte complète.",
  alternates: { canonical: "/app/carte" },
};

export default function AppCartePage() {
  return <MobileCarte />;
}
