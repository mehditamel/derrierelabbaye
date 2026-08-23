import { beforeEach, describe, expect, it } from "vitest";
import { autoriser, reinitialiserLimites } from "@/lib/limiteDebit";

const fenetres = [{ max: 3, dureeMs: 60_000 }];

beforeEach(() => reinitialiserLimites());

describe("autoriser", () => {
  it("laisse passer jusqu'au quota puis refuse", () => {
    const t = 1_000_000;
    expect(autoriser("ip-a", t, fenetres)).toBe(true);
    expect(autoriser("ip-a", t, fenetres)).toBe(true);
    expect(autoriser("ip-a", t, fenetres)).toBe(true);
    expect(autoriser("ip-a", t, fenetres)).toBe(false);
  });

  it("ne comptabilise pas les tentatives refusées", () => {
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) autoriser("ip-b", t, fenetres);
    // Trois passages seulement ont été retenus : la fenêtre se libère d'un coup.
    expect(autoriser("ip-b", t + 60_001, fenetres)).toBe(true);
  });

  it("compte chaque appareil séparément", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) autoriser("ip-c", t, fenetres);
    expect(autoriser("ip-c", t, fenetres)).toBe(false);
    expect(autoriser("ip-d", t, fenetres)).toBe(true);
  });

  it("rouvre le quota une fois la fenêtre écoulée", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) autoriser("ip-e", t, fenetres);
    expect(autoriser("ip-e", t + 30_000, fenetres)).toBe(false);
    expect(autoriser("ip-e", t + 60_001, fenetres)).toBe(true);
  });

  it("applique la plus stricte de plusieurs fenêtres", () => {
    const multi = [
      { max: 2, dureeMs: 10_000 },
      { max: 3, dureeMs: 60_000 },
    ];
    const t = 1_000_000;
    expect(autoriser("ip-f", t, multi)).toBe(true);
    expect(autoriser("ip-f", t, multi)).toBe(true);
    expect(autoriser("ip-f", t, multi)).toBe(false); // fenêtre courte saturée
    expect(autoriser("ip-f", t + 11_000, multi)).toBe(true); // elle s'est rouverte
    expect(autoriser("ip-f", t + 12_000, multi)).toBe(false); // quota horaire atteint
  });
});
