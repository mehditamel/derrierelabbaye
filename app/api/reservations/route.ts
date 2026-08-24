/* =====================================================================
   Route de réservation — seul point de sortie vers l'extérieur.

   Le navigateur ne parle plus à aucun tiers : il poste ici, et c'est le
   serveur qui envoie les e-mails via Resend. La clé API ne quitte donc jamais
   le serveur, et l'on dispose d'un endroit unique pour valider, limiter le
   débit et piéger les robots.

   Aucune base de données : la boîte mail du bar fait office de registre.
   ===================================================================== */

import { NextResponse } from "next/server";
import { CRENEAUX_RESERVATION, creneauPasseAParis, isoAParis } from "@/lib/creneaux";
import {
  construireEmailBar,
  construireEmailClient,
  type EmailContenu,
  type ReservationRow,
} from "@/lib/emailsReservation";
import { autoriser } from "@/lib/limiteDebit";
import { emailValide, telephoneValide } from "@/lib/validationReservation";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

const RESEND_URL = "https://api.resend.com/emails";
const FROM_DEFAUT = `${site.nom} <reservations@derrierelabbaye.fr>`;
const DELAI_MINIMUM_MS = 2_000;
const MAX_NOM = 80;
const MAX_MESSAGE = 1_000;

/** Invitation à téléphoner : le repli qui sauve la réservation quand la
 *  mécanique échoue. */
const APPELEZ = `Appelez-nous au ${site.telephoneAffichage}, nous prenons votre table par téléphone.`;

type CorpsRequete = Partial<{
  date: unknown;
  heure: unknown;
  couverts: unknown;
  nom: unknown;
  telephone: unknown;
  email: unknown;
  message: unknown;
  /** Honeypot : invisible aux humains, souvent rempli par les robots. */
  societe: unknown;
  /** Horodatage de montage du formulaire, pour le contrôle temporel. */
  rendu: unknown;
}>;

function erreur(message: string, status: number) {
  return NextResponse.json({ ok: false, erreur: message }, { status });
}

/** Référence lisible « DLA-7F3K », tirée d'une source aléatoire sûre. */
function genererReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const octets = new Uint8Array(4);
  crypto.getRandomValues(octets);
  let suffixe = "";
  for (const octet of octets) suffixe += alphabet[octet % alphabet.length];
  return `DLA-${suffixe}`;
}

function texteNettoye(valeur: unknown, maxLongueur: number): string {
  return typeof valeur === "string" ? valeur.trim().slice(0, maxLongueur) : "";
}

/** Première IP de la chaîne x-forwarded-for (celle du client sur Vercel). */
function cleClient(req: Request): string {
  const chaine = req.headers.get("x-forwarded-for") ?? "";
  return chaine.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "inconnu";
}

