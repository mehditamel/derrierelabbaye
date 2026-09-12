/**
 * Helpers de dates et de créneaux partagés par les formulaires de
 * réservation (site + mobile). Le calendrier et les créneaux suivent
 * Europe/Paris, indépendamment du fuseau du navigateur.
 */

import { site } from "@/data/site";

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

/** Refuse notamment les dates que Date normaliserait (31 février, etc.). */
export function dateValide(dateIso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return false;
  const date = new Date(`${dateIso}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === dateIso;
}

/** Jour de service : le lundi soir est fermé, même si le dimanche finit à 2 h. */
export function jourReservable(dateIso: string): boolean {
  if (!dateValide(dateIso)) return false;
  const jour = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(
    new Date(`${dateIso}T12:00:00Z`)
  );
  return site.horairesSchema.some((h) => (h.jours as readonly string[]).includes(jour));
}

export function ajouterJours(dateIso: string, nombre: number): string {
  const date = new Date(`${dateIso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + nombre);
  return date.toISOString().slice(0, 10);
}

export function prochaineDateReservable(maintenant: Date): string {
  const aujourdHui = isoAParis(maintenant);
  for (let i = 0; i < 8; i++) {
    const date = ajouterJours(aujourdHui, i);
    if (premierCreneauDisponible(date, CRENEAUX_RESERVATION, maintenant)) return date;
  }
  return aujourdHui;
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
  return creneauPasseAParis(dateIso, heure, maintenant);
}

/** Premier créneau encore disponible pour `dateIso`, ou undefined si la soirée est passée. */
export function premierCreneauDisponible(
  dateIso: string,
  heures: readonly string[],
  maintenant: Date = new Date()
): string | undefined {
  if (!jourReservable(dateIso)) return undefined;
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
