import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { reseauxPublies } from "@/data/site";
import styles from "./fidelite.module.css";

export const metadata: Metadata = {
  title: { absolute: "La maison — Derrière l'Abbaye" },
  description: "Retrouvez les nouvelles de Derrière l'Abbaye et les informations de la maison.",
  alternates: { canonical: "/app/fidelite" },
};

export default function AppFidelitePage() {
  return (
    <div>
      <div className={styles.header}>
        <h1 className="app-h app-h1">La maison</h1>
        <p className={styles.sub}>Gardons le contact</p>
      </div>

      <div className="app-pad">
        <div className={styles.card}>
          <Logo tone="cream" width={210} />
          <p className={styles.next}>
            Les nouvelles de la maison se partagent aussi sur Instagram. Retrouvez-nous entre deux
            apéros.
          </p>
          <div className={styles.actions}>
            {reseauxPublies.map((reseau) => (
              <a
                key={reseau.nom}
                href={reseau.url}
                target="_blank"
                rel="noreferrer"
                className={styles.visite}
              >
                Nous suivre sur {reseau.nom}
              </a>
            ))}
          </div>
        </div>
        <p className={styles.note}>
          <a href="/mentions-legales">Mentions légales</a> ·{" "}
          <a href="/confidentialite">Confidentialité</a>
        </p>
      </div>
    </div>
  );
}
