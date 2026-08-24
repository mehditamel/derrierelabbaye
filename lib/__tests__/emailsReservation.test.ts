import { describe, expect, it } from "vitest";
import {
  construireEmailBar,
  construireEmailClient,
  echapperHtml,
  type ReservationRow,
} from "@/lib/emailsReservation";

const complete: ReservationRow = {
  reference: "DLA-7F3K",
  date: "2027-03-18",
  heure: "20:00",
  couverts: 4,
  nom: "Camille",
  telephone: "06 12 34 56 78",
  email: "camille@exemple.fr",
  message: "Terrasse si possible.",
};

const minimale: ReservationRow = {
  reference: "DLA-2B8N",
  date: "2027-03-19",
  heure: "19:30",
  couverts: 1,
  nom: "Jean",
  telephone: null,
  email: null,
  message: null,
};

describe("echapperHtml", () => {
  it("neutralise le balisage saisi par le visiteur", () => {
    expect(echapperHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });
});

describe("construireEmailClient", () => {
  it("récapitule la demande : nom, date avec année, couverts, référence", () => {
    const email = construireEmailClient(complete);
    expect(email.sujet).toContain("DLA-7F3K");
    expect(email.texte).toContain("Bonjour Camille");
    expect(email.texte).toContain("jeudi 18 mars 2027 à 20:00");
    expect(email.texte).toContain("4 couverts");
    expect(email.html).toContain("DLA-7F3K");
  });

  it("accorde le singulier et porte la mention légale alcool", () => {
    const email = construireEmailClient(minimale);
    expect(email.texte).toContain("1 couvert,");
    expect(email.texte).toContain("L'abus d'alcool est dangereux pour la santé");
    expect(email.html).toContain("L'abus d'alcool est dangereux pour la santé");
  });

  it("échappe le nom dans le HTML", () => {
    const email = construireEmailClient({ ...complete, nom: "<b>Camille</b>" });
    expect(email.html).not.toContain("<b>Camille</b>");
    expect(email.html).toContain("&lt;b&gt;Camille&lt;/b&gt;");
  });
});

describe("construireEmailBar", () => {
  it("liste toutes les coordonnées et le message", () => {
    const email = construireEmailBar(complete);
    expect(email.sujet).toContain("4 couverts");
    expect(email.sujet).toContain("DLA-7F3K");
    expect(email.texte).toContain("Téléphone : 06 12 34 56 78");
    expect(email.texte).toContain("E-mail : camille@exemple.fr");
    expect(email.texte).toContain("Terrasse si possible.");
    expect(email.html).toContain("Terrasse si possible.");
  });

  it("omet proprement les champs facultatifs absents", () => {
    const email = construireEmailBar(minimale);
    expect(email.texte).not.toContain("Téléphone");
    expect(email.texte).not.toContain("E-mail");
    expect(email.texte).not.toContain("Message");
    expect(email.texte).not.toContain("null");
    expect(email.html).not.toContain("null");
  });

  it("échappe le message injecté dans le HTML reçu par le bar", () => {
    const email = construireEmailBar({ ...complete, message: '<img src=x onerror="1">' });
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;img src=x");
  });

  it("reprend les coordonnées du bar depuis data/site.ts", () => {
    const email = construireEmailClient(complete);
    expect(email.texte).toContain("1 rue de l'Abbaye, 13007 Marseille");
    expect(email.texte).toContain("06 44 76 91 74");
  });
});
