export const TICKET_RULES_VERSION = "2026-09-13";
export const FLAVOURS = ["agrumes", "fruits", "herbes"] as const;
export type Flavour = (typeof FLAVOURS)[number];
export type CocktailChoice = { flavour: Flavour; alcohol: boolean };
export type Ticket = {
  id: string;
  won: boolean;
  code: string | null;
  expires_at: string | null;
  redeemed_at: string | null;
  flavour: Flavour;
  alcohol: boolean;
  alcohol_allowed: boolean;
  created_at: string;
};
export type Campaign = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  max_prizes: number;
  awarded: number;
  probability: number;
  alcohol_allowed: boolean;
  rules_version: string;
};
export type Player = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  email_opt_in: boolean;
  sms_opt_in: boolean;
};
export type GameState = {
  mode: "preview" | "live";
  available: boolean;
  campaign: Campaign | null;
  player: Player | null;
  tickets: Ticket[];
  played: boolean;
  next_play_at: string | null;
};
export type StaffTicket = Ticket & { first_name: string; status: "valid" | "used" | "expired" };

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 30) return null;
  let phone = value.replace(/[\s().-]/g, "");
  if (phone.startsWith("0033")) phone = `+33${phone.slice(4)}`;
  if (/^0[67]\d{8}$/.test(phone)) phone = `+33${phone.slice(1)}`;
  return /^\+33[67]\d{8}$/.test(phone) ? phone : null;
}

export function registration(value: Record<string, unknown>): Player | string {
  const first_name = typeof value.first_name === "string" ? value.first_name.trim() : "";
  const last_name = typeof value.last_name === "string" ? value.last_name.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  const phone = normalizePhone(value.phone);
  if (!first_name || first_name.length > 60 || last_name.length > 60)
    return "Indiquez votre prénom (60 caractères maximum).";
  if (!phone) return "Indiquez un numéro de mobile français valide, commençant par 06 ou 07.";
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    return "Vérifiez votre adresse e-mail.";
  if (value.adult !== true || value.rules !== true)
    return "Le jeu est réservé aux majeurs. Acceptez le règlement pour participer.";
  if (value.email_opt_in === true && !email)
    return "Renseignez un e-mail pour recevoir les nouvelles par e-mail.";
  return {
    first_name,
    last_name,
    phone,
    email,
    email_opt_in: value.email_opt_in === true,
    sms_opt_in: value.sms_opt_in === true,
  };
}

export function validChoice(value: Record<string, unknown>): CocktailChoice | null {
  return FLAVOURS.includes(value.flavour as Flavour) && typeof value.alcohol === "boolean"
    ? { flavour: value.flavour as Flavour, alcohol: value.alcohol }
    : null;
}

export function extractCoupon(value: string): string | null {
  const text = value.trim();
  // Scanner une URL ne provoque jamais de navigation vers cette URL.
  const code = text.includes("#bon=") ? text.split("#bon=")[1] : text;
  return /^DLA-[A-F0-9]{24}$/.test(code) ? code : null;
}

export function ticketDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(value));
}
