import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* On mocke le service pour piloter la confirmation sans réseau. */
vi.mock("@/services/reservation", () => ({
  createReservation: vi.fn(),
}));

import { createReservation } from "@/services/reservation";
import { MobileReserver } from "@/components/mobile/MobileReserver";

/* L'écran dépend de l'horloge (créneaux passés grisés, CTA désactivé le soir) :
   on fige un après-midi pour des tests stables à toute heure de CI. */
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-06-09T15:00:00"));
});

afterEach(() => {
  vi.mocked(createReservation).mockReset();
  vi.useRealTimers();
  // Les coordonnées sont persistées (dla-reservation-contact) : on isole les tests.
  window.localStorage.clear();
});

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

describe("MobileReserver", () => {
  it("affiche des labels visibles pour les coordonnées", () => {
    render(<MobileReserver />);

    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    // Groupes Date et Heure structurés en fieldset/legend.
    expect(screen.getByRole("group", { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /heure/i })).toBeInTheDocument();
  });

  it("signale le nom manquant au blur", async () => {
    const u = user();
    render(<MobileReserver />);

    await u.click(screen.getByLabelText(/nom/i));
    await u.tab();

    expect(screen.getByText(/indiquez un nom pour la réservation/i)).toBeInTheDocument();
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("affiche un message d'erreur pour un téléphone incomplet", async () => {
    const u = user();
    render(<MobileReserver />);

    await u.type(screen.getByLabelText(/téléphone/i), "06 12");
    await u.tab();

    expect(screen.getByText(/ce numéro semble incomplet/i)).toBeInTheDocument();
  });

  it("confirme la demande et affiche la référence", async () => {
    vi.mocked(createReservation).mockResolvedValue({ ok: true, reference: "DLA-9F3K" });
    const u = user();
    render(<MobileReserver />);

    await u.type(screen.getByLabelText(/nom/i), "Camille");
    await u.type(screen.getByLabelText(/téléphone/i), "06 12 34 56 78");
    await u.click(screen.getByRole("button", { name: /demander cette table/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /c'est noté/i })).toBeInTheDocument()
    );
    expect(screen.getByText(/DLA-9F3K/)).toBeInTheDocument();
    expect(createReservation).toHaveBeenCalledTimes(1);
  });

  it("permet de relancer une nouvelle demande", async () => {
    vi.mocked(createReservation).mockResolvedValue({ ok: true, reference: "DLA-9F3K" });
    const u = user();
    render(<MobileReserver />);

    await u.type(screen.getByLabelText(/nom/i), "Camille");
    await u.type(screen.getByLabelText(/téléphone/i), "06 12 34 56 78");
    await u.click(screen.getByRole("button", { name: /demander cette table/i }));
    await screen.findByRole("heading", { name: /c'est noté/i });

    await u.click(screen.getByRole("button", { name: /nouvelle demande/i }));
    expect(screen.getByRole("button", { name: /demander cette table/i })).toBeInTheDocument();
  });
});
