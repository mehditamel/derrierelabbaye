import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

/* Le hook isole l'appel `createReservation` : on le mocke pour piloter
   succès / échec sans toucher au service réel. */
vi.mock("@/services/reservation", () => ({
  createReservation: vi.fn(),
}));

import { createReservation } from "@/services/reservation";
import {
  contactJoignable,
  emailValide,
  MESSAGE_CONTACT_MANQUANT,
  telephoneValide,
  useReservationForm,
} from "@/lib/useReservationForm";

const payloadValide = {
  date: "2026-07-01",
  heure: "20:00",
  couverts: 2,
  nom: "Camille",
  // Une demande doit toujours porter un moyen de rappel (cf. contactJoignable).
  telephone: "06 12 34 56 78",
};

describe("telephoneValide", () => {
  it("accepte un numéro vide (champ facultatif)", () => {
    expect(telephoneValide("")).toBe(true);
    expect(telephoneValide("   ")).toBe(true);
  });

  it("accepte les formats français usuels", () => {
    expect(telephoneValide("06 12 34 56 78")).toBe(true);
    expect(telephoneValide("0612345678")).toBe(true);
    expect(telephoneValide("+33 6 12 34 56 78")).toBe(true);
  });

  it("rejette un numéro manifestement incomplet", () => {
    expect(telephoneValide("06 12")).toBe(false);
    expect(telephoneValide("abc")).toBe(false);
  });
});

describe("emailValide", () => {
  it("accepte une adresse vide (champ facultatif)", () => {
    expect(emailValide("")).toBe(true);
    expect(emailValide("   ")).toBe(true);
  });

  it("accepte les adresses usuelles", () => {
    expect(emailValide("camille@exemple.fr")).toBe(true);
    expect(emailValide("c.dupont+resa@sous.domaine.co.uk")).toBe(true);
  });

  it("rejette une adresse manifestement invalide", () => {
    expect(emailValide("camille@exemple")).toBe(false);
    expect(emailValide("camille.exemple.fr")).toBe(false);
    expect(emailValide("camille @exemple.fr")).toBe(false);
    expect(emailValide("@exemple.fr")).toBe(false);
  });

  it("bloque l'envoi et le signale à l'utilisateur", async () => {
    const { result } = renderHook(() => useReservationForm());
    await act(async () => {
      await result.current.submit({ ...payloadValide, email: "camille@exemple" });
    });
    expect(result.current.status).toBe("error");
    expect(result.current.erreur).toMatch(/adresse e-mail/i);
    expect(createReservation).not.toHaveBeenCalled();
  });
});

describe("contactJoignable", () => {
  it("accepte une demande qui laisse un téléphone seul", () => {
    expect(contactJoignable("06 12 34 56 78", "")).toBe(true);
  });

  it("accepte une demande qui laisse un e-mail seul", () => {
    expect(contactJoignable("", "camille@exemple.fr")).toBe(true);
  });

  it("rejette une demande sans aucun moyen de rappel", () => {
    expect(contactJoignable("", "")).toBe(false);
    expect(contactJoignable("   ", "  ")).toBe(false);
  });

  it("bloque l'envoi : le bar ne pourrait ni confirmer ni rappeler", async () => {
    const { result } = renderHook(() => useReservationForm());
    await act(async () => {
      await result.current.submit({ ...payloadValide, telephone: "", email: "" });
    });
    expect(createReservation).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.erreur).toBe(MESSAGE_CONTACT_MANQUANT);
  });
});

describe("useReservationForm", () => {
  afterEach(() => {
    vi.mocked(createReservation).mockReset();
  });

  it("passe par loading puis done et expose la référence", async () => {
    vi.mocked(createReservation).mockResolvedValue({
      ok: true,
      reference: "DLA-TEST",
    });
    const { result } = renderHook(() => useReservationForm());

    expect(result.current.status).toBe("idle");
    expect(result.current.statusLabel).toBe("");

    await act(async () => {
      await result.current.submit(payloadValide);
    });

    expect(result.current.status).toBe("done");
    expect(result.current.reference).toBe("DLA-TEST");
    expect(createReservation).toHaveBeenCalledWith(payloadValide);
  });

  it("annonce un libellé pendant l'envoi", async () => {
    let resoudre: (v: { ok: boolean; reference: string }) => void = () => {};
    vi.mocked(createReservation).mockImplementation(() => new Promise((r) => (resoudre = r)));
    const { result } = renderHook(() => useReservationForm());

    let promesse: Promise<void>;
    act(() => {
      promesse = result.current.submit(payloadValide);
    });

    await waitFor(() => expect(result.current.status).toBe("loading"));
    expect(result.current.statusLabel).toMatch(/en cours/i);

    await act(async () => {
      resoudre({ ok: true, reference: "DLA-OK" });
      await promesse;
    });
    expect(result.current.status).toBe("done");
  });

  it("bloque sur un téléphone invalide sans appeler le service", async () => {
    const { result } = renderHook(() => useReservationForm());

    await act(async () => {
      await result.current.submit({ ...payloadValide, telephone: "06 12" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.erreur).toMatch(/téléphone/i);
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("passe en erreur si le service échoue", async () => {
    vi.mocked(createReservation).mockRejectedValue(new Error("Service indisponible."));
    const { result } = renderHook(() => useReservationForm());

    await act(async () => {
      await result.current.submit(payloadValide);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.erreur).toBe("Service indisponible.");
  });

  it("reset ramène à l'état initial", async () => {
    vi.mocked(createReservation).mockResolvedValue({
      ok: true,
      reference: "DLA-RST",
    });
    const { result } = renderHook(() => useReservationForm());

    await act(async () => {
      await result.current.submit(payloadValide);
    });
    expect(result.current.status).toBe("done");

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.erreur).toBe("");
  });
});
