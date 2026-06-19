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
