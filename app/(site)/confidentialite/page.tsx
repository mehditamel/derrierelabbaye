import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { site } from "@/data/site";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité du site de Derrière l'Abbaye : vos demandes de réservation nous parviennent par e-mail, pas de cookies de suivi.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <section className={styles.page}>
      <div className="u-container u-narrow">
        <div className={styles.head}>
          <SectionLabel>Informations</SectionLabel>
          <h1 className={styles.title}>Confidentialité</h1>
          <GoldRule className={styles.rule} />
          <p className={styles.updated}>Dernière mise à jour : 10 juin 2026</p>
        </div>

        <div className={styles.prose}>
          <h2>En bref</h2>
          <p>
            Ce site ne demande pas de compte et ne pose aucun traceur publicitaire. Rien n'est
            transmis, à une exception près : la demande de réservation, qui nous est envoyée par
            e-mail. Tout le reste demeure sur votre appareil.
          </p>

          <h2>Demande de réservation</h2>
          <p>
            Les informations saisies (date, heure, nombre de couverts, nom et, si vous les indiquez,
            téléphone, e-mail et message) nous sont transmises par e-mail afin que nous puissions
            traiter votre demande. Elles ne servent qu'à cela, ne sont pas utilisées à des fins
            publicitaires et ne sont conservées dans aucune base de données : elles restent dans
            notre messagerie. L'acheminement est assuré par notre prestataire d'envoi d'e-mails,
            Resend (Plus Five Five, Inc., États-Unis). Si vous nous laissez une adresse, vous
            recevez un accusé de réception. Dans l'application, vos coordonnées peuvent en outre
            être mémorisées sur votre appareil uniquement, pour pré-remplir le formulaire la fois
            suivante.
          </p>

          <h2>Programme de fidélité</h2>
          <p>
            Les points de fidélité de l'aperçu sont stockés dans votre navigateur (localStorage) et
            ne sont jamais transmis. Vous pouvez les effacer via « Réinitialiser l'aperçu » ou les
            réglages de votre navigateur.
          </p>

          <h2>Stockage technique</h2>
          <p>Le site mémorise sur votre appareil, sans transmission :</p>
          <ul>
            <li>votre choix de masquer l'invite d'installation de l'app ;</li>
            <li>
              une copie hors-ligne de la carte et des pages de l'app (cache du service worker), pour
              consulter la carte sans réseau.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>Aucun cookie de suivi, aucune mesure d'audience, aucune publicité.</p>

          <h2>Services tiers</h2>
          <p>
            La page d'accueil intègre un plan Google Maps (iframe). Son chargement transmet votre
            adresse IP à Google — voir leur{" "}
            <a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noreferrer">
              politique de confidentialité
            </a>
            . Les polices de caractères sont servies avec le site, sans requête vers un service
            externe.
          </p>

          <h2>Contact</h2>
          <p>
            Une question sur vos données ? <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
