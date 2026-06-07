"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { haptic } from "@/lib/haptic";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  avantages,
  avantageFranchi,
  demoLoyalty,
  POINTS_PAR_VISITE,
  prochainAvantage,
} from "@/services/loyalty";
import styles from "../../app/(mobile)/app/fidelite/fidelite.module.css";

/** Carte de fidélité interactive : points persistés localement (aperçu du programme). */
export function LoyaltyCard() {
  const { value: points, set, remove } = useLocalStorage(
    "dla-loyalty-points",
    demoLoyalty.points
  );
  const [annonce, setAnnonce] = useState("");
  const [vientDeValider, setVientDeValider] = useState(false);

  const suivant = prochainAvantage(points);
  const progression = suivant
    ? Math.min(100, Math.round((points / suivant.seuil) * 100))
    : 100;

  function validerVisite() {
    const apres = points + POINTS_PAR_VISITE;
    const franchi = avantageFranchi(points, apres);
    set(apres);
    haptic(franchi ? [18, 50, 30] : 14);
    setAnnonce(
      franchi
        ? `Avantage débloqué : ${franchi.titre.toLowerCase()} !`
        : `Visite enregistrée — +${POINTS_PAR_VISITE} points.`
    );
    setVientDeValider(true);
    window.setTimeout(() => setVientDeValider(false), 1600);
  }

  function reinitialiser() {
    remove();
    setAnnonce("");
  }

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardTop}>
          <Logo tone="cream" width={150} />
          <span className={styles.chip}>Membre</span>
        </div>
        <div className={styles.points}>
          <span className={styles.pointsValue}>{points}</span>
          <span className={styles.pointsLabel}>points</span>
        </div>
        <p className={styles.member}>{demoLoyalty.membre}</p>

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

      <div className={styles.actions}>
        <button
          className={styles.visite}
          onClick={validerVisite}
          disabled={vientDeValider}
          aria-label="Simuler une visite et créditer des points"
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden />
          {vientDeValider ? "Visite enregistrée" : "Simuler une visite"}
        </button>
        <button className={styles.reset} onClick={reinitialiser} type="button">
          Réinitialiser l'aperçu
        </button>
      </div>
      <p className={styles.annonce} role="status" aria-live="polite">
        {annonce}
      </p>

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
    </>
  );
}
