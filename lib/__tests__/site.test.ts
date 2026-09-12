import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { site, reseauxPublies } from "@/data/site";
import { evenements } from "@/data/evenements";
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
    const html = readFileSync(join(process.cwd(), "public", "offline.html"), "utf-8");
    const telCompact = site.telephone.replace(/\s/g, "");
    expect(html).toContain(site.telephoneAffichage);
    expect(html).toContain(`tel:${telCompact}`);
  });
});

/* Les réseaux « placeholder » pointent vers les pages d'accueil des plateformes,
   qui ne mènent à aucun compte. Ni affichés, ni donnés à Google. */
describe("site — réseaux sociaux", () => {
  it("n'expose jamais une page d'accueil de plateforme comme compte du bar", () => {
    for (const r of reseauxPublies) {
      expect(r.url).not.toMatch(/^https:\/\/www\.(instagram|facebook)\.com\/$/);
    }
  });
});

/* Ce fichier alimente l'affichage ET le JSON-LD schema.org/Event : tout ce qui
   s'y trouve est annoncé publiquement comme un événement réel. */
describe("évenements", () => {
  it("ne publie aucun exemple de démonstration", () => {
    for (const e of evenements) {
      expect(e.id).not.toMatch(/^demo-/);
    }
  });

  it("n'annonce que des rendez-vous datés ou récurrents, jamais les deux", () => {
    for (const e of evenements) {
      expect(Boolean(e.date) !== Boolean(e.recurrence)).toBe(true);
    }
  });
});

/* Les mentions confirmées par l’établissement ne doivent plus régresser. */
describe("site — mentions légales", () => {
  it("ne laisse aucune mention légale provisoire", () => {
    const aVerifier = {
      raisonSociale: site.legales.raisonSociale,
      formeJuridique: site.legales.formeJuridique,
      siret: site.legales.siret,
      directeurPublication: site.legales.directeurPublication,
      "hebergeur.nom": site.legales.hebergeur.nom,
      "hebergeur.adresse": site.legales.hebergeur.adresse,
    };
    const manquants = Object.entries(aVerifier)
      .filter(([, valeur]) => /À CONFIRMER/i.test(valeur))
      .map(([champ]) => champ);

    expect(manquants).toEqual([]);
  });
});
