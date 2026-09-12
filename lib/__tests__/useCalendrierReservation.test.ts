import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dateValide, jourReservable, prochaineDateReservable } from "@/lib/creneaux";
import { useCalendrierReservation } from "@/lib/useCalendrierReservation";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("calendrier de Marseille", () => {
  it.each(["2026-02-29", "2028-02-30", "2026-13-01", "2026-07-01-suite"])(
    "refuse la date impossible %s",
    (date) => expect(dateValide(date)).toBe(false)
  );
  it("accepte le 29 février d'une année bissextile", () =>
    expect(dateValide("2028-02-29")).toBe(true));
  it("exclut le lundi soir mais garde le dimanche", () => {
    expect(jourReservable("2026-09-14")).toBe(false);
    expect(jourReservable("2026-09-13")).toBe(true);
  });
  it("propose mardi lorsque la soirée du dimanche est terminée", () => {
    expect(prochaineDateReservable(new Date("2026-09-13T22:10:00+02:00"))).toBe("2026-09-15");
  });
  it("actualise les créneaux quand un onglet reste ouvert", () => {
    vi.setSystemTime(new Date("2026-09-12T19:29:30+02:00"));
    const { result } = renderHook(() => useCalendrierReservation());
    expect(result.current.heure).toBe("20:00");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.heure).toBe("20:30");
  });
  it("ne laisse plus envoyer la date de la veille au retour sur l'onglet", () => {
    vi.setSystemTime(new Date("2026-09-12T19:00:00+02:00"));
    const { result } = renderHook(() => useCalendrierReservation());
    vi.setSystemTime(new Date("2026-09-13T00:01:00+02:00"));
    act(() => window.dispatchEvent(new Event("focus")));
    expect(result.current.disponible).toBe(false);
  });
});
