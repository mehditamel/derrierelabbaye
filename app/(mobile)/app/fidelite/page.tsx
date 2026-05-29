import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { avantages, demoLoyalty, prochainAvantage } from "@/services/loyalty";
import styles from "./fidelite.module.css";

export const metadata: Metadata = {
  title: { absolute: "Fidélité — Derrière l'Abbaye" },
  description:
    "Votre carte de membre Derrière l'Abbaye : points, paliers et avantages à débloquer.",
  alternates: { canonical: "/app/fidelite" },
};

export default function AppFidelitePage() {
  const { points, membre } = demoLoyalty;
  const suivant = prochainAvantage(points);
  const progression = suivant
    ? Math.min(100, Math.round((points / suivant.seuil) * 100))
    : 100;

  return (
    <div>
      <div className={styles.header}>
        <h1 className="app-h" style={{ fontSize: "1.9rem" }}>
          Fidélité
        </h1>
        <p className={styles.sub}>Votre carte de membre</p>
      </div>

      <div className="app-pad">
        <section className={styles.card}>
          <div className={styles.cardTop}>
            <Logo tone="cream" width={150} />
            <span className={styles.chip}>Membre</span>
          </div>
          <div className={styles.points}>
            <span className={styles.pointsValue}>{points}</span>
            <span className={styles.pointsLabel}>points</span>
          </div>
          <p className={styles.member}>{membre}</p>

          <div
            className={styles.progress}
            role="progressbar"
            aria-valuenow={progression}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={
              suivant
                ? `Progression vers : ${suivant.titre.toLowerCase()}`
                : "Tous les avantages sont débloqués"
            }
          >
            <div className={styles.progressBar} style={{ width: `${progression}%` }} />
          </div>
          {suivant ? (
            <p className={styles.next}>
              Plus que <strong>{suivant.seuil - points}</strong> points pour&nbsp;:{" "}
              {suivant.titre.toLowerCase()}
            </p>
          ) : (
            <p className={styles.next}>Tous les avantages sont débloqués. Merci !</p>
          )}
        </section>

        <section className={styles.advantages}>
          <span className="app-section-label">Vos avantages</span>
          <ul className={styles.list}>
            {avantages.map((a) => {
              const debloque = points >= a.seuil;
              return (
                <li
                  key={a.seuil}
                  className={`${styles.item} ${debloque ? styles.itemOn : ""}`}
                >
                  <span className={styles.itemSeuil}>{a.seuil}</span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemTitle}>{a.titre}</span>
                    <span className={styles.itemDetail}>{a.detail}</span>
                  </span>
                  <span className={styles.itemState}>{debloque ? "Acquis" : "À venir"}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <p className={styles.note}>
          Programme de fidélité en avant-première — bientôt disponible en boutique.
        </p>
      </div>
    </div>
  );
}
