import { NextRequest } from "next/server";
import { extractCoupon } from "@/lib/ticket-or/types";
import {
  STAFF_COOKIE,
  TicketError,
  body,
  cookieHash,
  failure,
  hash,
  rate,
  requireLive,
  response,
  rpc,
  setCookie,
  staffPassword,
  token,
} from "@/lib/ticket-or/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    requireLive();
    return response(await rpc("staff_state", { hash: cookieHash(req, STAFF_COOKIE) }));
  } catch (e) {
    return failure(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await body(req);
    requireLive();
    if (data.action === "login") {
      await rate(req, "staff");
      if (typeof data.password !== "string" || !staffPassword(data.password))
        throw new TicketError("Accès non reconnu.", 401);
      const session = token();
      await rpc("staff_create", { hash: hash(session) });
      const res = response({ ok: true });
      setCookie(res, STAFF_COOKIE, session, 8 * 3600);
      return res;
    }
    const sessionHash = cookieHash(req, STAFF_COOKIE);
    if (!sessionHash) throw new TicketError("Connectez-vous à l’espace équipe.", 401);
    if (data.action === "logout") {
      await rpc("logout", { hash: sessionHash });
      const res = response({ ok: true });
      setCookie(res, STAFF_COOKIE, "", 0);
      return res;
    }
    // Vérifier l'authentification avant même la recherche d'un bon.
    await rpc("staff_state", { hash: sessionHash });
    await rate(req, "scan");
    if (data.action === "contacts") {
      const { contacts } = await rpc<{ contacts: Record<string, unknown>[] }>("contacts", {
        hash: sessionHash,
      });
      const keys = [
        "first_name",
        "last_name",
        "phone",
        "email",
        "sms_opt_in",
        "email_opt_in",
        "consent_at",
        "rules_version",
      ];
      const cell = (v: unknown) => {
        let value = String(v ?? "");
        if (/^[=+\-@\t\r]/.test(value)) value = `'${value}`;
        return `"${value.replace(/"/g, '""')}"`;
      };
      const csv =
        "\uFEFF" +
        [
          keys.map(cell).join(";"),
          ...contacts.map((row) => keys.map((k) => cell(row[k])).join(";")),
        ].join("\r\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="contacts-accord-ticket-or.csv"',
          "Cache-Control": "private, no-store",
        },
      });
    }
    if (data.action !== "lookup" && data.action !== "redeem")
      throw new TicketError("Action inconnue.");
    const code = typeof data.code === "string" ? extractCoupon(data.code) : null;
    if (!code) throw new TicketError("Scannez le QR code du bon ou saisissez son code complet.");
    return response(
      await rpc(data.action, {
        hash: sessionHash,
        code,
        adult_checked: data.adult_checked === true,
      })
    );
  } catch (e) {
    return failure(e);
  }
}
