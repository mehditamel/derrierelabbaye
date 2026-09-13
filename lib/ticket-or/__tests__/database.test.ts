// @vitest-environment node
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let db: PGlite;
const HASH = "a".repeat(64),
  STAFF = "b".repeat(64);
const code = () => `DLA-${randomBytes(12).toString("hex").toUpperCase()}`;
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- Résultats SQL contrôlés par ces fixtures.
async function rpc(action: string, payload: Row = {}): Promise<Row> {
  const result = await db.query<{ value: Row }>(
    "select public.ticket_or_api($1, $2::jsonb) as value",
    [action, JSON.stringify(payload)]
  );
  return result.rows[0].value;
}
async function player(suffix = 0) {
  const result = await db.query<{ id: string }>(
    "insert into ticket_or.players(phone, first_name, rules_version) values ($1, 'Essai', '2026-09-13') returning id",
    [`+336${String(suffix).padStart(8, "0")}`]
  );
  const id = result.rows[0].id,
    hash = suffix ? String(suffix).padStart(64, "c") : HASH;
  await db.query(
    "insert into ticket_or.sessions(token_hash, player_id, expires_at) values ($1,$2,now()+interval '1 day')",
    [hash, id]
  );
  return { id, hash };
}
async function play(hash = HASH, draw = 0) {
  return rpc("play", { hash, draw, code: code(), version: "2026-09-13" });
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  await db.exec(readFileSync("database/ticket-or.sql", "utf8"));
}, 90_000);
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.exec(
    "truncate ticket_or.campaigns, ticket_or.players, ticket_or.sessions, ticket_or.consents, ticket_or.challenges, ticket_or.tickets, ticket_or.limits restart identity cascade;"
  );
  await db.exec(
    "insert into ticket_or.campaigns(starts_at,ends_at,active,max_prizes,probability,rules_version) values(now()-interval '1 hour',now()+interval '27 days',true,2,20,'2026-09-13');"
  );
  await player();
  await rpc("staff_create", { hash: STAFF });
});

