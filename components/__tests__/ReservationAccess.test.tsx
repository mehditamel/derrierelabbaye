import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ReservationEnLigne as ReservationAccess } from "@/components/ReservationEnLigne";

afterEach(() => vi.unstubAllGlobals());
it("propose le téléphone sans collecter les coordonnées si le service manque", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ disponible: false }) });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <ReservationAccess>
      <input aria-label="Nom" />
    </ReservationAccess>
  );
  await screen.findByText(/nous prenons votre demande/i);
  expect(screen.queryByLabelText("Nom")).toBeNull();
  expect(screen.getByRole("link", { name: "06 44 76 91 74" })).toHaveAttribute(
    "href",
    "tel:+33644769174"
  );
  expect(fetchMock.mock.calls[0][1].cache).toBe("no-store");
});
it("affiche le formulaire lorsque l'envoi est configuré", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ disponible: true }) })
  );
  render(
    <ReservationAccess>
      <input aria-label="Nom" />
    </ReservationAccess>
  );
  expect(await screen.findByLabelText("Nom")).toBeVisible();
});
it("signale explicitement une démonstration", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ disponible: true, demonstration: true }),
    })
  );
  render(
    <ReservationAccess>
      <input aria-label="Nom" />
    </ReservationAccess>
  );
  expect(await screen.findByText(/aucune demande ne sera envoyée/i)).toBeVisible();
});
it("garde le téléphone et permet une nouvelle tentative après une panne réseau", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  render(
    <ReservationAccess>
      <input aria-label="Nom" />
    </ReservationAccess>
  );
  expect(await screen.findByRole("button", { name: /réessayer/i })).toBeVisible();
  expect(screen.queryByLabelText("Nom")).toBeNull();
});
