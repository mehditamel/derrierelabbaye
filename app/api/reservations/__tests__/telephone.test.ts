// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/reservations/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("bloque l'envoi même si une clé est présente lorsque le bar choisit le téléphone", async () => {
  vi.stubEnv("RESEND_API_KEY", "re_test");
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const reponse = await POST(
    new Request("http://localhost/api/reservations", { method: "POST", body: "{}" })
  );
  expect(reponse.status).toBe(503);
  expect((await reponse.json()).erreur).toContain("06 44 76 91 74");
  expect((await GET().json()).disponible).toBe(false);
  expect(fetchMock).not.toHaveBeenCalled();
});