/** Valide côté serveur : le client est faillible et contournable. */
function validerDemande(corps: CorpsRequete): { row: ReservationRow } | { message: string } {
  // Toutes les comparaisons de temps se font à l'heure de Marseille : le serveur
  // tourne en UTC, et entre minuit et 2 h la date UTC est encore celle de la veille.
  const date = texteNettoye(corps.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { message: "La date de réservation est invalide." };
  if (date < isoAParis()) return { message: "Cette date est déjà passée." };

  const heure = texteNettoye(corps.heure, 5);
  if (!(CRENEAUX_RESERVATION as readonly string[]).includes(heure)) {
    return { message: "Ce créneau n'est pas proposé à la réservation." };
  }
  // Le formulaire masque déjà les créneaux passés, mais un onglet resté ouvert
  // depuis la veille peut encore les poster : le serveur doit trancher.
  if (creneauPasseAParis(date, heure)) {
    return { message: "Ce créneau vient de passer. Choisissez un horaire plus tard." };
  }

  const couverts = Number(corps.couverts);
  if (!Number.isInteger(couverts) || couverts < 1 || couverts > 20) {
    return { message: "Le nombre de couverts doit être compris entre 1 et 20." };
  }

  const nom = texteNettoye(corps.nom, MAX_NOM);
  if (!nom) return { message: "Indiquez un nom pour la réservation." };

  const telephone = texteNettoye(corps.telephone, 30);
  if (!telephoneValide(telephone)) return { message: "Le numéro de téléphone semble incorrect." };

  const email = texteNettoye(corps.email, 120);
  if (!emailValide(email)) return { message: "L'adresse e-mail semble incorrecte." };

  return {
    row: {
      reference: genererReference(),
      date,
      heure,
      couverts,
      nom,
      telephone: telephone || null,
      email: email || null,
      message: texteNettoye(corps.message, MAX_MESSAGE) || null,
    },
  };
}

async function envoyer(
  apiKey: string,
  from: string,
  to: string,
  contenu: EmailContenu,
  replyTo?: string
): Promise<void> {
  const reponse = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: contenu.sujet,
      text: contenu.texte,
      html: contenu.html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!reponse.ok) {
    throw new Error(`Resend ${reponse.status} : ${await reponse.text()}`);
  }
}

export async function POST(req: Request) {
  if (!autoriser(cleClient(req))) {
    return erreur(`Trop de demandes envoyées depuis cet appareil. ${APPELEZ}`, 429);
  }

  let corps: CorpsRequete;
  try {
    corps = await req.json();
  } catch {
    return erreur("Demande illisible.", 400);
  }

  // Pièges à robots. On répond comme si tout allait bien : un robot ne doit
  // pas apprendre qu'il a été repéré. Aucun humain ne peut atteindre ce cas —
  // le champ est masqué, hors du parcours clavier et des lecteurs d'écran.
  const rendu = Number(corps.rendu);
  const tropRapide = Number.isFinite(rendu) && rendu > 0 && Date.now() - rendu < DELAI_MINIMUM_MS;
  if (texteNettoye(corps.societe, 100) !== "" || tropRapide) {
    return NextResponse.json({ ok: true, reference: genererReference() });
  }

  const verdict = validerDemande(corps);
  if ("message" in verdict) return erreur(verdict.message, 400);
  const row = verdict.row;

  // Mode démo : opt-in explicite, jamais déduit d'une variable absente, et
  // interdit en production. C'est ce qui garantit qu'une confirmation
  // affichée correspond toujours à un e-mail réellement parti.
  if (process.env.RESERVATION_MODE === "demo" && process.env.VERCEL_ENV !== "production") {
    console.info("[réservation · démo] aucun e-mail envoyé :", row);
    return NextResponse.json({ ok: true, reference: row.reference });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY absente : la demande de réservation n'a pas pu être transmise.");
    return erreur(`Le formulaire est momentanément indisponible. ${APPELEZ}`, 503);
  }

  const from = process.env.RESERVATION_FROM ?? FROM_DEFAUT;
  const emailBar = process.env.RESERVATION_EMAIL_BAR ?? site.email;

  // L'e-mail au bar est celui qui compte : c'est lui qui crée la réservation.
  // L'accusé au client est un confort — son échec ne doit pas faire croire au
  // visiteur que sa demande est perdue.
  const [notification, accuse] = await Promise.allSettled([
    envoyer(apiKey, from, emailBar, construireEmailBar(row), row.email ?? undefined),
    row.email
      ? envoyer(apiKey, from, row.email, construireEmailClient(row))
      : Promise.resolve(undefined),
  ]);

  if (notification.status === "rejected") {
    console.error("Échec de la notification au bar :", notification.reason);
    return erreur(`Votre demande n'a pas pu être transmise. ${APPELEZ}`, 502);
  }
  if (accuse.status === "rejected") {
    console.error("Échec de l'accusé de réception client :", accuse.reason);
  }

  return NextResponse.json({ ok: true, reference: row.reference });
}
