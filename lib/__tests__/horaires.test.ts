import { describe, expect, it } from "vitest";
import { etatOuverture } from "@/lib/horaires";

/* Les horaires testés proviennent de data/site.ts :
   Mar–Jeu 17:00→01:00, Ven–Sam 17:00→02:00, Dim 17:00→00:00, Lun fermé.
   Les dates sont fixées en heure de Paris (suffixe +02:00, été). */

describe("etatOuverture", () => {
  it("est fermé un lundi soir", () => {
    const etat = etatOuverture(new Date("2026-06-15T20:00:00+02:00"));
    expect(etat.ouvert).toBe(false);
  });

  it("est ouvert un mardi soir après 17h", () => {
    const etat = etatOuverture(new Date("2026-06-16T20:00:00+02:00"));
    expect(etat.ouvert).toBe(true);
    expect(etat.libelle).toContain("ferme à 01h00");
  });

  it("est fermé un mardi en fin d'après-midi avant l'ouverture", () => {
    const etat = etatOuverture(new Date("2026-06-16T16:00:00+02:00"));
    expect(etat.ouvert).toBe(false);
    expect(etat.libelle).toContain("ouvre");
  });

  it("est encore ouvert après minuit (débordement de la veille)", () => {
    // Nuit de mercredi à jeudi, 00h30 : créneau du mercredi ferme à 01h00.
    const etat = etatOuverture(new Date("2026-06-18T00:30:00+02:00"));
    expect(etat.ouvert).toBe(true);
  });

  it("est fermé après l'heure de fermeture", () => {
    // Jeudi 01h30 : le créneau de mercredi (→01h00) est terminé.
    const etat = etatOuverture(new Date("2026-06-18T01:30:00+02:00"));
    expect(etat.ouvert).toBe(false);
  });
});

/* Les deux bords les moins évidents du calendrier, tracés à la main : la
   logique est correcte aujourd'hui, mais ce sont les branches qu'une
   modification d'horaires casserait en premier. */
describe("etatOuverture — bords de calendrier", () => {
  it("dit « ferme à minuit » le dimanche soir (fermeture à 00:00)", () => {
    // Dimanche 23h30 — la fermeture 00:00 ne doit pas être lue comme « déjà fermé ».
    const etat = etatOuverture(new Date("2026-06-07T21:30:00Z"));
    expect(etat.ouvert).toBe(true);
    expect(etat.libelle).toMatch(/minuit/i);
  });

  it("reste ouvert dans la nuit du samedi au dimanche jusqu'à 02h00", () => {
    // Dimanche 01h30 à Paris : débordement de la soirée du samedi.
    const etat = etatOuverture(new Date("2026-06-06T23:30:00Z"));
    expect(etat.ouvert).toBe(true);
  });

  it("est fermé le lundi matin après le débordement du dimanche", () => {
    // Lundi 00h30 : le dimanche ferme à minuit, le lundi est fermé.
    const etat = etatOuverture(new Date("2026-06-07T22:30:00Z"));
    expect(etat.ouvert).toBe(false);
    expect(etat.libelle).toMatch(/mardi/i);
  });
});