describe("Le registre du Ticket d’Or", () => {
  it("interdit les tables et le RPC aux rôles publics, avec RLS sur chaque table", async () => {
    const { rows } = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='ticket_or' and relkind='r'"
    );
    expect(rows.every((r) => r.relrowsecurity)).toBe(true);
    await db.exec("set role anon");
    await expect(rpc("state")).rejects.toThrow(/permission denied/);
    await expect(db.query("select * from ticket_or.players")).rejects.toThrow(/permission denied/);
    await db.exec("reset role; set role service_role");
    expect((await rpc("state", { hash: HASH })).player.first_name).toBe("Essai");
    await db.exec("reset role");
  });
  it("ne dévoile aucune donnée joueur sans sa session et refuse les actions anonymes", async () => {
    expect((await rpc("state")).player).toBeNull();
    expect((await play("inconnu")).error).toBe("unauthorized");
    expect((await rpc("staff_state", { hash: HASH })).error).toBe("unauthorized");
  });
  it("conserve le même gain ou la même perte lors des nouvelles tentatives", async () => {
    const initial = await play(HASH, 999999);
    expect(initial.ticket.won).toBe(false);
    expect((await play(HASH, 0)).ticket.id).toBe(initial.ticket.id);
    expect((await rpc("state", { hash: HASH })).played).toBe(true);
    expect((await rpc("state", { hash: HASH })).campaign.awarded).toBe(0);
  });
  it("plafonne les lots et reste idempotent lorsque plusieurs demandes arrivent ensemble", async () => {
    const users = await Promise.all([1, 2, 3, 4].map(player));
    const results = await Promise.all(users.map((p) => play(p.hash)));
    expect(results.filter((r) => r.ticket?.won)).toHaveLength(2);
    expect(results.filter((r) => r.error === "closed")).toHaveLength(2);
    const before = results.find((r) => r.ticket)?.ticket;
    const again = await Promise.all([play(users[0].hash), play(users[0].hash)]);
    expect(again.every((r) => r.ticket.id === before.id)).toBe(true);
    expect((await rpc("state")).available).toBe(false);
  });
  it("ne valide un bon qu’une fois et exige une session équipe", async () => {
    const { ticket } = await play();
    expect((await rpc("lookup", { hash: HASH, code: ticket.code })).error).toBe("unauthorized");
    expect((await rpc("lookup", { hash: STAFF, code: ticket.code })).ticket.status).toBe("valid");
    const results = await Promise.all(
      [1, 2].map(() => rpc("redeem", { hash: STAFF, code: ticket.code }))
    );
    expect(results.filter((r) => r.redeemed_now)).toHaveLength(1);
    expect(results.every((r) => r.ticket.status === "used")).toBe(true);
    expect((await rpc("staff_state", { hash: STAFF })).redeemed).toBe(1);
  });
  it("refuse un bon expiré sans l’enregistrer comme servi", async () => {
    const { ticket } = await play();
    await db.query(
      "update ticket_or.tickets set expires_at=now()-interval '1 minute' where id=$1",
      [ticket.id]
    );
    const result = await rpc("redeem", { hash: STAFF, code: ticket.code });
    expect(result.ticket.status).toBe("expired");
    expect(result.redeemed_now).toBe(false);
  });
  it("conserve les bons après clôture et empêche la modification d’un autre joueur", async () => {
    const { ticket } = await play();
    const other = await player(1);
    expect(
      (await rpc("choice", { hash: other.hash, id: ticket.id, flavour: "fruits", alcohol: false }))
        .error
    ).toBe("ticket");
    await db.exec("update ticket_or.campaigns set active=false");
    expect((await rpc("state", { hash: HASH })).tickets[0].id).toBe(ticket.id);
    expect((await rpc("redeem", { hash: STAFF, code: ticket.code })).redeemed_now).toBe(true);
  });
  it("contrôle la version alcoolisée dans le registre et la preuve de majorité au service", async () => {
    const { ticket } = await play();
    expect(
      (await rpc("choice", { hash: HASH, id: ticket.id, flavour: "herbes", alcohol: true })).error
    ).toBe("alcohol");
    await db.exec("update ticket_or.campaigns set alcohol_allowed=true");
    expect(
      (await rpc("choice", { hash: HASH, id: ticket.id, flavour: "herbes", alcohol: true })).error
    ).toBe("alcohol");
    const other = await player(1);
    const { ticket: allowed } = await play(other.hash);
    await db.exec("update ticket_or.campaigns set active=false");
    expect(
      (await rpc("choice", { hash: other.hash, id: allowed.id, flavour: "herbes", alcohol: true }))
        .ok
    ).toBe(true);
    expect((await rpc("redeem", { hash: STAFF, code: allowed.code })).error).toBe("adult");
    expect(
      (await rpc("redeem", { hash: STAFF, code: allowed.code, adult_checked: true })).redeemed_now
    ).toBe(true);
  });
  it("n’exporte que les coordonnées des canaux acceptés et respecte le retrait", async () => {
    await db.exec("update ticket_or.players set email='essai@example.invalid'");
    expect((await rpc("contacts", { hash: STAFF })).contacts).toEqual([]);
    await rpc("consent", { hash: HASH, email_opt_in: true, sms_opt_in: false });
    const contacts = (await rpc("contacts", { hash: STAFF })).contacts;
    expect(contacts[0].email).toBe("essai@example.invalid");
    expect(contacts[0].phone).toBe("");
    await rpc("consent", { hash: HASH, email_opt_in: false, sms_opt_in: false });
    expect((await rpc("contacts", { hash: STAFF })).contacts).toEqual([]);
  });
  it("réserve les quotas SMS ensemble sans permettre de dépasser le plafond", async () => {
    const payload = { limits: [{ key: "global", max: 2, seconds: 3600 }] };
    const requests = await Promise.all(Array.from({ length: 5 }, () => rpc("limit", payload)));
    expect(requests.filter((r) => r.ok)).toHaveLength(2);
    expect(requests.filter((r) => r.error === "rate_limit")).toHaveLength(3);
  });
  it("borne les essais OTP et consomme une seule fois la vérification", async () => {
    const ch = "d".repeat(64);
    const profile = {
      first_name: "Essai",
      last_name: "",
      phone: "+33600000009",
      email: "",
      sms_opt_in: false,
      email_opt_in: false,
    };
    await rpc("challenge_create", { hash: ch, sid: "VE-fictive", profile });
    for (let i = 0; i < 5; i++)
      expect((await rpc("challenge_attempt", { hash: ch })).sid).toBe("VE-fictive");
    expect((await rpc("challenge_attempt", { hash: ch })).error).toBe("challenge");
    const args = { hash: ch, session_hash: "e".repeat(64), version: "2026-09-13" };
    expect((await rpc("challenge_finish", args)).ok).toBe(true);
    expect((await rpc("challenge_finish", args)).error).toBe("challenge");
    expect((await rpc("state", { hash: args.session_hash })).player.phone).toBe(profile.phone);
    await rpc("logout", { hash: args.session_hash });
    expect((await rpc("state", { hash: args.session_hash })).player).toBeNull();
  });
  it("supprime les coordonnées arrivées à échéance en conservant le comptage des lots", async () => {
    const { ticket } = await play();
    await db.exec("update ticket_or.players set last_contact_at=now()-interval '100 days'");
    await rpc("purge");
    expect((await rpc("state", { hash: HASH })).player).not.toBeNull();
    await db.query("update ticket_or.tickets set expires_at=now()-interval '90 days' where id=$1", [
      ticket.id,
    ]);
    await rpc("purge");
    expect((await rpc("state", { hash: HASH })).player).toBeNull();
    expect((await rpc("state")).campaign.awarded).toBe(1);
  });
  it("refuse une campagne non ouverte et un règlement différent", async () => {
    await db.exec("update ticket_or.players set rules_version='ancienne'");
    expect((await play()).error).toBe("rules");
    await db.exec("update ticket_or.campaigns set active=false");
    expect((await play()).error).toBe("closed");
  });
});
