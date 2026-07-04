/**
 * Filtrage des événements (« En ce moment »).
 *
 * La comparaison se fait par jour entier en fuseau local : un événement
 * reste « à venir » toute sa journée. Les pages qui affichent ces listes
 * sont statiques et revalidées quotidiennement (`revalidate = 86400`) :
 * ce filtre par jour garantit qu'aucun événement périmé ne reste affiché
 * entre deux revalidations.
 */

import type { Evenement } from "@/data/evenements";
import { isoLocal } from "@/lib/creneaux";

/** Vrai si l'événement daté est passé. Un rendez-vous récurrent n'expire jamais. */
export function evenementPasse(evt: Evenement, maintenant: Date = new Date()): boolean {
  if (!evt.date) return false;
  // Comparaison lexicographique valide sur le format yyyy-mm-dd.
  return evt.date < isoLocal(maintenant);
}

/** Événements à afficher : datés futurs (triés par date croissante),
 *  puis les rendez-vous récurrents en fin de liste. */
export function evenementsAVenir(
  liste: readonly Evenement[],
  maintenant: Date = new Date()
): Evenement[] {
  const dates = liste
    .filter((e) => e.date && !evenementPasse(e, maintenant))
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));
  const recurrents = liste.filter((e) => !e.date);
  return [...dates, ...recurrents];
}

/** Sous-ensemble daté futur uniquement — pour le JSON-LD Event
 *  (un récurrent exigerait un Schedule schema.org, hors périmètre). */
export function evenementsDates(
  liste: readonly Evenement[],
  maintenant: Date = new Date()
): Evenement[] {
  return evenementsAVenir(liste, maintenant).filter((e) => Boolean(e.date));
}
