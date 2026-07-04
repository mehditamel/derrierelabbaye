import { describe, expect, it } from "vitest";
import { avantages, prochainAvantage, avantageFranchi } from "@/services/loyalty";

describe("prochainAvantage", () => {
  it("renvoie le premier palier pour un nouveau membre", () => {
    expect(prochainAvantage(0)).toEqual(avantages[0]); // seuil 50
  });

  it("renvoie le palier suivant selon les points", () => {
    expect(prochainAvantage(80)?.seuil).toBe(120);
    expect(prochainAvantage(120)?.seuil).toBe(250);
  });

  it("renvoie null quand tous les paliers sont atteints", () => {
    expect(prochainAvantage(250)).toBeNull();
    expect(prochainAvantage(999)).toBeNull();
  });
});

describe("avantageFranchi", () => {
  it("détecte le palier franchi entre deux totaux", () => {
    expect(avantageFranchi(40, 60)?.seuil).toBe(50);
    expect(avantageFranchi(100, 120)?.seuil).toBe(120);
  });

  it("renvoie null sans franchissement", () => {
    expect(avantageFranchi(50, 50)).toBeNull();
    expect(avantageFranchi(60, 100)).toBeNull();
  });

  it("renvoie le premier palier si plusieurs sont franchis d'un coup", () => {
    expect(avantageFranchi(0, 300)?.seuil).toBe(50);
  });
});
