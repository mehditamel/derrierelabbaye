import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "./not-found.module.css";

export default function AppNotFound() {
  return (
    <div className={styles.wrap}>
      <Logo tone="cream" width={150} />
      <span className={styles.code}>Erreur 404</span>
      <h1 className={styles.title}>Page introuvable</h1>
      <p className={styles.text}>
        Cette page n'existe pas ou a changé d'adresse.
      </p>
      <Link href="/app" className={styles.cta}>
        Retour à l'accueil
      </Link>
    </div>
  );
}
