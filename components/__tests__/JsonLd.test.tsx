import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/data/site";
import { cuisine, barSections, boissonsDouces } from "@/data/menu";

/* Ce composant alimente Google. Une régression y est invisible dans le
   navigateur et coûteuse à découvrir : rien ne casse à l'écran, seules les
   rich results disparaissent — ou pire, publient une information fausse. */

type Noeud = Record<string, unknown>;

function graphe(): Noeud[] {
  const html = renderToStaticMarkup(<JsonLd />);
  const json = html.replace(/^[\s\S]*?>([\s\S]*)<\/script>$/, "$1");
  const data = JSON.parse(json) as { "@context": string; "@graph": Noeud[] };
  expect(data["@context"]).toBe("https://schema.org");
  return data["@graph"];
}

const parType = (t: string) => graphe().filter((n) => n["@type"] === t);
const unique = (t: string) => {
  const n = parType(t);
  expect(n).toHaveLength(1);
  return n[0];
};

describe("JsonLd — intégrité du graphe", () => {
  it("expose une seule fiche établissement, menu, site et FAQ", () => {
    for (const t of ["BarOrPub", "Menu", "WebSite", "FAQPage", "BreadcrumbList"]) {
      expect(parType(t)).toHaveLength(1);
    }
  });

  it("relie les nœuds par @id sans référence pendante", () => {
    const noeuds = graphe();
    const ids = new Set(noeuds.map((n) => n["@id"]).filter(Boolean));

    // Toute référence { "@id": … } isolée doit pointer sur un nœud du graphe.
    const references: string[] = [];
    const parcourir = (v: unknown) => {
      if (Array.isArray(v)) return v.forEach(parcourir);
      if (v && typeof v === "object") {
        const o = v as Noeud;
        const cles = Object.keys(o);
        if (cles.length === 1 && cles[0] === "@id") references.push(String(o["@id"]));
        else Object.values(o).forEach(parcourir);
      }
    };
    noeuds.forEach(parcourir);

    expect(references.length).toBeGreaterThan(0);
    for (const ref of references) expect(ids).toContain(ref);
  });
});

describe("JsonLd — garde-fous sur les placeholders", () => {
  it("n'émet jamais un réseau social qui pointe vers la page d'accueil d'une plateforme", () => {
    const sameAs = (unique("BarOrPub").sameAs ?? []) as string[];
    for (const url of sameAs) {
      expect(url).not.toMatch(/^https:\/\/www\.(instagram|facebook)\.com\/$/);
    }
  });

  it("omet la clé sameAs plutôt que d'émettre un tableau vide", () => {
    const bar = unique("BarOrPub");
    if (!("sameAs" in bar)) expect(bar.sameAs).toBeUndefined();
    else expect((bar.sameAs as string[]).length).toBeGreaterThan(0);
  });

  it("publie le téléphone réel, jamais la sentinelle de placeholder", () => {
    const bar = unique("BarOrPub");
    expect(bar.telephone).toBe(site.telephone);
    expect(bar.telephone).not.toMatch(/00 00 00/);
  });
});

describe("JsonLd — événements", () => {
  it("n'annonce aucun événement tant que data/evenements.ts est vide", () => {
    // Le tableau a été vidé : les exemples de démonstration étaient publiés à
    // Google comme des soirées réelles.
    expect(parType("Event")).toHaveLength(0);
  });

  it("n'émet que les événements datés encore à venir", async () => {
    vi.resetModules();
    vi.doMock("@/data/evenements", () => ({
      evenements: [
        { id: "passe", titre: "Passé", description: "d", date: "2020-01-01" },
        { id: "futur", titre: "Futur", description: "d", date: "2099-05-05", heure: "19:00" },
        { id: "recurrent", titre: "Récurrent", description: "d", recurrence: "Tous les jeudis" },
      ],
    }));
    const { JsonLd: Mocke } = await import("@/components/JsonLd");
    const html = renderToStaticMarkup(<Mocke />);
    const data = JSON.parse(html.replace(/^[\s\S]*?>([\s\S]*)<\/script>$/, "$1")) as {
      "@graph": Noeud[];
    };
    const events = data["@graph"].filter((n) => n["@type"] === "Event");

    // Ni le passé (périmé) ni le récurrent (sans date) ne sont émis.
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("Futur");
    // Heure locale sans décalage : ne fige pas un été/hiver erroné.
    expect(events[0].startDate).toBe("2099-05-05T19:00:00");
    expect(events[0].location).toEqual({ "@id": `${site.url}/#bar` });
    vi.doUnmock("@/data/evenements");
    vi.resetModules();
  });
});

describe("JsonLd — carte", () => {
  it("reprend toutes les sections de la carte", () => {
    const menu = unique("Menu");
    const sections = menu.hasMenuSection as Noeud[];
    expect(sections).toHaveLength(cuisine.length + barSections.length + boissonsDouces.length);
  });

  it("convertit les prix en offres EUR et laisse les plats sans prix sans offre", () => {
    const sections = unique("Menu").hasMenuSection as Noeud[];
    const plats = sections.flatMap((s) => s.hasMenuItem as Noeud[]);
    expect(plats.length).toBeGreaterThan(0);

    const avecOffre = plats.filter((p) => p.offers);
    expect(avecOffre.length).toBeGreaterThan(0);
    for (const p of avecOffre) {
      const offre = p.offers as Noeud;
      expect(offre.priceCurrency).toBe("EUR");
      // Un prix doit être numérique : « 9 € » ou « à partir de 12 » ne passent pas.
      expect(String(offre.price)).toMatch(/^\d+(\.\d+)?$/);
    }
  });

  it("marque le régime végétarien des plats concernés", () => {
    const sections = unique("Menu").hasMenuSection as Noeud[];
    const plats = sections.flatMap((s) => s.hasMenuItem as Noeud[]);
    const veges = plats.filter((p) => p.suitableForDiet);
    expect(veges.length).toBeGreaterThan(0);
    for (const p of veges) {
      expect(p.suitableForDiet).toBe("https://schema.org/VegetarianDiet");
    }
  });
});

describe("JsonLd — horaires et localisation", () => {
  it("reprend fidèlement horairesSchema, source des horaires affichés", () => {
    const specs = unique("BarOrPub").openingHoursSpecification as Noeud[];
    expect(specs).toHaveLength(site.horairesSchema.length);
    specs.forEach((spec, i) => {
      expect(spec.dayOfWeek).toEqual(site.horairesSchema[i].jours);
      expect(spec.opens).toBe(site.horairesSchema[i].ouvre);
      expect(spec.closes).toBe(site.horairesSchema[i].ferme);
    });
  });

  it("publie les coordonnées géographiques de data/site.ts", () => {
    const geo = unique("BarOrPub").geo as Noeud;
    expect(geo.latitude).toBe(site.adresse.geo.lat);
    expect(geo.longitude).toBe(site.adresse.geo.lng);
  });
});
