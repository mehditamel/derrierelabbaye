import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* On mocke le service pour piloter la confirmation sans réseau. */
vi.mock("@/services/reservation", () => ({
  createReservation: vi.fn(),
}));

import { createReservation } from "@/services/reservation";
import { ReservationForm } from "@/components/site/ReservationForm";

afterEach(() => vi.mocked(createReservation).mockReset());

describe("ReservationForm", () => {
  it("signale le nom manquant au blur et n'appelle pas le service", async () => {
    const user = userEvent.setup();
    render(<ReservationForm />);

    // Le champ est requis (HTML natif) : on déclenche la validation custom
    // en quittant le champ vide, puis on vérifie qu'aucun envoi n'a lieu.
    await user.click(screen.getByPlaceholderText(/votre nom/i));
    await user.tab();

    expect(screen.getByText(/indiquez un nom pour la réservation/i)).toBeInTheDocument();
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("affiche un message d'erreur pour un e-mail incomplet", async () => {
    const user = userEvent.setup();
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    await user.type(screen.getByPlaceholderText("vous@exemple.fr"), "camille@exemple");
    await user.tab();

    expect(screen.getByText(/cette adresse semble incomplète/i)).toBeInTheDocument();
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("transmet l'e-mail saisi et le piège à robots vide", async () => {
    const user = userEvent.setup();
    vi.mocked(createReservation).mockResolvedValue({ ok: true, reference: "DLA-7F3K" });
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    await user.type(screen.getByPlaceholderText("vous@exemple.fr"), "camille@exemple.fr");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => expect(createReservation).toHaveBeenCalled());
    expect(vi.mocked(createReservation).mock.calls[0][0]).toMatchObject({
      nom: "Camille",
      email: "camille@exemple.fr",
      societe: "",
    });
  });

  it("garde le piège à robots hors du parcours clavier et des lecteurs d'écran", () => {
    const { container } = render(<ReservationForm />);
    const piege = container.querySelector("#societe") as HTMLInputElement;

    expect(piege).not.toBeNull();
    expect(piege.tabIndex).toBe(-1);
    expect(piege.closest("[aria-hidden='true']")).not.toBeNull();
    // aria-hidden le retire de l'arbre d'accessibilité : aucun rôle exposé.
    expect(screen.queryByRole("textbox", { name: /société/i })).toBeNull();
  });

  it("affiche un message d'erreur pour un téléphone incomplet", async () => {
    const user = userEvent.setup();
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    const tel = screen.getByPlaceholderText("06 12 34 56 78");
    await user.type(tel, "06 12");
    await user.tab();

    expect(screen.getByText(/ce numéro semble incomplet/i)).toBeInTheDocument();
  });

  it("refuse une demande sans téléphone ni e-mail et le dit à l'écran", async () => {
    const user = userEvent.setup();
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));

    expect(screen.getByText(/laissez un téléphone ou un e-mail/i)).toBeInTheDocument();
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("lève l'exigence de contact dès qu'une adresse est saisie", async () => {
    vi.mocked(createReservation).mockResolvedValue({ ok: true, reference: "DLA-7F3K" });
    const user = userEvent.setup();
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));
    expect(screen.getByText(/laissez un téléphone ou un e-mail/i)).toBeInTheDocument();

    // Le message s'affiche sous le téléphone : renseigner l'e-mail doit le lever.
    await user.type(screen.getByPlaceholderText("vous@exemple.fr"), "camille@exemple.fr");
    expect(screen.queryByText(/laissez un téléphone ou un e-mail/i)).toBeNull();

    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));
    await waitFor(() => expect(createReservation).toHaveBeenCalledTimes(1));
  });

  it("confirme la demande et affiche la référence", async () => {
    vi.mocked(createReservation).mockResolvedValue({
      ok: true,
      reference: "DLA-9F3K",
    });
    const user = userEvent.setup();
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    await user.type(screen.getByPlaceholderText("06 12 34 56 78"), "06 12 34 56 78");
    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /demande envoyée/i })).toBeInTheDocument()
    );
    expect(screen.getByText(/DLA-9F3K/)).toBeInTheDocument();
    expect(createReservation).toHaveBeenCalledTimes(1);
  });

  it("permet de relancer une nouvelle demande", async () => {
    vi.mocked(createReservation).mockResolvedValue({
      ok: true,
      reference: "DLA-9F3K",
    });
    const user = userEvent.setup();
    render(<ReservationForm />);

    await user.type(screen.getByPlaceholderText(/votre nom/i), "Camille");
    await user.type(screen.getByPlaceholderText("06 12 34 56 78"), "06 12 34 56 78");
    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));
    await screen.findByRole("heading", { name: /demande envoyée/i });

    await user.click(screen.getByRole("button", { name: /nouvelle demande/i }));
    expect(screen.getByRole("button", { name: /envoyer la demande/i })).toBeInTheDocument();
  });
});
