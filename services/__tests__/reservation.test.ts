import { afterEach, describe, expect, it, vi } from "vitest";
import { createReservation } from "@/services/reservation";

const payload = {
  date: "2026-07-01",
  heure: "20:00",
  couverts: 2,
  nom: "Camille",
};

function reponse(corps: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => corps } as unknown as Response;
}

afterEach(() => vi.unstubAllGlobals());

describe("createReservation", () => {
  it("rejette un payload incomplet sans appeler le serveur", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(createReservation({ ...payload, nom: "" })).rejects.toThrow(/incomplètes/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("poste la demande à /api/reservations et renvoie la référence du serveur", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reponse({ ok: true, reference: "DLA-7F3K" }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await createReservation({ ...payload, telephone: "06 12 34 56 78" });

    expect(res).toEqual({ ok: true, reference: "DLA-7F3K" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/reservations");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ nom: "Camille", couverts: 2 });
  });

  it("remonte le message d'erreur du serveur", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(reponse({ ok: false, erreur: "Trop de demandes." }, false, 429))
    );
    await expect(createReservation(payload)).rejects.toThrow("Trop de demandes.");
  });

  it("ne prétend jamais avoir réussi si le réseau échoue", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(createReservation(payload)).rejects.toThrow(/n'a pas pu être envoyée/i);
  });

  it("traite une réponse illisible comme un échec", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("pas du JSON");
        },
      } as unknown as Response)
    );
    await expect(createReservation(payload)).rejects.toThrow(/n'a pas pu être envoyée/i);
  });
});
