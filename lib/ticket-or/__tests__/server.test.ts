// @vitest-environment node
import { scryptSync } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import * as s from "../server";
import { GET, POST } from "@/app/api/ticket-or/route";
import { GET as staffGet, POST as staffPost } from "@/app/api/ticket-or/equipe/route";
const origin = "https://www.derrierelabbaye.fr",
  sid = "VE" + "a".repeat(32),
  salt = "b".repeat(32);
const passwordHash = "scrypt:" + salt + ":" + scryptSync("test-staff", salt, 64).toString("hex");
const fetchMock = vi.fn();
const calls: { action: string; payload: Record<string, unknown> }[] = [];
let database: (action: string, payload: Record<string, unknown>) => unknown;
let provider: { status: string; sid: string };
function req(data: unknown, cookie = "", extra: Record<string, string> = {}) {
  return new NextRequest(origin + "/api/ticket-or", {
    method: "POST",
    headers: { origin, "content-type": "application/json", cookie, ...extra },
    body: JSON.stringify(data),
  });
}
const playerCookie = s.PLAYER_COOKIE + "=" + "a".repeat(43),
  staffCookie = s.STAFF_COOKIE + "=" + "b".repeat(43),
  challengeCookie = s.CHALLENGE_COOKIE + "=" + "c".repeat(43);
