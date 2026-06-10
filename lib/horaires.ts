/* =====================================================================
   Horaires d'ouverture — état « ouvert / fermé » en heure de Paris,
   calculé depuis site.horairesSchema (gère les fermetures après minuit).
   ===================================================================== */

import { site } from "@/data/site";

export type EtatOuverture = {
  ouvert: boolean;
  /** « Ouvert · ferme à 01h00 » / « Fermé · ouvre mardi à 17h00 » */
  libelle: string;
};

const JOURS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const JOURS_FR: Record<string, string> = {
  Sunday: "dimanche",
  Monday: "lundi",
  Tuesday: "mardi",
  Wednesday: "mercredi",
  Thursday: "jeudi",
  Friday: "vendredi",
  Saturday: "samedi",
};

type Creneau = { ouvre: number; ferme: number; fermeAffichage: string };

/** "17:00" → 1020 (minutes depuis minuit). */
function enMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + m;
}

/** "01:00" → "01h00", "00:00" → "minuit". */
function affichageHeure(heure: string): string {
  return heure === "00:00" ? "minuit" : heure.replace(":", "h");
}

/** Créneau du jour donné (nom anglais), ou null si fermé ce jour-là. */
function creneauDuJour(jour: string): Creneau | null {
  const spec = site.horairesSchema.find((h) =>
    (h.jours as readonly string[]).includes(jour)
  );
  if (!spec) return null;
  return {
    ouvre: enMinutes(spec.ouvre),
    ferme: enMinutes(spec.ferme),
    fermeAffichage: affichageHeure(spec.ferme),
  };
}

/** Le créneau déborde-t-il après minuit ? (ferme ≤ ouvre, ex. 17:00 → 01:00) */
function debordeApresMinuit(c: Creneau): boolean {
  return c.ferme <= c.ouvre;
}

/** Jour de la semaine et minutes écoulées, en heure de Paris. */
function maintenantParis(date: Date): { jour: string; minutes: number } {
  const parties = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const valeur = (type: string) =>
    parties.find((p) => p.type === type)?.value ?? "";
  // Certains moteurs rendent « 24 » pour minuit en cycle h24.
  const heure = Number(valeur("hour")) % 24;
  return { jour: valeur("weekday"), minutes: heure * 60 + Number(valeur("minute")) };
}

/**
 * État d'ouverture à l'instant donné (par défaut : maintenant).
 * Le bar est ouvert si le créneau du jour a commencé, ou si celui de la
 * veille déborde encore après minuit.
 */
export function etatOuverture(date: Date = new Date()): EtatOuverture {
  const { jour, minutes } = maintenantParis(date);
  const indexJour = JOURS_EN.indexOf(jour as (typeof JOURS_EN)[number]);
  const hier = JOURS_EN[(indexJour + 6) % 7];

  // Encore ouvert depuis hier soir ?
  const creneauHier = creneauDuJour(hier);
  if (
    creneauHier &&
    debordeApresMinuit(creneauHier) &&
    minutes < creneauHier.ferme
  ) {
    return {
      ouvert: true,
      libelle: `Ouvert · ferme à ${creneauHier.fermeAffichage}`,
    };
  }

  // Ouvert depuis ce soir ?
  const creneauJour = creneauDuJour(jour);
  if (
    creneauJour &&
    minutes >= creneauJour.ouvre &&
    (debordeApresMinuit(creneauJour) || minutes < creneauJour.ferme)
  ) {
    return {
      ouvert: true,
      libelle: `Ouvert · ferme à ${creneauJour.fermeAffichage}`,
    };
  }

  // Fermé : prochaine ouverture (aujourd'hui plus tard, sinon les jours suivants).
  for (let decalage = 0; decalage < 7; decalage++) {
    const candidat = JOURS_EN[(indexJour + decalage) % 7];
    const creneau = creneauDuJour(candidat);
    if (!creneau) continue;
    if (decalage === 0 && minutes >= creneau.ouvre) continue;
    const heure = affichageHeure(
      `${String(Math.floor(creneau.ouvre / 60)).padStart(2, "0")}:${String(
        creneau.ouvre % 60
      ).padStart(2, "0")}`
    );
    const quand = decalage === 0 ? "" : ` ${JOURS_FR[candidat]}`;
    return { ouvert: false, libelle: `Fermé · ouvre${quand} à ${heure}` };
  }

  return { ouvert: false, libelle: "Fermé" };
}
