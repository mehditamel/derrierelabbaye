import { describe, expect, it } from "vitest";
import {
  normaliser,
  correspondItem,
  filtrerSections,
} from "@/lib/recherche";
import type { MenuItem, MenuSection } from "@/data/menu";

describe("normaliser", () => {
  it("met en minuscules et retire les accents", () => {
    expect(normaliser("Rôties")).toBe("roties");
    expect(normaliser("ZAATAR")).toBe("zaatar");
  });

  it("déplie les ligatures œ et æ", () => {
    expect(normaliser("Cœur")).toBe("coeur");
    expect(normaliser("ex æquo")).toBe("ex aequo");
  });

  it("supprime les espaces de début et de fin", () => {
    expect(normaliser("  burrata  ")).toBe("burrata");
  });
});

describe("correspondItem", () => {
  const item: MenuItem = {
    nom: "Aubergines rôties",
    description: "yaourt citronné & zaatar",
  };

  it("trouve par le nom, insensible aux accents", () => {
    expect(correspondItem(item, "roties")).toBe(true);
  });

  it("trouve par la description", () => {
    expect(correspondItem(item, "zaatar")).toBe(true);
  });

  it("ne correspond pas à un terme absent", () => {
    expect(correspondItem(item, "poulpe")).toBe(false);
  });

  it("gère une description manquante", () => {
    expect(correspondItem({ nom: "Houmous" }, "houmous")).toBe(true);
  });
});

describe("filtrerSections", () => {
  const sections: MenuSection[] = [
    {
      id: "froid",
      titre: "Froid",
      items: [{ nom: "Burrata" }, { nom: "Houmous" }],
    },
    {
      id: "chaud",
      titre: "Chaud",
      items: [{ nom: "Poulpe grillé" }],
    },
  ];

  it("renvoie toutes les sections pour une requête vide", () => {
    expect(filtrerSections(sections, "")).toHaveLength(2);
    expect(filtrerSections(sections, "   ")).toHaveLength(2);
  });

  it("retire les items non correspondants", () => {
    const res = filtrerSections(sections, "burrata");
    expect(res).toHaveLength(1);
    expect(res[0].items).toHaveLength(1);
    expect(res[0].items[0].nom).toBe("Burrata");
  });

  it("supprime les sections devenues vides", () => {
    const res = filtrerSections(sections, "poulpe");
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe("chaud");
  });

  it("ne mute pas le tableau source", () => {
    const copie = [...sections];
    filtrerSections(sections, "burrata");
    expect(sections).toEqual(copie);
  });
});
