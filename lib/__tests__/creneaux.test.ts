import { describe, expect, it } from "vitest";
import {
  isoLocal,
  creneauPasse,
  premierCreneauDisponible,
  dateLongueFr,
} from "@/lib/creneaux";

describe("isoLocal", () => {
  it("formate une date en yyyy-mm-dd local", () => {
    // Midi local : pas de glissement de fuseau.
    expect(isoLocal(new Date(2026, 5, 9, 12, 0, 0))).toBe("2026-06-09");
  });

  it("complète les mois et jours sur deux chiffres", () => {
    expect(isoLocal(new Date(2026, 0, 5, 12, 0, 0))).toBe("2026-01-05");
  });
});

describe("creneauPasse", () => {
  const jour = "2026-06-09";

  it("considère passé un créneau dans moins de 30 minutes", () => {
    const maintenant = new Date(`${jour}T19:45:00`);
    expect(creneauPasse(jour, "20:00", maintenant)).toBe(true);
  });

  it("garde disponible un créneau au-delà de la marge", () => {
    const maintenant = new Date(`${jour}T19:00:00`);
    expect(creneauPasse(jour, "20:00", maintenant)).toBe(false);
  });

  it("considère passé un créneau déjà écoulé", () => {
    const maintenant = new Date(`${jour}T21:00:00`);
    expect(creneauPasse(jour, "20:00", maintenant)).toBe(true);
  });
});

describe("premierCreneauDisponible", () => {
  const heures = ["19:00", "20:00", "21:00", "22:00"];

  it("renvoie le premier créneau encore ouvert", () => {
    const maintenant = new Date("2026-06-09T20:15:00");
    expect(premierCreneauDisponible("2026-06-09", heures, maintenant)).toBe(
      "21:00"
    );
  });

  it("renvoie undefined si la soirée est passée", () => {
    const maintenant = new Date("2026-06-09T23:30:00");
    expect(
      premierCreneauDisponible("2026-06-09", heures, maintenant)
    ).toBeUndefined();
  });
});

describe("dateLongueFr", () => {
  it("formate une date en toutes lettres en français", () => {
    expect(dateLongueFr("2026-06-09")).toBe("mardi 9 juin");
  });
});
