/* =====================================================================
   Gabarits des e-mails de réservation (Edge Function notifier-reservation).

   Module volontairement autonome (aucun import du reste du site) : la
   fonction est déployée seule sur Supabase (Deno). Les coordonnées du bar
   sont donc dupliquées ici — à garder synchronisées avec data/site.ts.
   Logique pure, couverte par emails.test.ts (vitest).
   ===================================================================== */

export type ReservationRow = {
  reference: string;
  date: string; // yyyy-mm-dd
  heure: string; // "20:00"
  couverts: number;
  nom: string;
  telephone: string | null;
  email: string | null;
  message: string | null;
};

export type EmailContenu = {
  sujet: string;
  texte: string;
  html: string;
};

/* ⚑ Synchroniser avec data/site.ts si ces informations changent. */
const BAR = {
  nom: "Derrière l'Abbaye",
  adresse: "1 rue de l'Abbaye, 13007 Marseille",
  telephone: "04 91 92 18 62",
  legal: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.",
} as const;

const formatLong = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** « jeudi 18 mars 2027 » — midi local : aucun glissement de fuseau. */
export function dateLongue(dateIso: string): string {
  return formatLong.format(new Date(`${dateIso}T12:00:00`));
}

function couvertsTexte(n: number): string {
  return `${n} couvert${n > 1 ? "s" : ""}`;
}

/** Coquille HTML sobre, aux couleurs de la marque (ivoire, encre, or). */
function envelopperHtml(corps: string): string {
  return `<div style="background:#F8F3E9;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#2A2620;">
  <div style="max-width:560px;margin:0 auto;background:#F2ECDB;border:1px solid #A8884C;padding:32px;">
${corps}
  </div>
</div>`;
}

function ligneOr(): string {
  return `<hr style="border:none;border-top:1px solid #A8884C;margin:24px 0;" />`;
}

/** E-mail envoyé au client (si une adresse a été laissée). */
export function construireEmailClient(r: ReservationRow): EmailContenu {
  const quand = `${dateLongue(r.date)} à ${r.heure}`;
  const sujet = `Votre demande de réservation — ${r.reference}`;

  const texte = [
    `Bonjour ${r.nom},`,
    ``,
    `Nous avons bien reçu votre demande de table pour ${couvertsTexte(r.couverts)}, le ${quand}.`,
    `Votre référence : ${r.reference}.`,
    ``,
    `Nous revenons vers vous rapidement pour la confirmer. D'ici là, rien à faire — si vos plans changent, un coup de fil suffit.`,
    ``,
    `À très vite,`,
    `${BAR.nom} — ${BAR.adresse}`,
    `${BAR.telephone}`,
    ``,
    BAR.legal,
  ].join("\n");

  const html = envelopperHtml(`
    <p style="margin:0 0 16px;">Bonjour ${r.nom},</p>
    <p style="margin:0 0 16px;">
      Nous avons bien reçu votre demande de table pour <strong>${couvertsTexte(r.couverts)}</strong>,
      le <strong>${quand}</strong>.
    </p>
    <p style="margin:0 0 16px;">Votre référence : <strong>${r.reference}</strong>.</p>
    <p style="margin:0;">
      Nous revenons vers vous rapidement pour la confirmer. D'ici là, rien à faire —
      si vos plans changent, un coup de fil suffit.
    </p>
    ${ligneOr()}
    <p style="margin:0;font-size:14px;">À très vite,<br />${BAR.nom} — ${BAR.adresse}<br />${BAR.telephone}</p>
    <p style="margin:16px 0 0;font-size:11px;color:#6b6353;">${BAR.legal}</p>
  `);

  return { sujet, texte, html };
}

/** E-mail de notification envoyé au bar. */
export function construireEmailBar(r: ReservationRow): EmailContenu {
  const quand = `${dateLongue(r.date)} à ${r.heure}`;
  const sujet = `Nouvelle demande de réservation — ${quand}, ${couvertsTexte(r.couverts)} (${r.reference})`;

  const lignes = [
    `Nouvelle demande de réservation à confirmer.`,
    ``,
    `Référence : ${r.reference}`,
    `Date : ${quand}`,
    `Couverts : ${r.couverts}`,
    `Nom : ${r.nom}`,
    ...(r.telephone ? [`Téléphone : ${r.telephone}`] : []),
    ...(r.email ? [`E-mail : ${r.email}`] : []),
    ...(r.message ? [``, `Message :`, r.message] : []),
  ];
  const texte = lignes.join("\n");

  const detail = (label: string, valeur: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b6353;white-space:nowrap;">${label}</td><td style="padding:4px 0;"><strong>${valeur}</strong></td></tr>`;

  const html = envelopperHtml(`
    <p style="margin:0 0 16px;">Nouvelle demande de réservation à confirmer.</p>
    <table style="border-collapse:collapse;font-size:15px;">
      ${detail("Référence", r.reference)}
      ${detail("Date", quand)}
      ${detail("Couverts", String(r.couverts))}
      ${detail("Nom", r.nom)}
      ${r.telephone ? detail("Téléphone", r.telephone) : ""}
      ${r.email ? detail("E-mail", r.email) : ""}
    </table>
    ${r.message ? `${ligneOr()}<p style="margin:0;font-style:italic;">${r.message}</p>` : ""}
  `);

  return { sujet, texte, html };
}
