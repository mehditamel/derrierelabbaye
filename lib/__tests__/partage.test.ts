import { afterEach, describe, expect, it, vi } from "vitest";
import { partagerOuCopier } from "@/lib/partage";

const contenu = {
  title: "Réservation",
  text: "texte de repli",
  url: "https://www.derrierelabbaye.fr/reserver",
};

afterEach(() => vi.unstubAllGlobals());

describe("partagerOuCopier", () => {
  it("utilise l'API Web Share quand elle existe", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });

    const res = await partagerOuCopier(contenu);

    expect(res).toBe("partage");
    expect(share).toHaveBeenCalledWith(contenu);
  });

  it("renvoie « partage » même si l'utilisateur annule", async () => {
    const share = vi.fn().mockRejectedValue(new Error("AbortError"));
    vi.stubGlobal("navigator", { share });

    expect(await partagerOuCopier(contenu)).toBe("partage");
  });

  it("copie l'URL dans le presse-papiers en repli", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const res = await partagerOuCopier(contenu);

    expect(res).toBe("copie");
    expect(writeText).toHaveBeenCalledWith(contenu.url);
  });

  it("copie le texte quand aucune URL n'est fournie", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await partagerOuCopier({ title: "t", text: "juste du texte" });

    expect(writeText).toHaveBeenCalledWith("juste du texte");
  });

  it("renvoie « echec » si la copie échoue", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    expect(await partagerOuCopier(contenu)).toBe("echec");
  });
});
