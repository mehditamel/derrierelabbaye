import type { Metadata } from "next";
import { LoyaltyCard } from "@/components/mobile/LoyaltyCard";
import styles from "./fidelite.module.css";

export const metadata: Metadata = {
  title: { absolute: "Fidélité — Derrière l'Abbaye" },
  description:
    "Aperçu du programme de fidélité Derrière l'Abbaye : points, paliers et avantages à venir.",
  alternates: { canonical: "/app/fidelite" },
};

export default function AppFidelitePage() {
  return (
    <div>
      <div className={styles.header}>
        <h1 className="app-h app-h1">Fidélité</h1>
        <p className={styles.sub}>Aperçu du programme</p>
      </div>

      <div className="app-pad">
        <LoyaltyCard />

        <p className={styles.note}>
          Programme de fidélité en avant-première — bientôt disponible en boutique.
        </p>
      </div>
    </div>
  );
}