const profile = { first_name: "Test", phone: "0600000000", adult: true, rules: true };
beforeEach(() => {
  for (const [key, value] of Object.entries({
    TICKET_OR_MODE: "live",
    TICKET_SUPABASE_URL: "https://fictional.supabase.co",
    TICKET_SUPABASE_SECRET_KEY: "sb_secret_test-only",
    TICKET_RATE_SECRET: "a".repeat(40),
    TWILIO_ACCOUNT_SID: "AC" + "a".repeat(32),
    TWILIO_AUTH_TOKEN: "a".repeat(32),
    TWILIO_VERIFY_SERVICE_SID: "VA" + "a".repeat(32),
    TICKET_STAFF_PASSWORD_HASH: passwordHash,
  }))
    vi.stubEnv(key, value);
  calls.length = 0;
  database = () => ({ ok: true });
  provider = { status: "pending", sid };
  fetchMock.mockReset().mockImplementation(async (url: string, options: RequestInit) => {
    if (url.startsWith("https://fictional.supabase.co/")) {
      const item = JSON.parse(String(options.body));
      calls.push(item);
      return Response.json(database(item.action, item.payload));
    }
    if (url.startsWith("https://verify.twilio.com/")) return Response.json(provider);
    throw new Error("Unexpected network call");
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("Frontières serveur du jeu", () => {
  it("reste en aperçu sans services et interdit les opérations réelles", async () => {
    vi.stubEnv("TICKET_OR_MODE", "");
    expect(s.configured()).toBe(false);
    const result = await GET(new NextRequest(origin + "/api/ticket-or"));
    expect(await result.json()).toMatchObject({ mode: "preview", player: null, available: false });
    expect((await POST(req({ action: "send-code", ...profile }))).status).toBe(503);
    expect((await staffGet(new NextRequest(origin + "/api/ticket-or/equipe"))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    "TICKET_SUPABASE_URL",
    "TICKET_SUPABASE_SECRET_KEY",
    "TICKET_RATE_SECRET",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_VERIFY_SERVICE_SID",
    "TICKET_STAFF_PASSWORD_HASH",
  ])("refuse une configuration incomplète %s", (name) => {
    vi.stubEnv(name, "");
    expect(s.configured()).toBe(false);
  });
  it("protège les sessions, les cookies et le mot de passe équipe", () => {
    const token = s.token();
    expect(token).toMatch(/^[\w-]{43}$/);
    expect(s.hash(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(s.coupon()).toMatch(/^DLA-[A-F0-9]{24}$/);
    expect(s.draw()).toBeLessThan(1000000);
    expect(s.cookieHash(req({}, playerCookie), s.PLAYER_COOKIE)).toBe(s.hash("a".repeat(43)));
    expect(s.cookieHash(req({}, s.PLAYER_COOKIE + "=bad"), s.PLAYER_COOKIE)).toBe("");
    vi.stubEnv("NODE_ENV", "production");
    const r = s.response({ ok: true });
    s.setCookie(r, s.PLAYER_COOKIE, token, 60);
    expect(r.headers.get("cache-control")).toContain("no-store");
    for (const flag of ["HttpOnly", "Secure", "SameSite=strict"])
      expect(r.headers.get("set-cookie")).toContain(flag);
    expect(s.staffPassword("test-staff")).toBe(true);
    expect(s.staffPassword("bad")).toBe(false);
    expect(s.staffPassword("x".repeat(201))).toBe(false);
    vi.stubEnv("TICKET_STAFF_PASSWORD_HASH", "");
    expect(s.staffPassword("test-staff")).toBe(false);
  });
  it("bloque un autre site, un format invalide ou un corps excessif", async () => {
    expect((await POST(req({}, "", { origin: "https://evil.invalid" }))).status).toBe(403);
    expect((await POST(req({}, "", { "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect((await POST(req({}, "", { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(req({ value: "x".repeat(9000) }))).status).toBe(413);
    expect((await POST(req([]))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    const empty = new NextRequest(origin + "/api/ticket-or", {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
    });
    await expect(s.body(empty)).rejects.toThrow("vide");
  });
  it("masque les erreurs internes et distingue les échecs du registre", async () => {
    const r = s.failure(new Error("private-secret"));
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("private-secret");
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    await expect(s.rpc("state")).rejects.toMatchObject({ status: 503 });
    for (const [error, status] of [
      ["unauthorized", 401],
      ["rate_limit", 429],
      ["other", 400],
    ]) {
      database = () => ({ error });
      await expect(s.rpc("state")).rejects.toMatchObject({ status });
    }
    database = () => ({ error: "unauthorized" });
    expect((await GET(new NextRequest(origin + "/api/ticket-or"))).status).toBe(401);
  });
  it("réserve les quotas avant tout SMS et ne stocke pas l’IP en clair", async () => {
    const r = await POST(
      req({ action: "send-code", ...profile }, "", { "x-vercel-forwarded-for": "192.0.2.10" })
    );
    expect(r.status).toBe(200);
    expect(calls.map((c) => c.action)).toEqual(["limit", "challenge_create"]);
    const limits = calls[0].payload.limits as { key: string; max: number }[];
    expect(limits).toHaveLength(3);
    expect(JSON.stringify(limits)).not.toContain("192.0.2.10");
    expect(JSON.stringify(limits)).not.toContain("+33600000000");
    expect(limits.find((l) => l.key === "sms:global")?.max).toBe(60);
    expect(
      String(fetchMock.mock.calls.find((c) => c[0].includes("twilio.com"))?.[1].body)
    ).toContain("Channel=sms");
    expect(r.headers.get("set-cookie")).toContain(s.CHALLENGE_COOKIE);
    expect(fetchMock.mock.calls[0][1].headers.apikey).toBe("sb_secret_test-only");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
  it("refuse les faux profils et ne contacte pas Twilio après un refus de quota", async () => {
    expect((await POST(req({ action: "send-code", ...profile, website: "spam" }))).status).toBe(
      400
    );
    expect((await POST(req({ action: "send-code", ...profile, adult: false }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    database = () => ({ error: "rate_limit" });
    expect((await POST(req({ action: "send-code", ...profile }))).status).toBe(429);
    expect(fetchMock.mock.calls.every((c) => c[0].includes("supabase.co"))).toBe(true);
  });
  it("exige un code approuvé pour le bon identifiant avant de créer une session", async () => {
    database = (action) => (action === "challenge_attempt" ? { sid } : { ok: true });
    expect(
      (await POST(req({ action: "verify-code", code: "123456" }, challengeCookie))).status
    ).toBe(400);
    expect(calls.some((c) => c.action === "challenge_finish")).toBe(false);
    provider = { status: "approved", sid };
    const r = await POST(req({ action: "verify-code", code: "123456" }, challengeCookie));
    expect(r.status).toBe(200);
    expect(r.headers.get("set-cookie")).toContain(s.PLAYER_COOKIE);
    expect(r.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(calls.at(-1)?.action).toBe("challenge_finish");
    expect(fetchMock.mock.calls.some((c) => c[0].endsWith("/VerificationCheck"))).toBe(true);
    provider = { status: "approved", sid: "VE" + "b".repeat(32) };
    await expect(s.checkVerification(sid, "123456")).rejects.toThrow();
    expect((await POST(req({ action: "verify-code", code: "123" }, challengeCookie))).status).toBe(
      400
    );
    expect((await POST(req({ action: "verify-code", code: "123456" }))).status).toBe(400);
  });
  it("ne confirme pas un SMS ni une vérification expirée à tort", async () => {
    provider = { status: "approved", sid };
    await expect(s.sendVerification("+33600000000")).rejects.toMatchObject({ status: 503 });
    fetchMock.mockResolvedValueOnce(new Response("", { status: 429 }));
    await expect(s.sendVerification("+33600000000")).rejects.toMatchObject({ status: 429 });
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    await expect(s.checkVerification(sid, "123456")).rejects.toMatchObject({ status: 400 });
  });
  it("ignore le tirage et le code de gain proposés par le navigateur", async () => {
    expect(
      (await POST(req({ action: "play", draw: -99, code: "HACK" }, playerCookie))).status
    ).toBe(200);
    expect(calls[0].payload.draw).toBeGreaterThanOrEqual(0);
    expect(calls[0].payload.code).toMatch(/^DLA-[A-F0-9]{24}$/);
    expect((await POST(req({ action: "play" }))).status).toBe(401);
  });
  it("valide les choix et consentements et révoque la session", async () => {
    expect(
      (
        await POST(
          req({ action: "choice", id: "bad", flavour: "inconnu", alcohol: true }, playerCookie)
        )
      ).status
    ).toBe(400);
    expect(
      (
        await POST(
          req(
            {
              action: "choice",
              id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
              flavour: "herbes",
              alcohol: false,
            },
            playerCookie
          )
        )
      ).status
    ).toBe(200);
    expect(
      (
        await POST(
          req({ action: "consent", email_opt_in: "true", sms_opt_in: false }, playerCookie)
        )
      ).status
    ).toBe(400);
    expect(
      (await POST(req({ action: "consent", email_opt_in: false, sms_opt_in: true }, playerCookie)))
        .status
    ).toBe(200);
    expect((await POST(req({ action: "unknown" }, playerCookie))).status).toBe(400);
    expect(
      (await POST(req({ action: "logout" }, playerCookie))).headers.get("set-cookie")
    ).toContain("Max-Age=0");
    expect(calls.at(-1)?.action).toBe("logout");
  });
  it("exige la connexion équipe avant toute lecture ou export", async () => {
    expect((await staffPost(req({ action: "lookup", code: "DLA-" + "A".repeat(24) }))).status).toBe(
      401
    );
    expect((await staffPost(req({ action: "login", password: "wrong" }))).status).toBe(401);
    expect(calls.every((c) => c.action === "limit")).toBe(true);
    const r = await staffPost(req({ action: "login", password: "test-staff" }));
    expect(r.status).toBe(200);
    expect(r.headers.get("set-cookie")).toContain(s.STAFF_COOKIE);
    expect(calls.at(-1)?.action).toBe("staff_create");
  });
  it("transmet le contrôle de majorité et sécurise les cellules de l’export", async () => {
    const code = "DLA-" + "A".repeat(24);
    expect(
      (await staffPost(req({ action: "redeem", code, adult_checked: true }, staffCookie))).status
    ).toBe(200);
    expect(calls.at(-1)).toMatchObject({
      action: "redeem",
      payload: { code, adult_checked: true },
    });
    expect(
      (await staffPost(req({ action: "lookup", code: "javascript:bad" }, staffCookie))).status
    ).toBe(400);
    expect((await staffPost(req({ action: "unknown" }, staffCookie))).status).toBe(400);
    database = (action) =>
      action === "contacts"
        ? {
            contacts: [
              {
                first_name: '=HYPERLINK("bad")',
                last_name: "Test",
                email: "test@example.invalid",
                email_opt_in: true,
                phone: "",
              },
            ],
          }
        : { ok: true };
    const exported = await staffPost(req({ action: "contacts" }, staffCookie));
    expect(exported.headers.get("content-type")).toContain("text/csv");
    const csv = await exported.text();
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('""bad""');
    expect(exported.headers.get("cache-control")).toContain("no-store");
    expect(
      (await staffPost(req({ action: "logout" }, staffCookie))).headers.get("set-cookie")
    ).toContain("Max-Age=0");
  });
});
