import { NextRequest } from "next/server";
import { registration, validChoice } from "@/lib/ticket-or/types";
import {
  PLAYER_COOKIE,
  CHALLENGE_COOKIE,
  TICKET_RULES_VERSION,
  TicketError,
  body,
  configured,
  cookieHash,
  coupon,
  draw,
  failure,
  hash,
  rate,
  requireLive,
  response,
  rpc,
  setCookie,
  token,
  sendVerification,
  checkVerification,
} from "@/lib/ticket-or/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!configured())
    return response({
      mode: "preview",
      available: false,
      campaign: null,
      player: null,
      tickets: [],
      played: false,
      next_play_at: null,
    });
  try {
    return response({
      ...(await rpc("state", { hash: cookieHash(req, PLAYER_COOKIE) })),
      mode: "live",
    });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await body(req);
    requireLive();
    const sessionHash = cookieHash(req, PLAYER_COOKIE);
    if (data.action === "send-code") {
      if (data.website) throw new TicketError("Cette participation ne peut pas être enregistrée.");
      const profile = registration(data);
      if (typeof profile === "string") throw new TicketError(profile);
      await rate(req, "sms", profile.phone);
      const sid = await sendVerification(profile.phone);
      const challenge = token();
      await rpc("challenge_create", { hash: hash(challenge), sid, profile });
      const res = response({ ok: true });
      setCookie(res, CHALLENGE_COOKIE, challenge, 600);
      return res;
    }
    if (data.action === "verify-code") {
      if (typeof data.code !== "string" || !/^\d{6}$/.test(data.code))
        throw new TicketError("Saisissez les six chiffres reçus par SMS.");
      const challengeHash = cookieHash(req, CHALLENGE_COOKIE);
      if (!challengeHash) throw new TicketError("Demandez un nouveau code pour vous connecter.");
      await rate(req, "check");
      const { sid } = await rpc<{ sid: string }>("challenge_attempt", { hash: challengeHash });
      await checkVerification(sid, data.code);
      const session = token();
      await rpc("challenge_finish", {
        hash: challengeHash,
        session_hash: hash(session),
        version: TICKET_RULES_VERSION,
      });
      const res = response({ ok: true });
      setCookie(res, PLAYER_COOKIE, session, 7 * 86400);
      setCookie(res, CHALLENGE_COOKIE, "", 0);
      return res;
    }
    if (!sessionHash) throw new TicketError("Connectez-vous pour retrouver votre ticket.", 401);
    if (data.action === "play")
      return response(
        await rpc("play", {
          hash: sessionHash,
          draw: draw(),
          code: coupon(),
          version: TICKET_RULES_VERSION,
        })
      );
    if (data.action === "choice") {
      const choice = validChoice(data);
      if (
        !choice ||
        typeof data.id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id)
      )
        throw new TicketError("Choisissez une saveur pour votre cocktail.");
      return response(await rpc("choice", { hash: sessionHash, id: data.id, ...choice }));
    }
    if (data.action === "consent") {
      if (typeof data.email_opt_in !== "boolean" || typeof data.sms_opt_in !== "boolean")
        throw new TicketError("Préférences invalides.");
      return response(
        await rpc("consent", {
          hash: sessionHash,
          email_opt_in: data.email_opt_in,
          sms_opt_in: data.sms_opt_in,
        })
      );
    }
    if (data.action === "logout") {
      await rpc("logout", { hash: sessionHash });
      const res = response({ ok: true });
      setCookie(res, PLAYER_COOKIE, "", 0);
      return res;
    }
    throw new TicketError("Action inconnue.");
  } catch (e) {
    return failure(e);
  }
}
