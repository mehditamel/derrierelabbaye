import "server-only";
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { TICKET_RULES_VERSION } from "./types";

export const PLAYER_COOKIE = "dla_ticket_session";
export const CHALLENGE_COOKIE = "dla_ticket_challenge";
export const STAFF_COOKIE = "dla_ticket_staff";
const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Votre session a expiré. Connectez-vous à nouveau.",
  rate_limit: "Trop de tentatives. Patientez avant de réessayer.",
  challenge: "Ce code a expiré ou le nombre d’essais est dépassé. Demandez un nouveau code.",
  closed:
    "Les participations sont terminées pour le moment. Les bons déjà gagnés restent valables.",
  rules: "Le règlement a changé. Reconnectez-vous pour le consulter et l’accepter.",
  ticket: "Ce bon est introuvable ou ne peut plus être modifié.",
  alcohol: "Seule la version sans alcool est proposée pour cette campagne.",
  email: "Aucune adresse e-mail n’est associée à votre compte.",
  adult:
    "Contrôlez la preuve de majorité avant de servir une version alcoolisée, puis vérifiez à nouveau le bon.",
};

export class TicketError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

export function configured(): boolean {
  return (
    process.env.TICKET_OR_MODE === "live" &&
    /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(process.env.TICKET_SUPABASE_URL ?? "") &&
    (process.env.TICKET_SUPABASE_SECRET_KEY ?? "").startsWith("sb_secret_") &&
    (process.env.TICKET_RATE_SECRET?.length ?? 0) >= 32 &&
    /^AC[a-fA-F0-9]{32}$/.test(process.env.TWILIO_ACCOUNT_SID ?? "") &&
    (process.env.TWILIO_AUTH_TOKEN?.length ?? 0) >= 32 &&
    /^VA[a-fA-F0-9]{32}$/.test(process.env.TWILIO_VERIFY_SERVICE_SID ?? "") &&
    /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.TICKET_STAFF_PASSWORD_HASH ?? "")
  );
}

export function requireLive() {
  if (!configured())
    throw new TicketError(
      "Le jeu n’est pas encore ouvert. Aucun SMS ni gain ne peut être délivré pour le moment.",
      503
    );
}

export function token() {
  return randomBytes(32).toString("base64url");
}
export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function coupon() {
  return `DLA-${randomBytes(12).toString("hex").toUpperCase()}`;
}
export function draw() {
  return randomInt(1_000_000);
}
export function cookieHash(req: NextRequest, name: string) {
  const value = req.cookies.get(name)?.value ?? "";
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? hash(value) : "";
}

export function response(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
  });
}
export function failure(error: unknown) {
  return error instanceof TicketError
    ? response({ error: error.message }, error.status)
    : response(
        { error: "Le service est momentanément indisponible. Réessayez dans quelques instants." },
        503
      );
}
export function setCookie(res: NextResponse, name: string, value: string, maxAge: number) {
  res.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}

export async function body(req: NextRequest): Promise<Record<string, unknown>> {
  if (
    req.headers.get("origin") !== new URL(req.url).origin ||
    req.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new TicketError("Cette requête n’est pas autorisée.", 403);
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new TicketError("Format non accepté.", 415);
  const reader = req.body?.getReader();
  if (!reader) throw new TicketError("Requête vide.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.byteLength;
    if (length > 8192) {
      await reader.cancel();
      throw new TicketError("Requête trop longue.", 413);
    }
    chunks.push(part.value);
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new TicketError("Requête invalide.");
  }
}

export async function rpc<T = Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  requireLive();
  const res = await fetch(`${process.env.TICKET_SUPABASE_URL}/rest/v1/rpc/ticket_or_api`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.TICKET_SUPABASE_SECRET_KEY!,
    },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new TicketError("Le registre du jeu est momentanément indisponible.", 503);
  const value = await res.json();
  if (value?.error) {
    const code = String(value.error);
    throw new TicketError(
      ERROR_MESSAGES[code] ?? "Cette action ne peut pas être effectuée.",
      code === "unauthorized" ? 401 : code === "rate_limit" ? 429 : 400
    );
  }
  return value as T;
}

export async function rate(req: NextRequest, kind: "sms" | "check" | "staff" | "scan", phone = "") {
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const key = (v: string) =>
    createHmac("sha256", process.env.TICKET_RATE_SECRET!).update(v).digest("hex");
  const limits = [
    {
      key: `${kind}:ip:${key(ip)}`,
      max: kind === "scan" ? 120 : kind === "staff" ? 8 : 20,
      seconds: 600,
    },
  ];
  if (kind === "sms") {
    const max = Math.min(500, Math.max(1, Number(process.env.TICKET_SMS_DAILY_LIMIT) || 60));
    limits.push(
      { key: `sms:phone:${key(phone)}`, max: 3, seconds: 3600 },
      { key: "sms:global", max, seconds: 86400 }
    );
  }
  if (kind === "staff") limits.push({ key: "staff:global", max: 40, seconds: 600 });
  await rpc("limit", { limits });
}

async function twilio(path: string, values: Record<string, string>) {
  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/${path}`,
    {
      method: "POST",
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(values),
    }
  );
  if (!res.ok)
    throw new TicketError(
      res.status === 429
        ? "Patientez avant de demander un nouveau code."
        : "La vérification n’a pas abouti. Vérifiez le code ou demandez-en un nouveau.",
      res.status === 429 ? 429 : 400
    );
  return res.json() as Promise<{ status: string; sid: string }>;
}
export async function sendVerification(phone: string) {
  const value = await twilio("Verifications", { To: phone, Channel: "sms", Locale: "fr" });
  if (value.status !== "pending" || !/^VE[a-fA-F0-9]{32}$/.test(value.sid))
    throw new TicketError("Le SMS n’a pas pu être envoyé.", 503);
  return value.sid;
}
export async function checkVerification(sid: string, code: string) {
  const value = await twilio("VerificationCheck", { VerificationSid: sid, Code: code });
  if (value.status !== "approved" || value.sid !== sid)
    throw new TicketError("Le code est incorrect ou a expiré.");
}
export function staffPassword(value: string): boolean {
  const [, salt, expected] = (process.env.TICKET_STAFF_PASSWORD_HASH ?? "").split(":");
  if (!salt || !expected || value.length > 200) return false;
  const actual = scryptSync(value, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
export { TICKET_RULES_VERSION };
