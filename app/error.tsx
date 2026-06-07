"use client";

import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { GoldRule } from "@/components/GoldRule";
import { Button } from "@/components/Button";
import styles from "./not-found.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Trace minimale côté client ; à brancher sur un service de suivi le moment venu.
    console.error(error);
  }, [error]);

  return (
    <main className={styles.wrap}>
      <Logo tone="noir" width={190} className={styles.logo} />
      <span className={styles.code}>Une erreur est survenue</span>
      <h1 className={styles.title}>Un petit contretemps</h1>
      <GoldRule className={styles.rule} />
      <p className={styles.text}>
        Quelque chose n'a pas fonctionné de notre côté. Réessayez dans un instant —
        ou revenez à l'accueil, on vous y attend.
      </p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={reset}>
          Réessayer
        </Button>
        <Button href="/" variant="ghost">
          Retour à l'accueil
        </Button>
      </div>
    </main>
  );
}
