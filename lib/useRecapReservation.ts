"use client";

/**
 * Actions communes de l'écran de succès de réservation (site + PWA) :
 * partage / copie du récapitulatif et ajout au calendrier (.ics).
 * Le rendu reste propre à chaque surface — seul le comportement est mutualisé.
 */

import { useEffect, useRef, useState } from "react";
import { telechargerIcs } from "@/lib/ics";
import { partagerOuCopier } from "@/lib/partage";
import { dateLongueFr } from "@/lib/creneaux";

export type RecapReservation = {
  date: string; // ISO yyyy-mm-dd
  heure: string; // "20:00"
  couverts: number;
};

/** Durée d'affichage de la confirmation « Récapitulatif copié ». */
const DUREE_COPIE_MS = 1800;

export function useRecapReservation(recap: RecapReservation | null, reference: string) {
  const [copie, setCopie] = useState(false);
  const timerCopie = useRef<number>();

  useEffect(() => () => window.clearTimeout(timerCopie.current), []);

  /** Web Share si disponible, sinon copie dans le presse-papiers. */
  async function partager() {
    if (!recap) return;
    const resultat = await partagerOuCopier({
      title: "Réservation — Derrière l'Abbaye",
      text: `Réservation chez Derrière l'Abbaye — ${dateLongueFr(recap.date)} à ${
        recap.heure
      }, ${recap.couverts} couvert${recap.couverts > 1 ? "s" : ""}. Référence ${reference}.`,
    });
    if (resultat === "copie") {
      setCopie(true);
      window.clearTimeout(timerCopie.current);
      timerCopie.current = window.setTimeout(() => setCopie(false), DUREE_COPIE_MS);
    }
  }

  /** Télécharge l'événement .ics de la réservation. */
  function ajouterAuCalendrier() {
    if (!recap) return;
    telechargerIcs({
      dateIso: recap.date,
      heure: recap.heure,
      couverts: recap.couverts,
      reference,
    });
  }

  /** À appeler sur « Nouvelle demande » : efface l'état « copié ». */
  function reinitialiser() {
    window.clearTimeout(timerCopie.current);
    setCopie(false);
  }

  return { copie, partager, ajouterAuCalendrier, reinitialiser };
}
