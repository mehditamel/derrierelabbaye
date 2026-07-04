/* =====================================================================
   Edge Function Supabase (Deno) — notifier-reservation.

   Déclenchée par un Database Webhook sur INSERT dans `reservations` :
   envoie via Resend un e-mail de notification au bar et, si le client a
   laissé une adresse, un accusé de réception au client.

   Secrets attendus (supabase secrets set …) :
   - RESEND_API_KEY        — clé API Resend (obligatoire)
   - RESERVATION_EMAIL_BAR — destinataire côté bar (défaut : info@derrierelabbaye.fr)
   - RESERVATION_FROM      — expéditeur (défaut : onboarding@resend.dev, à
                             remplacer par une adresse du domaine vérifié)
   - WEBHOOK_SECRET        — si présent, exigé dans l'en-tête x-webhook-secret

   Ce fichier tourne dans Deno : il est exclu du tsc/eslint du site
   (voir tsconfig.json). Les gabarits, purs, sont testés par vitest.
   ===================================================================== */

import {
  construireEmailBar,
  construireEmailClient,
  type EmailContenu,
  type ReservationRow,
} from "./emails.ts";

type WebhookPayload = {
  type: string;
  table: string;
  record: ReservationRow;
};

const RESEND_URL = "https://api.resend.com/emails";

async function envoyer(
  apiKey: string,
  from: string,
  to: string,
  contenu: EmailContenu,
  replyTo?: string
): Promise<void> {
  const reponse = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Méthode non autorisée", { status: 405 });
  }

  // Garde d'origine : le webhook doit présenter le secret partagé s'il est configuré.
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return new Response("Non autorisé", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Corps JSON invalide", { status: 400 });
  }

  // On ne réagit qu'aux créations de demandes de réservation.
  if (payload.type !== "INSERT" || payload.table !== "reservations" || !payload.record) {
    return new Response(JSON.stringify({ ignore: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY manquant : aucun e-mail envoyé.");
    return new Response("RESEND_API_KEY manquant", { status: 500 });
  }
  const from = Deno.env.get("RESERVATION_FROM") ?? "Derrière l'Abbaye <onboarding@resend.dev>";
  const emailBar = Deno.env.get("RESERVATION_EMAIL_BAR") ?? "info@derrierelabbaye.fr";

  const r = payload.record;
  const envois: Promise<void>[] = [
    // Notification au bar — répondre écrit directement au client s'il a laissé un e-mail.
    envoyer(apiKey, from, emailBar, construireEmailBar(r), r.email ?? undefined),
  ];
  if (r.email) {
    envois.push(envoyer(apiKey, from, r.email, construireEmailClient(r)));
  }

  const resultats = await Promise.allSettled(envois);
  const echecs = resultats.filter((x) => x.status === "rejected");
  for (const echec of echecs) {
    console.error("Échec d'envoi :", (echec as PromiseRejectedResult).reason);
  }

  return new Response(
    JSON.stringify({
      reference: r.reference,
      envoyes: resultats.length - echecs.length,
      echecs: echecs.length,
    }),
    {
      // 500 si rien n'est parti : le webhook Supabase pourra retenter.
      status: echecs.length === resultats.length ? 500 : 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
