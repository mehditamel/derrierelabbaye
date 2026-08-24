/**
 * Helpers de dates et de créneaux partagés par les formulaires de
 * réservation (site + mobile). Tout est calculé en fuseau local :
 * `toISOString()` renverrait la date UTC, fausse entre minuit et 2 h
 * à Marseille.
 */

/** On ne propose plus un créneau qui démarre dans moins de 30 minutes. */
const MARGE_MINUTES = 30;

/** Créneaux de réservation proposés (dernier service 22:30).
 *  Source unique pour le formulaire du site et celui de la PWA.
 *  ⚑ À CONFIRMER par l'établissement. */
export const CRENEAUX_RESERVATION = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
] as const;

/** Fuseau de l'établissement. Le navigateur d'un client est presque toujours
 *  dessus, mais le serveur, lui, tourne en UTC sur Vercel : toute vérification
 *  côté serveur doit passer par les helpers « AParis » ci-dessous. */
const FUSEAU_BAR = "Europe/Paris";

const formatParis = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSEAU_BAR,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Date et heure « murales » à Marseille, quel que soit le fuseau de la machine. */
export function maintenantAParis(d: Date = new Date()): { date: string; heure: string } {
  const parts = new Map(formatParis.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    date: `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`,
    heure: `${parts.get("hour")}:${parts.get("minute")}`,
  };
}

/** Date du jour yyyy-mm-dd à Marseille — équivalent serveur de `isoLocal()`. */
export function isoAParis(d: Date = new Date()): string {
  return maintenantAParis(d).date;
}

/** Vrai si le créneau est déjà passé à l'heure de Marseille (même marge de 30 min).
 *
 *  Comparaison lexicographique de deux horodatages murals à format fixe : c'est
 *  exact sans jamais reconstruire une Date dans le fuseau du serveur. */
export function creneauPasseAParis(dateIso: string, heure: string, d: Date = new Date()): boolean {
  const limite = maintenantAParis(new Date(d.getTime() + MARGE_MINUTES * 60_000));
  return `${dateIso}T${heure}` <= `${limite.date}T${limite.heure}`;
}

/** Date au format yyyy-mm-dd dans le fuseau local. */
export function isoLocal(d: Date = new Date()): string {
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** Vrai si le créneau `heure` ("HH:MM") du jour `dateIso` est déjà passé. */
export function creneauPasse(
  dateIso: string,
  heure: string,
  maintenant: Date = new Date()
): boolean {
  const [h, m] = heure.split(":").map(Number);
  // "yyyy-mm-ddT00:00:00" (sans Z) est interprété en heure locale.
  const creneau = new Date(`${dateIso}T00:00:00`);
  creneau.setHours(h, m, 0, 0);
  return creneau.getTime() <= maintenant.getTime() + MARGE_MINUTES * 60_000;
}

/** Premier créneau encore disponible pour `dateIso`, ou undefined si la soirée est passée. */
export function premierCreneauDisponible(
  dateIso: string,
  heures: readonly string[],
  maintenant: Date = new Date()
): string | undefined {
  return heures.find((h) => !creneauPasse(dateIso, h, maintenant));
}

const formatLong = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const formatLongAvecAnnee = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** « mardi 9 juin » à partir d'une date yyyy-mm-dd (midi local : aucun glissement de fuseau).
 *  `annee: true` ajoute l'année — utile dans les e-mails, qui se relisent
 *  longtemps après l'envoi. */
export function dateLongueFr(dateIso: string, options?: { annee?: boolean }): string {
  const format = options?.annee ? formatLongAvecAnnee : formatLong;
  return format.format(new Date(`${dateIso}T12:00:00`));
}
