import { describe, expect, it } from "vitest";
import type { Evenement } from "@/data/evenements";
import { evenementPasse, evenementsAVenir, evenementsDates } from "@/lib/evenements";

/* Midi local : aucun glissement de fuseau dans isoLocal. */
const maintenant = new Date(2027, 0, 15, 12, 0, 0); // 15 janvier 2027

const passe: Evenement = { id: "p", titre: "Passé", description: "", date: "2027-01-10" };
const cejour: Evenement = { id: "j", titre: "Ce soir", description: "", date: "2027-01-15" };
const futur: Evenement = { id: "f", titre: "Futur", description: "", date: "2027-03-01" };
const proche: Evenement = { id: "n", titre: "Proche", description: "", date: "2027-02-01" };
const recurrent: Evenement = {
  id: "r",
  titre: "Récurrent",
  description: "",
  recurrence: "Tous les jeudis",
};

describe("evenementPasse", () => {
  it("considère passé un événement d'hier", () => {
    expect(evenementPasse(passe, maintenant)).toBe(true);
  });

  it("garde un événement toute sa journée", () => {
    expect(evenementPasse(cejour, maintenant)).toBe(false);
  });

  it("n'expire jamais un rendez-vous récurrent", () => {
    expect(evenementPasse(recurrent, maintenant)).toBe(false);
  });
});

describe("evenementsAVenir", () => {
  it("exclut les passés, trie les datés et met les récurrents en fin", () => {
    const liste = [recurrent, futur, passe, cejour, proche];
    expect(evenementsAVenir(liste, maintenant).map((e) => e.id)).toEqual(["j", "n", "f", "r"]);
  });

  it("renvoie une liste vide si tout est passé", () => {
    expect(evenementsAVenir([passe], maintenant)).toEqual([]);
  });
});

describe("evenementsDates", () => {
  it("ne garde que les événements datés futurs (pour le JSON-LD)", () => {
    const liste = [recurrent, futur, passe];
    expect(evenementsDates(liste, maintenant).map((e) => e.id)).toEqual(["f"]);
  });
});
