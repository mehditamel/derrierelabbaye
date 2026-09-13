import type { Metadata } from "next";
import Link from "next/link";
import { configured, rpc } from "@/lib/ticket-or/server";
import { TICKET_RULES_VERSION, type GameState, ticketDate } from "@/lib/ticket-or/types";
import { site } from "@/data/site";
import styles from "@/components/ticket-or/TicketOr.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fonctionnement et règlement — Ticket d’Or",
  robots: { index: false, follow: true },
};

export default async function TicketRulesPage() {
  let state: GameState | null = null;
  if (configured()) {
    try {
      state = await rpc<GameState>("state");
    } catch {
      /* Ne jamais inventer les dates ou la dotation en cas d'indisponibilité. */
    }
  }
  const campaign = state?.campaign;
  return (
    <section className={styles.rules}>
      <div className={styles.rulesInner}>
        <p className={styles.eyebrow}>Le Ticket d’Or de l’Abbaye</p>
        <h1>
          Le plaisir du jeu.
          <br />
          <em>Des règles claires.</em>
        </h1>
        {!campaign ? (
          <div className={styles.rulesNotice}>
            <strong>Version de préparation — le jeu n’est pas ouvert.</strong>
            <p>
              L’aperçu permet de découvrir le grattage et un bon fictif. Aucune inscription, aucun
              SMS et aucun lot réel ne sont délivrés dans cette démonstration. Les dates, la
              dotation et les modalités définitives seront publiées avant l’ouverture.
            </p>
          </div>
        ) : (
          <div className={styles.rulesNotice}>
            <strong>{campaign.title}</strong>
            <p>
              Du {ticketDate(campaign.starts_at)} au {ticketDate(campaign.ends_at)}. Les horaires
              exacts sont affichés ci-dessous. Jusqu’à {campaign.max_prizes} cocktails signature à
              remporter.
            </p>
          </div>
        )}
        <h2>1. L’organisateur</h2>
        <p>
          Le jeu est organisé par la SARL DERRIERE L’ABBAYE, SIREN 105 044 291, siège social au 97
          rue Sauveur Tobelem, 13007 Marseille. Les lots sont remis au bar Derrière l’Abbaye, 1 rue
          de l’Abbaye, 13007 Marseille. Contact : <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <h2>2. Qui peut participer ?</h2>
        <p>
          Le jeu est gratuit, sans obligation d’achat, réservé aux personnes physiques majeures
          disposant d’un numéro de mobile français commençant par 06 ou 07. Une participation est
          autorisée par numéro vérifié et par semaine civile, du lundi à 0 h au dimanche à 23 h 59,
          heure de Paris. L’organisateur et les membres de l’équipe ne participent pas.
        </p>
        <h2>3. Dates et attribution des lots</h2>
        {campaign ? (
          <>
            <p>
              Ouverture :{" "}
              {new Date(campaign.starts_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}.
              Clôture :{" "}
              {new Date(campaign.ends_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })},
              heure de Paris, ou dès l’attribution de tous les lots.
            </p>
            <p>
              Chaque participation dispose d’une probabilité de gain de {campaign.probability} %,
              tant que des lots restent disponibles. Le résultat est tiré aléatoirement et
              enregistré avant le grattage. L’animation et les préférences publicitaires n’ont aucun
              effet sur ce résultat. Le nombre de gains est plafonné à {campaign.max_prizes} ; les
              lots non attribués à la clôture ne sont pas redistribués.
            </p>
          </>
        ) : (
          <p>
            Les dates, le nombre maximal de lots et la probabilité de gain doivent être arrêtés et
            publiés avant l’ouverture. Tant que ces éléments ne sont pas publiés, seul l’aperçu est
            disponible.
          </p>
        )}
        <p>
          Une interruption de connexion ne donne pas une nouvelle chance : la participation
          enregistrée et les bons obtenus se retrouvent après vérification du même numéro de
          téléphone.
        </p>
        <h2>4. Le cocktail signature</h2>
        <p>
          Un ticket gagnant donne droit à un cocktail signature individuel, personnalisé dans l’une
          des trois orientations proposées : agrumes, fruits ou herbes. La préparation dépend des
          ingrédients disponibles. Le client signale ses allergies à l’équipe avant la préparation.
          Aucun achat complémentaire n’est nécessaire.
        </p>
        <p>
          {campaign?.alcohol_allowed
            ? "Une version avec ou sans alcool est proposée au choix du gagnant. La remise d’une version alcoolisée exige la présentation d’une preuve de majorité au personnel."
            : "La version sans alcool est proposée. L’éventuelle version alcoolisée doit être expressément annoncée dans la campagne après validation de ses modalités ; elle n’est pas activée par défaut."}
        </p>
        <h2>5. Utiliser son bon</h2>
        <p>
          Le bon est personnel, utilisable une fois dans les 14 jours suivant le gain, pendant les
          horaires d’ouverture du bar. Le QR code ou son code complet doit être présenté à l’équipe,
          qui contrôle le bon en ligne et enregistre son utilisation. Une capture d’écran d’un
          statut « valide » ne constitue pas un contrôle. Le bon ne peut être échangé contre de
          l’argent ni revendu. Les bons déjà gagnés restent honorés jusqu’à leur expiration, même
          après la clôture des participations.
        </p>
        <h2 id="vos-donnees">6. Vos informations et vos choix</h2>
        <p>
          Le prénom et le numéro vérifié permettent de gérer les participations et de remettre les
          bons. Le nom et l’e-mail sont facultatifs. Les préférences de cocktail servent uniquement
          à préparer le lot. La gestion du jeu repose sur l’exécution de son règlement ; les
          contrôles de sécurité visent à prévenir les abus.
        </p>
        <p>
          Recevoir les nouvelles de l’Abbaye par e-mail ou SMS est facultatif et repose sur votre
          consentement séparé pour chaque canal. Refuser ou retirer cet accord ne change pas vos
          chances et n’annule pas un bon. Vous pouvez modifier vos préférences depuis votre espace
          de jeu ou écrire à <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <p>
          Les coordonnées sont conservées jusqu’à 90 jours après votre dernière participation ou
          connexion volontaire, sans effacer un bon encore valable. Pour les nouvelles du bar, les
          coordonnées du canal accepté sont conservées au maximum trois ans après le dernier contact
          volontaire, ou jusqu’au retrait du consentement pour cet usage. Les vérifications expirées
          sont supprimées quotidiennement ; les données de comptage des gains peuvent ensuite être
          conservées sans identité.
        </p>
        <p>
          L’accès est réservé à l’organisateur et aux prestataires nécessaires : hébergement Vercel,
          base Supabase et vérification SMS Twilio, après leur raccordement. Leurs lieux de
          traitement et les garanties applicables aux transferts doivent être vérifiés avant
          l’ouverture. Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation
          de vos données et exercer les droits applicables auprès du bar. Vous pouvez également
          adresser une réclamation à la CNIL.
        </p>
        <h2>7. Incident ou contestation</h2>
        <p>
          En cas de difficulté, contactez le bar avec votre code de bon. Les enregistrements du jeu
          permettent de vérifier la participation et sa remise. Toute demande est examinée par
          l’organisateur ; un incident technique ne justifie pas l’annulation arbitraire d’un gain
          déjà enregistré.
        </p>
        <p>
          Version du document : {TICKET_RULES_VERSION}. L’abus d’alcool est dangereux pour la santé,
          à consommer avec modération.
        </p>
        <Link href="/ticket-or">Revenir au Ticket d’Or</Link>
      </div>
    </section>
  );
}
