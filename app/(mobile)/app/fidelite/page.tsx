import type { Metadata } from "next";
import { LoyaltyCard } from "@/components/mobile/LoyaltyCard";
import styles from "./fidelite.module.css";

export const metadata: Metadata = {
  title: { absolute: "Fidélité — Derrière l'Abbaye" },
  description:
    "Votre carte de membre Derrière l'Abbaye : points, paliers et avantages à débloquer.",
  alternates: { canonical: "/app/fidelite" },
};

export default function AppFidelitePage() {
  return (
    <div>
      <div className={styles.header}>
        <h1 className="app-h" style={{ fontSize: "1.9rem" }}>
          Fidélité
        </h1>
        <p className={styles.sub}>Votre carte de membre</p>
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
