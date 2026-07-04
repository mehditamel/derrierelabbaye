import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

/* On mocke le partage et l'ICS pour observer les appels sans effets de bord. */
vi.mock("@/lib/partage", () => ({
  partagerOuCopier: vi.fn(),
}));
vi.mock("@/lib/ics", () => ({
  telechargerIcs: vi.fn(),
}));

import { partagerOuCopier } from "@/lib/partage";
import { telechargerIcs } from "@/lib/ics";
import { useRecapReservation } from "@/lib/useRecapReservation";

const recap = { date: "2026-06-09", heure: "20:00", couverts: 2 };

afterEach(() => {
  vi.mocked(partagerOuCopier).mockReset();
  vi.mocked(telechargerIcs).mockReset();
  vi.useRealTimers();
});

describe("useRecapReservation", () => {
  it("partage le récapitulatif complet (date longue, couverts, référence)", async () => {
    vi.mocked(partagerOuCopier).mockResolvedValue("partage");
    const { result } = renderHook(() => useRecapReservation(recap, "DLA-7F3K"));

    await act(() => result.current.partager());

    expect(partagerOuCopier).toHaveBeenCalledWith({
      title: "Réservation — Derrière l'Abbaye",
      text: "Réservation chez Derrière l'Abbaye — mardi 9 juin à 20:00, 2 couverts. Référence DLA-7F3K.",
    });
    // Partage natif : pas de mention « copié ».
    expect(result.current.copie).toBe(false);
  });

  it("affiche « copié » après une copie, puis retombe après 1,8 s", async () => {
    vi.useFakeTimers();
    vi.mocked(partagerOuCopier).mockResolvedValue("copie");
    const { result } = renderHook(() => useRecapReservation(recap, "DLA-7F3K"));

    await act(() => result.current.partager());
    expect(result.current.copie).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(result.current.copie).toBe(false);
  });

  it("télécharge le .ics avec le bon récapitulatif", () => {
    const { result } = renderHook(() => useRecapReservation(recap, "DLA-7F3K"));

    act(() => result.current.ajouterAuCalendrier());

    expect(telechargerIcs).toHaveBeenCalledWith({
      dateIso: "2026-06-09",
      heure: "20:00",
      couverts: 2,
      reference: "DLA-7F3K",
    });
  });

  it("ne fait rien sans récapitulatif", async () => {
    const { result } = renderHook(() => useRecapReservation(null, "DLA-7F3K"));

    await act(() => result.current.partager());
    act(() => result.current.ajouterAuCalendrier());

    expect(partagerOuCopier).not.toHaveBeenCalled();
    expect(telechargerIcs).not.toHaveBeenCalled();
  });

  it("réinitialise l'état « copié » (Nouvelle demande)", async () => {
    vi.mocked(partagerOuCopier).mockResolvedValue("copie");
    const { result } = renderHook(() => useRecapReservation(recap, "DLA-7F3K"));

    await act(() => result.current.partager());
    expect(result.current.copie).toBe(true);

    act(() => result.current.reinitialiser());
    expect(result.current.copie).toBe(false);
  });
});
