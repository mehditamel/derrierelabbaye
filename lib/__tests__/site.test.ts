import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { site } from "@/data/site";
import { telephoneValide } from "@/lib/useReservationForm";

/* Garde-fous sur les coordonnées de l'établissement.
   `data/site.ts` est la source de vérité ; `public/offline.html` est un fichier
   statique servi hors-ligne qui recopie le téléphone en dur (il ne peut pas
   importer le module à l'exécution). Ces tests empêchent une désync silencieuse. */
describe("site — téléphone", () => {
  it("respecte le format FR valide (affichage + international)", () => {
    expect(telephoneValide(site.telephoneAffichage)).toBe(true);
    expect(telephoneValide(site.telephone)).toBe(true);
  });

  it("n'est plus un placeholder", () => {
    expect(site.telephoneAffichage).not.toMatch(/00 00 00/);
    expect(site.telephone).not.toMatch(/00 00 00/);
  });

  it("reste synchronisé avec public/offline.html", () => {
    const html = readFileSync(
      join(process.cwd(), "public", "offline.html"),
      "utf-8"
    );
    const telCompact = site.telephone.replace(/\s/g, "");
    expect(html).toContain(site.telephoneAffichage);
    expect(html).toContain(`tel:${telCompact}`);
  });
});
