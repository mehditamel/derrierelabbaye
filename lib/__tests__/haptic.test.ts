import { afterEach, describe, expect, it, vi } from "vitest";
import { haptic } from "@/lib/haptic";

afterEach(() => vi.unstubAllGlobals());

describe("haptic", () => {
  it("déclenche la vibration avec le motif fourni", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });

    haptic([10, 20]);
    expect(vibrate).toHaveBeenCalledWith([10, 20]);

    haptic();
    expect(vibrate).toHaveBeenCalledWith(12); // motif par défaut
  });

  it("ne fait rien si l'API vibrate est absente", () => {
    vi.stubGlobal("navigator", {});
    expect(() => haptic()).not.toThrow();
  });

  it("avale une erreur de l'API sans planter", () => {
    const vibrate = vi.fn(() => {
      throw new Error("boom");
    });
    vi.stubGlobal("navigator", { vibrate });
    expect(() => haptic(5)).not.toThrow();
  });
});
