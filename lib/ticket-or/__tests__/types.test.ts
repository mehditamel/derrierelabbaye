import { describe, expect, it } from "vitest";
import { extractCoupon, normalizePhone, registration, ticketDate, validChoice } from "../types";

const form = { first_name: "  Camille ", phone: "06 00 00 00 00", adult: true, rules: true };
describe("Participation Ticket d’Or", () => {
  it.each(["06 00 00 00 00", "+33600000000", "0033600000000", "06.00.00.00.00"])(
    "normalise %s",
    (value) => expect(normalizePhone(value)).toBe("+33600000000")
  );
  it.each([null, 4, "hello", "+19009009000", "04 00 00 00 00", "060000000000"])(
    "refuse un mobile non pris en charge : %s",
    (value) => expect(normalizePhone(value)).toBeNull()
  );
  it("ne coche aucun consentement par défaut", () =>
    expect(registration(form)).toMatchObject({
      first_name: "Camille",
      phone: "+33600000000",
      sms_opt_in: false,
      email_opt_in: false,
      last_name: "",
      email: "",
    }));
  it.each([
    { first_name: "" },
    { phone: "bad" },
    { email: "bad" },
    { adult: false },
    { rules: false },
    { email_opt_in: true },
    { last_name: "x".repeat(61) },
  ])("refuse les données invalides %j", (value) =>
    expect(typeof registration({ ...form, ...value })).toBe("string")
  );
  it("accepte les informations facultatives et les consentements distincts", () =>
    expect(
      registration({
        ...form,
        last_name: "Test",
        email: "TEST@example.invalid",
        email_opt_in: true,
      })
    ).toMatchObject({ email: "test@example.invalid", email_opt_in: true, sms_opt_in: false }));
  it("valide les saveurs et la version", () => {
    expect(validChoice({ flavour: "herbes", alcohol: false })).toEqual({
      flavour: "herbes",
      alcohol: false,
    });
    expect(validChoice({ flavour: "autre", alcohol: false })).toBeNull();
    expect(validChoice({ flavour: "fruits", alcohol: "false" })).toBeNull();
  });
  it("lit un QR sans ouvrir son URL, et rejette un spécimen ou un code incomplet", () => {
    const code = `DLA-${"A".repeat(24)}`;
    expect(extractCoupon(`https://www.derrierelabbaye.fr/ticket-or/equipe#bon=${code}`)).toBe(code);
    expect(extractCoupon(code)).toBe(code);
    expect(extractCoupon("SPÉCIMEN")).toBeNull();
    expect(extractCoupon("DLA-1234")).toBeNull();
  });
  it("affiche les dates dans le fuseau de Marseille", () =>
    expect(ticketDate("2026-09-13T23:00:00Z")).toBe("14 septembre"));
});
