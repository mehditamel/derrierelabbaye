import { describe, expect, it } from "vitest";
import { parseSinglePrice } from "@/lib/prix";

describe("parseSinglePrice", () => {
  it("extrait un prix entier", () => {
    expect(parseSinglePrice("7 €")).toBe("7");
  });

  it("normalise la virgule décimale en point", () => {
    expect(parseSinglePrice("3,50 €")).toBe("3.50");
  });

  it("refuse une fourchette (plusieurs nombres)", () => {
    expect(parseSinglePrice("12 – 15 €")).toBeNull();
  });

  it("refuse une chaîne sans nombre, vide ou absente", () => {
    expect(parseSinglePrice("prix du marché")).toBeNull();
    expect(parseSinglePrice("")).toBeNull();
    expect(parseSinglePrice(undefined)).toBeNull();
  });
});
