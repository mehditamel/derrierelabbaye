import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { GoldRule } from "@/components/GoldRule";
import { Button } from "@/components/Button";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: { absolute: "Page introuvable — Derrière l'Abbaye" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <Logo tone="noir" width={190} className={styles.logo} />
      <span className={styles.code}>Erreur 404</span>
      <h1 className={styles.title}>Cette page s'est éclipsée</h1>
      <GoldRule className={styles.rule} />
      <p className={styles.text}>
        La page que vous cherchez n'existe pas ou a changé d'adresse. Le comptoir,
        lui, est toujours là — juste derrière l'Abbaye Saint-Victor.
      </p>
      <div className={styles.actions}>
        <Button href="/" variant="primary">
          Retour à l'accueil
        </Button>
        <Button href="/reserver" variant="ghost">
          Réserver une table
        </Button>
      </div>
    </main>
  );
}
