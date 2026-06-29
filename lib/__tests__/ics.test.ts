import { describe, expect, it } from "vitest";
import { genererIcs } from "@/lib/ics";

/** Reconstitue les lignes pliées (continuation = CRLF + espace) pour les assertions. */
function deplier(ics: string): string {
  return ics.replace(/\r\n /g, "");
}

const evt = {
  dateIso: "2026-06-15",
  heure: "20:00",
  couverts: 2,
  reference: "DLA-7F3K",
};

describe("genererIcs", () => {
  it("produit un VCALENDAR/VEVENT avec fuseau Europe/Paris", () => {
    const ics = genererIcs(evt);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("BEGIN:VTIMEZONE");
    expect(ics).toContain("TZID:Europe/Paris");
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("calcule un créneau de 2 h en heure locale de table", () => {
    const ics = deplier(genererIcs(evt));
    expect(ics).toContain("DTSTART;TZID=Europe/Paris:20260615T200000");
    expect(ics).toContain("DTEND;TZID=Europe/Paris:20260615T220000");
  });

  it("construit un UID stable avec la référence et le host", () => {
    const ics = deplier(genererIcs(evt));
    expect(ics).toContain("UID:DLA-7F3K-2026-06-15@www.derrierelabbaye.fr");
  });

  it("accorde « couvert » au singulier", () => {
    const ics = deplier(genererIcs({ ...evt, couverts: 1 }));
    expect(ics).toContain("pour 1 couvert ");
    expect(ics).not.toContain("1 couverts");
  });

  it("échappe les virgules de l'adresse (RFC 5545)", () => {
    const ics = deplier(genererIcs(evt));
    expect(ics).toMatch(/LOCATION:.*\\,/);
  });
});
