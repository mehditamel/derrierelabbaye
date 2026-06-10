/* =====================================================================
   iCalendar (RFC 5545) — fichier .ics généré côté client, sans dépendance.
   Heures exprimées en Europe/Paris via un VTIMEZONE statique : l'événement
   reste à la bonne heure même si le téléphone est resté sur un autre fuseau.
   ===================================================================== */

import { site } from "@/data/site";

export type EvenementReservation = {
  dateIso: string; // "2026-06-15"
  heure: string; // "20:00"
  couverts: number;
  reference: string; // "DLA-7F3K"
};

const DUREE_MINUTES = 120;

/** Échappement des valeurs texte (RFC 5545 §3.3.11). */
function echapper(texte: string): string {
  return texte
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

const encodeur = new TextEncoder();

/** Pliage des lignes : ≤ 75 octets, continuation par CRLF + espace. */
function plier(ligne: string): string {
  const morceaux: string[] = [];
  let courante = "";
  let octets = 0;
  for (const caractere of ligne) {
    const taille = encodeur.encode(caractere).length;
    if (octets + taille > 73) {
      morceaux.push(courante);
      courante = " ";
      octets = 1;
    }
    courante += caractere;
    octets += taille;
  }
  morceaux.push(courante);
  return morceaux.join("\r\n");
}

/** "2026-06-15" + "20:00" → Date locale (arithmétique en heure de table). */
function dateLocale(dateIso: string, heure: string): Date {
  return new Date(`${dateIso}T${heure}:00`);
}

/** Date → "YYYYMMDDTHHMMSS" (composants locaux, sans fuseau). */
function compactLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(
    d.getHours()
  )}${p(d.getMinutes())}00`;
}

export function genererIcs(evt: EvenementReservation): string {
  const debut = dateLocale(evt.dateIso, evt.heure);
  const fin = new Date(debut.getTime() + DUREE_MINUTES * 60 * 1000);
  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const hote = new URL(site.url).hostname;
  const adresse = `${site.nom}, ${site.adresse.rue}, ${site.adresse.codePostal} ${site.adresse.ville}, ${site.adresse.pays}`;
  const description = `Table pour ${evt.couverts} couvert${
    evt.couverts > 1 ? "s" : ""
  } — référence ${evt.reference}. Demande à confirmer par l'établissement.`;

  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Derriere l'Abbaye//Reservation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Paris",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${evt.reference}-${evt.dateIso}@${hote}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=Europe/Paris:${compactLocal(debut)}`,
    `DTEND;TZID=Europe/Paris:${compactLocal(fin)}`,
    `SUMMARY:${echapper(`Réservation ${site.nom}`)}`,
    `LOCATION:${echapper(adresse)}`,
    `DESCRIPTION:${echapper(description)}`,
    "STATUS:TENTATIVE",
    `URL:${site.url}/reserver`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lignes.map(plier).join("\r\n") + "\r\n";
}

/** Déclenche le téléchargement du .ics (navigateur uniquement). */
export function telechargerIcs(evt: EvenementReservation): void {
  const blob = new Blob([genererIcs(evt)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = `reservation-${evt.reference.toLowerCase()}.ics`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  // Révocation différée : Safari peut encore lire l'URL après le clic.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
