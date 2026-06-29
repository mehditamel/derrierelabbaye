import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  getSupabase: vi.fn(),
}));

import { getSupabase } from "@/lib/supabase";
import { createReservation } from "@/services/reservation";

const payload = {
  date: "2026-07-01",
  heure: "20:00",
  couverts: 2,
  nom: "Camille",
};

afterEach(() => vi.mocked(getSupabase).mockReset());

describe("createReservation", () => {
  it("rejette un payload incomplet", async () => {
    vi.mocked(getSupabase).mockReturnValue(null);
    await expect(createReservation({ ...payload, nom: "" })).rejects.toThrow(/incomplètes/i);
  });

  it("simule l'enregistrement quand Supabase n'est pas configuré", async () => {
    vi.mocked(getSupabase).mockReturnValue(null);
    const res = await createReservation(payload);
    expect(res.ok).toBe(true);
    expect(res.reference).toMatch(/^DLA-[A-Z0-9]{4}$/);
  });

  it("insère dans Supabase quand il est configuré", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    vi.mocked(getSupabase).mockReturnValue({ from } as never);

    const res = await createReservation(payload);

    expect(from).toHaveBeenCalledWith("reservations");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: res.reference,
        nom: "Camille",
        couverts: 2,
        telephone: null,
      })
    );
    expect(res.ok).toBe(true);
  });

  it("remonte une erreur si l'insertion échoue", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "boom" } });
    const from = vi.fn().mockReturnValue({ insert });
    vi.mocked(getSupabase).mockReturnValue({ from } as never);

    await expect(createReservation(payload)).rejects.toThrow(/n'a pas pu/i);
  });
});
